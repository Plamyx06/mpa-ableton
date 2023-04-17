import * as argon2 from "argon2";
import {
  isDir,
  isFile,
  readJSON,
  render404,
  response302,
} from "../src/utils.js";

const password = "12341234";

const options = {
  timeCost: 4,
  hashLength: 16,
};
const hashedPassword = await argon2.hash(password, options);
const hashedSplit = hashedPassword.split("=");
const hash = hashedSplit[4];

const passHash = "4$5IUzEI9vX3iN7x7Qd6FkfA$irntlmWAADwM1y7ElQZQLg";
const verify = await argon2.verify(
  `$argon2id$v=19$m=65536,t=4,p=${passHash}`,
  password
);
console.log({ verify });
