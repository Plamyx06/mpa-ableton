import {
  convertFormDataToJSON,
  readBody,
  readJSON,
  writeJSON,
  response302,
} from "./utils.js";
import path from "path";
import { customAlphabet } from "nanoid";
import cookie from "cookie";
import * as argon2 from "argon2";

const ARTICLES_DATA_PATH = "src/data/articles.json";
const USER_DATA_PATH = "src/data/user.json";
const HEADER_DATA_PATH = "src/data/header.json";
const FOOTER_DATA_PATH = "src/data/footer.json";
const ARTICLE_CATEGORIES_DATA_PATH = "src/data/article-categories.json";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);
  const targetId = path.basename(requestURLData.pathname);
  if (requestURLData.pathname === "/articles/create") {
    await writeJSON(
      ARTICLES_DATA_PATH,
      await addIdAndDateAtArticles(form, request)
    );
    response302(response, `/articles?createSuccess=true`);
  } else if (targetId === form.id) {
    await editedData(ARTICLES_DATA_PATH, form, request);
    response302(response, `/articles?editSuccess=true`);
  } else if (requestURLData.pathname === "/articles/delete") {
    await deleteData(ARTICLES_DATA_PATH, form);
    response302(response, `/articles?deleteSuccess=true`);
  } else if (requestURLData.pathname === "/login") {
    await handleLoginRequest(response, form);
  } else if (requestURLData.pathname === "/login/register") {
    await handleRegisterRequest(response, form);
  } else if (requestURLData.pathname === "/logout") {
    await handleLogoutRequest(request, response);
  } else if (requestURLData.pathname === "/header/edit") {
    await editedDataNavbar(HEADER_DATA_PATH, form);
    response302(response, `/header?editHeaderSuccess=true`);
  } else if (requestURLData.pathname === "/footer/edit") {
    editedDataFooter(FOOTER_DATA_PATH, form);
    response302(response, `/footer?editFooterSuccess=true`);
  } else if (requestURLData.pathname === "/article-category/edit") {
    await editedDataCategory(ARTICLE_CATEGORIES_DATA_PATH, form);
    response302(response, `/category?editCategorySuccess=true`);
  } else if (requestURLData.pathname === "/article-category/add") {
    await writeJSON(
      ARTICLE_CATEGORIES_DATA_PATH,
      await addIdAndDateAtCategory(form)
    );
    response302(response, `/category?createCategorySuccess=true`);
  } else if (requestURLData.pathname === "/article-category/delete") {
    await deleteData(ARTICLE_CATEGORIES_DATA_PATH, form);
    response302(response, `/category?deleteCategorySuccess=true`);
  }
}
async function addIdAndDateAtArticles(form, request) {
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);
  form.createdAt = new Date().toISOString();
  form.id = nanoid();
  form.updatedAt = "";
  form.created_by = await FindUserIdWithCookie(request);
  form.updated_by = null;
  articles.categoryId = form.categoryId;
  articles.unshift(form);
  return articles;
}
async function editedData(jsonPath, form, request) {
  const data = await readJSON(jsonPath);
  const foundData = data.find((foundData) => foundData.id === form.id);
  const updatedBy = await FindUserIdWithCookie(request);

  const editData = {
    title: form.title,
    image: form.image,
    category: form.category,
    content: form.content,
    updatedAt: new Date().toISOString(),
    status: form.status,
    updated_by: updatedBy,
  };
  Object.assign(foundData, editData);

  const editedData = await writeJSON(jsonPath, data);
  return editedData;
}
async function deleteData(jsonPath, form) {
  const data = await readJSON(jsonPath);
  const dataIndex = data.findIndex((foundData) => foundData.id === form.id);
  data.splice(dataIndex, 1);
  await writeJSON(jsonPath, data);
}
async function editedDataNavbar(jsonPath, form) {
  const data = await readJSON(jsonPath);
  const navbarData = data.navbar;
  const navbarLogoData = data.logoNavbar;
  navbarLogoData.logoSvg = form.logoSvg;

  for (let i = 0; i < navbarData.length; i++) {
    navbarData[i].title = form[`title_${i}`];
    navbarData[i].href = form[`href_${i}`];
  }
  const editedData = await writeJSON(jsonPath, data);
  return editedData;
}
async function editedDataFooter(jsonPath, form) {
  const data = await readJSON(jsonPath);
  const footerSection1Data = data.footer.mainFooter1;
  const footerSection2Data = data.footer.mainFooter2;
  const footerSocialLinkData = data.footer.socialLink;
  const footerTitleSection2 = data.footer.footer2;
  footerTitleSection2.mainTitle = form.mainTitle;

  for (let i = 0; i < footerSection1Data.length; i++) {
    footerSection1Data[i].title = form[`section1Title_${i}`];
    footerSection1Data[i].href = form[`section1Href_${i}`];
  }
  for (let i = 0; i < footerSection2Data.length; i++) {
    footerSection2Data[i].title = form[`section2Title_${i}`];
    footerSection2Data[i].href = form[`section2Href_${i}`];
  }
  for (let i = 0; i < footerSocialLinkData.length; i++) {
    footerSocialLinkData[i].href = form[`socialHref_${i}`];
  }
  const editedData = await writeJSON(jsonPath, data);
  return editedData;
}
async function addIdAndDateAtCategory(form) {
  const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 5);
  form.id = nanoid();
  form.createdAt = new Date().toISOString();
  form.updatedAt = "";
  const category = await readJSON(ARTICLE_CATEGORIES_DATA_PATH);
  category.push(form);
  return category;
}
async function editedDataCategory(jsonPath, form) {
  const data = await readJSON(jsonPath);
  const CategoryData = data;
  for (let i = 0; i < CategoryData.length; i++) {
    CategoryData[i].name = form[`name_${i}`];
  }
  const editedData = await writeJSON(jsonPath, data);
  return editedData;
}
async function handleLoginRequest(response, form) {
  const users = await readJSON(USER_DATA_PATH);
  const user = users.find((user) => user.email === form.email);
  const verifyPassword = await argon2.verify(
    `$argon2id$v=19$m=65536,t=4,p=${user.password}`,
    form.password
  );
  if (user && verifyPassword) {
    const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 20);
    user.sessionId = nanoid();
    await writeJSON(USER_DATA_PATH, users);
    const id = user.sessionId;
    const maxAge = 3600 * 7;
    response.setHeader(
      "Set-Cookie",
      `sessionId=${id} ; HttpOnly; Max-Age=${maxAge}; Path=/`
    );
    response302(response, "/articles?connectSuccess=true");
  } else {
    response302(response, "/login?connectFail=true");
  }
}
async function handleLogoutRequest(request, response) {
  const users = await readJSON(USER_DATA_PATH);
  const cookieObject = request.headers.cookie;
  const cookieParse = cookie.parse(cookieObject);
  const cookieId = cookieParse.sessionId;
  const user = users.find((user) => user.sessionId === cookieId);
  if (user) {
    user.sessionId = "";
    await writeJSON(USER_DATA_PATH, users);
  }
  response.setHeader("Set-Cookie", "sessionId=; HttpOnly; Max-Age=0; Path=/");
  response302(response, "/login");
}
async function handleRegisterRequest(response, form) {
  const users = await readJSON(USER_DATA_PATH);
  const userExist = users.find((user) => user.email === form.email);
  if (userExist) {
    response302(response, "/login/register?userExist=true");
  } else {
    const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 8);

    const hashedPassword = await argon2.hash(form.password, {
      timeCost: 4,
      hashLength: 16,
    });
    const hashedSplit = hashedPassword.split("=");
    const hash = hashedSplit[4];
    const session = {
      email: form.email,
      password: hash,
      sessionId: "",
      createdAt: new Date().toISOString(),
      sessionId: nanoid(),
    };
    users.push(session);
    await writeJSON(USER_DATA_PATH, users);
    response302(response, "/login?createAccount=true");
  }
}
async function FindUserIdWithCookie(request) {
  const users = await readJSON(USER_DATA_PATH);
  const objCookie = request.headers.cookie;
  const cookies = cookie.parse(objCookie || "");
  const cookieId = cookies.sessionId;
  const foundUser = users.find((user) => user.sessionId === cookieId);
  console.log({ foundUser });
  if (foundUser) {
    return foundUser.userId;
  }
}
