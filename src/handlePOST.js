import {
  convertFormDataToJSON,
  readBody,
  readJSON,
  writeJSON,
  response302,
} from "./utils.js";
import path from "path";
import { customAlphabet } from "nanoid";

const ARTICLES_DATA_PATH = "src/data/article.json";
const USER_DATA_PATH = "src/data/user.json";
const HEADER_DATA_PATH = "src/data/header.json";
const FOOTER_DATA_PATH = "src/data/footer.json";
const CATEGORY_DATA_PATH = "src/data/category.json";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);
  const targetId = path.basename(requestURLData.pathname);
  if (requestURLData.pathname === "/articles/create") {
    await writeJSON(ARTICLES_DATA_PATH, await addIdAndDateAtArticles(form));
    response302(response, `/articles?createSuccess=true`);
  } else if (targetId === form.id) {
    await editedData(ARTICLES_DATA_PATH, form);
    response302(response, `/articles?editSuccess=true`);
  } else if (requestURLData.pathname === "/article/delete") {
    await deleteData(ARTICLES_DATA_PATH, form);
    response302(response, `/articles?deleteSuccess=true`);
  } else if (requestURLData.pathname === "/login") {
    const users = await readJSON(USER_DATA_PATH);
    const user = users.find((user) => user.email === form.email);
    if (user && form.password === user.password) {
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
  } else if (requestURLData.pathname === "/logout") {
    response.setHeader("Set-Cookie", "sessionId=; HttpOnly; Max-Age=0; Path=/");
    response302(response, "/login");
  } else if (requestURLData.pathname === "/header/edit") {
    await editedDataNavbar(HEADER_DATA_PATH, form);
    response302(response, `/header?editHeaderSuccess=true`);
  } else if (requestURLData.pathname === "/footer/edit") {
    editedDataFooter(FOOTER_DATA_PATH, form);
    response302(response, `/footer?editFooterSuccess=true`);
  } else if (requestURLData.pathname === "/article-category/edit") {
    await editedDataCategory(CATEGORY_DATA_PATH, form);
    response302(response, `/category?editCategorySuccess=true`);
  } else if (requestURLData.pathname === "/article-category/add") {
    await writeJSON(CATEGORY_DATA_PATH, await addIdAndDateAtCategory(form));
    response302(response, `/category?createCategorySuccess=true`);
  } else if (requestURLData.pathname === "/article-category/delete") {
    await deleteData(CATEGORY_DATA_PATH, form);
    response302(response, `/category?deleteCategorySuccess=true`);
  }
}

async function addIdAndDateAtArticles(form) {
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);
  form.createdAt = new Date().toISOString();
  form.id = nanoid();
  form.updatedAt = "";
  articles.categoryId = form.categoryId;
  articles.unshift(form);
  return articles;
}
async function editedData(jsonPath, form) {
  const data = await readJSON(jsonPath);
  const foundData = data.find((foundData) => foundData.id === form.id);
  const editData = {
    title: form.title,
    image: form.image,
    category: form.category,
    content: form.content,
    updatedAt: new Date().toISOString(),
    status: form.status,
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
  const category = await readJSON(CATEGORY_DATA_PATH);
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
