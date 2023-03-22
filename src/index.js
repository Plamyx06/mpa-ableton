import http from "http";
import nunjucks from "nunjucks";
import {
  convertFormDataToJSON,
  isDir,
  isFile,
  readBody,
  readJSON,
  writeJSON,
} from "./utils.js";
import path from "path";
import { readFile } from "fs/promises";
import { v4 as uuidv4 } from 'uuid'

nunjucks.configure({
  noCache: true,
});


const ARTICLES_DATA_PATH = "src/data/articles.json";
const PORT = 3000;

const server = http.createServer(async (request, response) => {
  try {
    await handleServer(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal server error");
  }
});

async function handleServer(request, response) {
  const requestURLData = new URL(request.url, `http://localhost:${PORT}`);
  console.info(`\n---\nRequest ${new Date().getTime()}`, {
    method: request.method,
    url: request.url,
    requestURLData,
  });

  if (request.method === "GET") {
    if (path.extname(requestURLData.pathname) !== "") {
      const assetsFilePath = `src/assets${requestURLData.pathname}`;
      await renderFilePath(response, assetsFilePath);
      return;
    }

    let templatePath = `src/template${requestURLData.pathname}`;
    if (await isDir(templatePath)) {
      templatePath = path.join(templatePath, "index.njk");
    } else if (await isFile(`${templatePath}.njk`)) {
      templatePath = `${templatePath}.njk`;
    } else {
      render404(response);
      return;
    }
    const templateData = {
      searchParams: Object.fromEntries(requestURLData.searchParams),
      articles: await readJSON(ARTICLES_DATA_PATH),
    };
    const articleIndex = templateData.articles.findIndex((article) => article.id === templateData.searchParams.id);
    templateData.articleIndex = articleIndex;
    const html = nunjucks.render(templatePath, templateData);
    response.end(html);
  } else if (request.method === "POST") {
    const body = await readBody(request);
    const form = convertFormDataToJSON(body);
    if (requestURLData.pathname === "/create") {
      await writeJSON(ARTICLES_DATA_PATH, await addIdAndDateAtArticles(form))
      response.statusCode = 302;
      response.setHeader(
        "Location",
        `/articles?page=1`
      );
      response.end()
    } else if (requestURLData.pathname === "/edit") {

      const articles = await readJSON(ARTICLES_DATA_PATH);
      const articleIndex = articles.findIndex((article) => article.id === form.id);
      const editArticle = {
        title: form.title,
        image: form.image,
        category: form.category,
        content: form.content,
        date: setDate(new Date())
      };
      Object.assign(articles[articleIndex], editArticle);

      await writeJSON(ARTICLES_DATA_PATH, articles);
      response.statusCode = 302;
      response.setHeader(
        "Location",
        `/?submitSuccess=true`
      );
      response.end();
    }
    else if (requestURLData.pathname === "/delete") {
      const articles = await readJSON(ARTICLES_DATA_PATH);
      const articleIndex = articles.findIndex((article) => article.id === form.id);
      articles.splice(articleIndex, 1);
      await writeJSON(ARTICLES_DATA_PATH, articles);
      response.statusCode = 302;
      response.setHeader(
        "Location",
        `/?deleteSuccess=true`
      );
      response.end();
    }
  }
  else {
    render404(response);
  }
}

server.listen(PORT, () => {
  console.info(`Server started on port ${PORT}`);
});

async function renderFilePath(response, filePath) {
  if (await isFile(filePath)) {
    const fileContent = await readFile(filePath);
    response.end(fileContent);
  } else {
    render404(response);
  }
}
function render404(response) {
  const html = nunjucks.render(`src/template/404.njk`);
  response.statusCode = 404;
  response.end(html);
}
function setDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  };
  let strDate = date.toLocaleDateString(`fr`, options);
  return strDate;
}
async function addIdAndDateAtArticles(form) {
  const date = new Date();
  form.date = setDate(date)
  form.id = uuidv4();
  const articles = await readJSON(ARTICLES_DATA_PATH);
  articles.unshift(form);
  return articles
}

