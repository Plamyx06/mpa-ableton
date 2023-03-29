import { isDir, isFile, readJSON, render404 } from './utils.js';
import { readFile } from "fs/promises";
import nunjucks from 'nunjucks';
import path from 'path';

const ARTICLES_DATA_PATH = "src/data/articles.json";
const CATEGORY_DATA_PATH = "src/data/category.json";

export async function handleGET(response, requestURLData) {
    if (path.extname(requestURLData.pathname) !== "") {
        const assetsFilePath = `src/assets${requestURLData.pathname}`;
        await renderFilePath(response, assetsFilePath);
        return;
    }
    if (path.basename(requestURLData.pathname).length === 10) {
        const articleId = path.basename(requestURLData.pathname)
        requestURLData.pathname = "/articles/edit";
        requestURLData.searchParams.set("id", articleId);
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
    const category = await readJSON(CATEGORY_DATA_PATH);
    const articles = await readJSON(ARTICLES_DATA_PATH);
    const searchParams = Object.fromEntries(requestURLData.searchParams);
    const templateData = {
        searchParams: searchParams,
        articles: articles,
        category: category,
        articleIndex: articles.findIndex(
            (articles) => articles.id === searchParams.id
        ),
        formatDate: formatDateInJSON,
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
function formatDateInJSON(dateStr, twoFirstLetterCountry) {
    const date = new Date(dateStr);
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    };
    const formattedDate = date.toLocaleDateString(twoFirstLetterCountry, options);
    return formattedDate;
}
