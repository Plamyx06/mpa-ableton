import {
    convertFormDataToJSON,
    isDir,
    isFile,
    readBody,
    readJSON,
    writeJSON,
} from "/home/plamyx/mpa-ableton/src/utils.js";


const ARTICLES_DATA_PATH = "src/data/articles.json"

async function addDataAtAllArticles(data) {
    const articles = await readJSON(data);

    for (const article of articles) {
        article.createdAt = new Date().toISOString();
        article.updatedAt = ""
        article.status = "published";
    }

    await writeJSON(data, articles);
}

addDataAtAllArticles(ARTICLES_DATA_PATH)
