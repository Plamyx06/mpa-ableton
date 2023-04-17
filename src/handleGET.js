import { isDir, isFile, readJSON, render404, response302 } from "./utils.js";
import { readFile } from "fs/promises";
import nunjucks from "nunjucks";
import path from "path";
import cookie from "cookie";

const ARTICLES_DATA_PATH = "src/data/articles.json";
const CATEGORY_DATA_PATH = "src/data/category.json";
const HEADER_DATA_PATH = "src/data/header.json";
const FOOTER_DATA_PATH = "src/data/footer.json";
const USER_DATA_PATH = "src/data/user.json";

export async function handleGET(response, requestURLData, request) {
  if (path.extname(requestURLData.pathname) !== "") {
    const assetsFilePath = `src/assets${requestURLData.pathname}`;
    await renderFilePath(response, assetsFilePath);
    return;
  } else if (requestURLData.pathname === "/api/articles") {
    const authHeader = request.headers.authorization;
    const secret = "lemotdepassecpasse";
    if (authHeader !== secret) {
      response.writeHead(403);
      response.end();
      return;
    }
    const articles = await readJSON(ARTICLES_DATA_PATH);
    response.end(JSON.stringify(articles));
    return;
  } else if (requestURLData.pathname === "/api/articles-categories") {
    const authHeader = request.headers.authorization;
    const secret = "lemotdepassecpass";
    if (authHeader !== secret) {
      response.writeHead(403);
      response.end();
      return;
    }
    const category = await readJSON(CATEGORY_DATA_PATH);
    response.end(JSON.stringify(category));
    return;
  } else if (requestURLData.pathname === "/api/footer") {
    const footer = await readJSON(FOOTER_DATA_PATH);
    response.end(JSON.stringify(footer));
    return;
  } else if (requestURLData.pathname === "/api/header") {
    const header = await readJSON(HEADER_DATA_PATH);
    response.end(JSON.stringify(header));
    return;
  } else if (requestURLData.pathname !== "/login") {
    const objCookie = request.headers.cookie;
    const cookies = cookie.parse(objCookie || "");
    const cookieId = cookies.sessionId;

    if (!(await verifyUserSessionId(cookieId))) {
      response302(response, "/login?connectFail=true");
      return;
    }
  }

  const basenameURL = path.basename(requestURLData.pathname);
  let templatePath = `src/template${requestURLData.pathname}`;

  if (await isDir(templatePath)) {
    templatePath = path.join(templatePath, "index.njk");
  } else if (await isFile(`${templatePath}.njk`)) {
    templatePath = `${templatePath}.njk`;
  } else if (requestURLData.pathname === `/articles/${basenameURL}`) {
    const idExist = await isId(basenameURL, ARTICLES_DATA_PATH);
    if (idExist) {
      templatePath = `src/template/articles/edit.njk`;
    }
  } else {
    render404(response);
    return;
  }

  const category = await readJSON(CATEGORY_DATA_PATH);
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const navbar = await readJSON(HEADER_DATA_PATH);
  const footer = await readJSON(FOOTER_DATA_PATH);
  const userConnect = await FindEmailWithCookie(request);

  const searchParams = Object.fromEntries(requestURLData.searchParams);
  const templateData = {
    searchParams: searchParams,
    articles: articles,
    category: category,
    navbar: navbar.navbar,
    navbarLogo: navbar.logoNavbar,
    userConnect: userConnect,
    footer: {
      section1: footer.footer.mainFooter1,
      titleSection2: footer.footer.footer2,
      section2: footer.footer.mainFooter2,
      socialLink: footer.footer.socialLink,
    },
    editArticlesIndex: articles.findIndex(
      (articles) => articles.id === basenameURL
    ),
  };
  console.log({ templateData });
  const html = nunjucks.render(templatePath, templateData);
  response.end(html);
}
async function renderFilePath(response, filePath) {
  if (await isFile(filePath)) {
    const fileContent = await readFile(filePath);
    response.end(fileContent);
  } else {
    render404(response);
  }
}
async function isId(targetId, jsonPath) {
  const data = await readJSON(jsonPath);
  return !!data.find(({ id }) => id === targetId);
}
async function verifyUserSessionId(id) {
  const users = await readJSON(USER_DATA_PATH);
  return !!users.find((user) => user.sessionId === id);
}
async function FindEmailWithCookie(request) {
  const users = await readJSON(USER_DATA_PATH);
  const objCookie = request.headers.cookie;
  const cookies = cookie.parse(objCookie || "");
  const cookieId = cookies.sessionId;
  const foundUser = users.find((user) => user.sessionId === cookieId);

  if (foundUser) {
    return foundUser.email;
  }
}
