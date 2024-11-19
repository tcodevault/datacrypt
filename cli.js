const readlineSync = require("readline-sync");

const readEncodeParams = (doubleCheck = false) => {
  const fullpath = readlineSync.question("Full path: ").replaceAll('\'', '');
  let password = readlineSync.question("Password: ", { hideEchoBack: true });
  let confirmPassword = doubleCheck
    ? readlineSync.question("Confirm Password: ", { hideEchoBack: true })
    : "";

  while (doubleCheck && password !== confirmPassword) {
    console.log("Password does not match. Please enter password again. \n\n");

    password = readlineSync.question("Password: ", { hideEchoBack: true });
    confirmPassword = readlineSync.question("Password: ", {
      hideEchoBack: true,
    });
  }

  const algorithm = readlineSync.question("Crypto Algorithm: ");
  const hashAlgorithm = readlineSync.question("Hash Algorithm: ");
  const ignore = readlineSync.question(
    "Ignore patterns(.DS_Store, .vscode, .settings, .git, .mvn): "
  );
  const ignoreArray = ignore
    .split(",")
    .map((p) => p.trim())
    .filter((p) => !!p);

  const data = {
    fullpath,
    password,
    algorithm: algorithm || process.env.DEFAULT_ALGORITHM,
    hashAlgorithm: hashAlgorithm || process.env.DEFAULT_HASH,
    destFolder: process.env.DEST_FOLDER || __dirname,
    ignore: [
      ".DS_Store",
      ".vscode",
      ".settings",
      ".git",
      ".mvn",
      ...ignoreArray,
    ],
  };

  console.log({
    ...data,
    password: "",
  });

  const confirmed = readlineSync.keyInYN("Do you want to continue(yes/no)? ");

  if (confirmed) {
    return data;
  }

  return null;
};

module.exports = { readEncodeParams };
