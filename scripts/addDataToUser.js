import {
  convertFormDataToJSON,
  isDir,
  isFile,
  readBody,
  readJSON,
  writeJSON,
} from "/home/plamyx/mpa-ableton/src/utils.js";

const ARTICLE_DATA_PATH = "src/data/articles.json";
const userIds = ["isounmnp", "rqm5t2mg", "l04jtzxc"];

const articles = await readJSON(ARTICLE_DATA_PATH);

for (const article of articles) {
  article.created_by = random(userIds);
  article.updated_by = null;
}

await writeJSON(ARTICLE_DATA_PATH, articles);

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
