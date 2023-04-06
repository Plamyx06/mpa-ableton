import { isDir, isFile, readJSON, render404 } from './utils.js';
import { readFile } from "fs/promises";
import nunjucks from 'nunjucks';
import path from 'path';

const ARTICLES_DATA_PATH = "src/data/articles.json";
const CATEGORY_DATA_PATH = "src/data/category.json";
const NAVBARFOOTER_DATA_PATH = "src/data/global.json";


export async function handleGET(response, requestURLData) {

    if (path.extname(requestURLData.pathname) !== "") {
        const assetsFilePath = `src/assets${requestURLData.pathname}`;
        await renderFilePath(response, assetsFilePath);
        return;
    }
    if (requestURLData.pathname === "/api/articles") {
        const articles = await readJSON(ARTICLES_DATA_PATH);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(articles));
    }
    if (requestURLData.pathname === "/api/category") {
        const category = await readJSON(CATEGORY_DATA_PATH);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(category));
    }
    if (requestURLData.pathname === "/api/global") {
        const global = await readJSON(NAVBARFOOTER_DATA_PATH);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(global));
    }


    const basenameURL = path.basename(requestURLData.pathname)
    let templatePath = `src/template${requestURLData.pathname}`;
    if (await isDir(templatePath)) {
        templatePath = path.join(templatePath, "index.njk");
    } else if (await isFile(`${templatePath}.njk`)) {
        templatePath = `${templatePath}.njk`;

    } else if (requestURLData.pathname === `/articles/${basenameURL}`) {
        const idExist = await isId(basenameURL, ARTICLES_DATA_PATH)
        if (idExist) {
            templatePath = `src/template/articles/edit.njk`
        }
    }
    else {
        render404(response);
        return;
    }

    const category = await readJSON(CATEGORY_DATA_PATH);
    const articles = await readJSON(ARTICLES_DATA_PATH);
    const navbarFooter = await readJSON(NAVBARFOOTER_DATA_PATH);
    const searchParams = Object.fromEntries(requestURLData.searchParams);
    const templateData = {
        searchParams: searchParams,
        articles: articles,
        category: category,
        navbar: navbarFooter.navbar,
        navbarLogo: navbarFooter.logoNavbar,
        footer: {
            section1: navbarFooter.footer.mainFooter1,
            titleSection2: navbarFooter.footer.footer2,
            section2: navbarFooter.footer.mainFooter2,
            socialLink: navbarFooter.footer.socialLink
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
    const data = await readJSON(jsonPath)
    const foundId = data.find(({ id }) => id === targetId);
    if (foundId) {
        return true;
    } else {
        return false;
    }
}



