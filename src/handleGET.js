import * as dotenv from "dotenv";
dotenv.config();
import {
  isDir,
  isFile,
  render404,
  response302,
  fetchDataFromTable,
} from "./utils.js";
import { readFile } from "fs/promises";
import nunjucks from "nunjucks";
import path from "path";
import cookie from "cookie";

export async function handleGET(response, requestURLData, request) {
  const extname = path.extname(requestURLData.pathname);
  if (extname !== "") {
    if (extname === ".js") {
      const fileName = path.basename(requestURLData.pathname);
      const filePath = `src/script/${fileName}`;
      response.setHeader("Content-Type", "application/javascript");
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
    requestURLData.pathname !== "/register"
  ) {
    const objCookie = request.headers.cookie;
    const cookies = cookie.parse(objCookie || "");
    const cookieId = cookies.session_id;
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
    const idExist = await isId(basenameURL);
    if (idExist) {
      templatePath = `src/template/articles/edit.njk`;
    }
  } else {
    render404(response);
    return;
  }

  const category = await fetchDataFromTable("article_category");
  const articles = await fetchDataFromTable("article", "created_at", "desc");
  const headerSvg = await fetchDataFromTable("header_logo");
  const headerLink = await fetchDataFromTable("header_link");
  const footer = await fetchDataFromTable("footer_link", "main_title", "asc");
  const users = await fetchDataFromTable("user");
  const socialLink = await fetchDataFromTable("social_link");
  const userConnect = await findEmailWithCookie(request, users);
  const searchParams = Object.fromEntries(requestURLData.searchParams);

  const templateData = {
    searchParams: searchParams,
    articles: articles,
    category: category,
    header: headerLink,
    headerSvg: headerSvg[0],
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
async function handleAPIRequest(request, requestURLData, response) {
  const secret = process.env.SECRET_API;

  const authorizationApi = request.headers.authorization;
  const dataApi = [
    {
      path: "/api/articles",
      dataTable: "article",
      orderBy: "created_at",
      orderDirection: "desc",
    },
    {
      path: "/api/articles-categories",
      dataTable: "article_category",
    },
    { path: "/api/header", dataTable: "header_link" },
    {
      path: "/api/footer",
      dataTable: "footer_link",
      orderBy: "main_title",
      orderDirection: "asc",
    },
    { path: "/api/social-link", dataTable: "social_link" },
    { path: "/api/header-logo", dataTable: "header_logo" },
  ];

  for (const api of dataApi) {
    if (requestURLData.pathname === api.path) {
      if (authorizationApi !== secret) {
        response.status = 403;
        response.end("Accès refusé");
        return;
      }
      const data = await fetchDataFromTable(
        api.dataTable,
        api.orderBy,
        api.orderDirection
      );
      response.statusCode = 200;
      response.end(JSON.stringify(data));
      return;
    }
  }
}
