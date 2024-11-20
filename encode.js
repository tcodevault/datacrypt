const fs = require("fs");
const path = require("path");
const fsPromise = require("fs/promises");
const archiver = require("archiver");
const crypto = require("crypto");
const cli = require("./cli");

require('dotenv').config()

async function encode() {
  const config = cli.readEncodeParams(true);
  if (!config) {
    return;
  }

  if (!config.password) {
    console.log("Missing password.");
    return;
  }

  if (!config.algorithm) {
    console.log("Missing Crypto Algorithm.");
    return;
  }

  if (!config.hashAlgorithm) {
    console.log("Missing Hash Algorithm.");
    return;
  }

  const fileTree = await readDir(config.fullpath, config.ignore);
  const outputPath = path.resolve(config.destFolder, "encoded");
  const output = fs.createWriteStream(outputPath);

  const iv = Buffer.alloc(16, 0);
  iv.write(config.password);
  const key = crypto
    .createHash(config.hashAlgorithm)
    .update(config.password)
    .digest("base64")
    .substring(0, 32);
  const cipher = crypto.createCipheriv(config.algorithm, key, iv);

  zipFiles(config.fullpath, fileTree, cipher, output);
}

async function readDir(path, ignorePaths) {
  const result = [];

  try {
    const files = await fsPromise.readdir(path);
    for (const f of files) {
      const filepath = path + "/" + f;

      if (ignorePaths.some((ipath) => filepath.includes(ipath))) {
        continue;
      }

      const stats = await fsPromise.stat(filepath);
      if (stats.isDirectory()) {
        result.push({
          name: f,
          isDirectory: true,
          children: await readDir(filepath, ignorePaths),
        });
      } else {
        result.push({
          name: f,
          isDirectory: false,
        });
      }
    }

    return result;
  } catch (err) {
    console.error(err);
    console.error("Cannot read dir", path);
  }
}

function zipFiles(src, fileTree, cipher, outputStream) {
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  archive.on("warning", (err) => {
    console.log(`WARN -> ${err}`);
  });

  archive.on("error", (err) => {
    console.log(`ERROR -> ${err}`);
  });

  archive.pipe(cipher).pipe(outputStream);

  appendFile(archive, src, "data", fileTree);

  archive.finalize();
}

function appendFile(archive, srcPath, zipPath, fileTree) {
  fileTree.forEach((file) => {
    if (file.isDirectory) {
      appendFile(
        archive,
        `${srcPath}/${file.name}`,
        `${zipPath}/${file.name}`,
        file.children
      );
    } else {
      archive.file(`${srcPath}/${file.name}`, {
        name: `${zipPath}/${file.name}`,
      });
    }
  });
}

encode();
