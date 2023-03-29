import {
    convertFormDataToJSON,
    readBody,
    readJSON,
    writeJSON,
} from "./utils.js"
import path from "path";
import { customAlphabet } from "nanoid";

const ARTICLES_DATA_PATH = "src/data/articles.json";
const USER_DATA_PATH = "src/data/user.json"

export async function handlePOST(request, response, requestURLData) {
    const body = await readBody(request);
    const form = convertFormDataToJSON(body);
    const articleId = path.basename(requestURLData.pathname);

    if (requestURLData.pathname === "/articles/create") {
        await writeJSON(ARTICLES_DATA_PATH, await addIdAndDateAtArticles(form));
        response.statusCode = 302;
        response.setHeader("Location", `/articles?createSuccess=true`);
        response.end();
    } else if (articleId === form.id) {
        await editDataArticles(ARTICLES_DATA_PATH, response, form)

    } else if (requestURLData.pathname === "/delete") {
        const articles = await readJSON(ARTICLES_DATA_PATH);
        const articleIndex = articles.findIndex(
            (article) => article.id === form.id
        );
        articles.splice(articleIndex, 1);
        await writeJSON(ARTICLES_DATA_PATH, articles);
        response.statusCode = 302;
        response.setHeader("Location", `/articles?deleteSuccess=true`);
        response.end();
    }
    else if (requestURLData.pathname === "/login") {
        const users = await readJSON(USER_DATA_PATH);
        const emailIndex = users.findIndex(
            (user) => user.email === form.email
        );
        console.log({ emailIndex })

        if (emailIndex !== -1 && form.email === users[emailIndex].email && form.password === users[emailIndex].password) {
            response.statusCode = 302;
            response.setHeader("Location", `/articles?connectSuccess=true`);
            response.end();
        } else {
            response.statusCode = 302;
            response.setHeader("Location", `/login?connectFail=true`);
            response.end();
        }
    }
}
async function addIdAndDateAtArticles(form) {
    const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);
    form.createdAt = new Date().toISOString();
    form.id = nanoid();
    const articles = await readJSON(ARTICLES_DATA_PATH);
    articles.unshift(form);
    return articles;
}
async function editDataArticles(jsonPath, response, form) {
    const articles = await readJSON(jsonPath);
    const articleIndex = articles.findIndex(
        (article) => article.id === form.id
    );
    const editArticle = {
        title: form.title,
        image: form.image,
        category: form.category,
        content: form.content,
        updateAt: new Date().toISOString(),
        status: form.status
    };
    Object.assign(articles[articleIndex], editArticle);

    await writeJSON(jsonPath, articles);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?editSuccess=true`);
    response.end();
}
