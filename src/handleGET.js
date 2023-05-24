import * as dotenv from "dotenv";
dotenv.config();
import { isDir, isFile, readJSON, render404, response302 } from "./utils.js";
import { readFile } from "fs/promises";
import nunjucks from "nunjucks";
import path from "path";
import cookie from "cookie";
import db from "./database.js";

//const ARTICLES_DATA_PATH = "src/data/articles.json";
//const ARTICLE_CATEGORIES_DATA_PATH = "src/data/article-categories.json";
//const HEADER_DATA_PATH = "src/data/header.json";
//const FOOTER_DATA_PATH = "src/data/footer.json";
//const USER_DATA_PATH = "src/data/user.json";

export async function handleGET(response, requestURLData, request) {
  const extname = path.extname(requestURLData.pathname);
  if (extname !== "") {
    if (extname === ".js") {
      const fileName = path.basename(requestURLData.pathname);
      const filePath = `src/script/${fileName}`;
      response.setHeader("Content-Type", "application/javascript");
      console.log({ filePath });
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
  } /* else if (
    requestURLData.pathname !== "/login" &&
    requestURLData.pathname !== "/register"
  ) {
    const objCookie = request.headers.cookie;
    const cookies = cookie.parse(objCookie || "");
    const cookieId = cookies.session_id;
    if (!(await verifyUserSessionId(cookieId))) {
      response302(response, "/login?connectFail=true");
      return;
    }
  }*/

  const basenameURL = path.basename(requestURLData.pathname);
  let templatePath = `src/template${requestURLData.pathname}`;

  if (await isDir(templatePath)) {
    templatePath = path.join(templatePath, "index.njk");
  } else if (await isFile(`${templatePath}.njk`)) {
    templatePath = `${templatePath}.njk`;
  } else if (requestURLData.pathname === `/articles/${basenameURL}`) {
    const idExist = await isId(basenameURL);
    if (idExist) {
      templatePath = `src/template/articles/edit.njk`;
    }
  } else {
    render404(response);
    return;
  }

  const category = await fetchDataFromTable("article_category");
  const articles = await fetchDataFromTable("article");
  const headerSvg = await fetchDataFromTable("header");
  const headerLink = await fetchDataFromTable("header_link");
  const footer = await fetchDataFromTable("footer_link");
  const users = await fetchDataFromTable("user");
  const socialLink = await fetchDataFromTable("social_link");
  const userConnect = await findEmailWithCookie(request, users);
  const searchParams = Object.fromEntries(requestURLData.searchParams);

  const templateData = {
    searchParams: searchParams,
    articles: articles,
    category: category,
    header: headerLink,
    headerSvg: headerSvg,
    userConnect: userConnect,
    users: users,
    footer: footer,
    socialLink: socialLink,

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

async function isId(targetId) {
  const data = await fetchDataFromTable("article");
  return !!data.find(({ id }) => id === targetId);
}

async function verifyUserSessionId(id) {
  const users = await fetchDataFromTable("user");
  return !!users.find((user) => user.session_id === id);
}

async function findEmailWithCookie(request, users) {
  const objCookie = request.headers.cookie;
  const cookies = cookie.parse(objCookie || "");
  const cookieId = cookies.session_id;
  const foundUser = users.find((user) => user.session_id === cookieId);

  if (foundUser) {
    return foundUser.email;
  }
}
/*async function handleAPIRequest(request, requestURLData, response) {
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
}*/
async function fetchDataFromTable(tableName) {
  const trx = await db.transaction();
  try {
    const data = await trx(tableName).select("*");
    await trx.commit();
    return data;
  } catch (error) {
    await trx.rollback();
    throw error;
  } finally {
    await trx.destroy();
  }
}
