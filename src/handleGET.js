import dotenv from "dotenv";
dotenv.config();
import { isDir, isFile, readJSON, render404, response302 } from "./utils.js";
import { readFile } from "fs/promises";
import nunjucks from "nunjucks";
import path from "path";
import cookie from "cookie";

const ARTICLES_DATA_PATH = "src/data/articles.json";
const ARTICLE_CATEGORIES_DATA_PATH = "src/data/article-categories.json";
const HEADER_DATA_PATH = "src/data/header.json";
const FOOTER_DATA_PATH = "src/data/footer.json";
const USER_DATA_PATH = "src/data/user.json";

export async function handleGET(response, requestURLData, request) {
  const extname = path.extname(requestURLData.pathname);
  if (extname !== "") {
    if (extname === ".js") {
      const fileName = path.basename(requestURLData.pathname);
      const filePath = `src/script/${fileName}`;
      await renderFilePath(response, filePath);
      return;
    } else {
      const assetsFilePath = `src/assets${requestURLData.pathname}`;
      await renderFilePath(response, assetsFilePath);
      return;
    }
  } else if (requestURLData.pathname.startsWith("/api")) {
    await handleAPIRequest(request, requestURLData, response);
    return;
  } else if (
    requestURLData.pathname !== "/login" &&
    requestURLData.pathname !== "/login/register"
  ) {
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

  const category = await readJSON(ARTICLE_CATEGORIES_DATA_PATH);
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const navbar = await readJSON(HEADER_DATA_PATH);
  const footer = await readJSON(FOOTER_DATA_PATH);
  const users = await readJSON(USER_DATA_PATH);
  const userConnect = await FindEmailWithCookie(request);
  const searchParams = Object.fromEntries(requestURLData.searchParams);

  const templateData = {
    searchParams: searchParams,
    articles: articles,
    category: category,
    navbar: navbar.navbar,
    navbarLogo: navbar.logoNavbar,
    userConnect: userConnect,
    users: users,
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
async function handleAPIRequest(request, requestURLData, response) {
  const secret = process.env.SECRET_API;
  const authorizationApi = request.headers.authorization;
  const dataApi = [
    { path: "/api/articles", dataPath: ARTICLES_DATA_PATH },
    {
      path: "/api/articles-categories",
      dataPath: ARTICLE_CATEGORIES_DATA_PATH,
    },
    { path: "/api/header", dataPath: HEADER_DATA_PATH },
    { path: "/api/footer", dataPath: FOOTER_DATA_PATH },
  ];

  for (const api of dataApi) {
    if (requestURLData.pathname === api.path) {
      if (authorizationApi !== secret) {
        response.status = 403;
        response.end("Accès refusé");
        return;
      }
      const data = await readJSON(api.dataPath);
      response.statusCode = 200;
      response.end(JSON.stringify(data));
      return;
    }
  }
}
