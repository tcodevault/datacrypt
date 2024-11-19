const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cli = require('./cli');

require('dotenv').config()

function decode() {
  const config = cli.readEncodeParams();
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

  const inputStream = fs.createReadStream(config.fullpath);

  const iv = Buffer.alloc(16, 0);
  iv.write(config.password);
  const key = crypto
    .createHash(config.hashAlgorithm)
    .update(config.password)
    .digest("base64")
    .substring(0, 32);
  const decipher = crypto.createDecipheriv(config.algorithm, key, iv);

  const dest = path.resolve(config.destFolder, 'decoded.zip');
  const outputStream = fs.createWriteStream(dest);

  inputStream.pipe(decipher).pipe(outputStream);
}

decode();
