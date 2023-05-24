import db, { sql } from "../src/database.js";
import { readJSON } from "../src/utils.js";

const ARTICLES_DATA_PATH = "src/data/articles.json";
const ARTICLE_CATEGORIES_DATA_PATH = "src/data/article-categories.json";
const USER_DATA_PATH = "src/data/user.json";
const dataArticle = await readJSON(ARTICLES_DATA_PATH);
const dataArticleCategories = await readJSON(ARTICLE_CATEGORIES_DATA_PATH);
const dataUser = await readJSON(USER_DATA_PATH);
async function run() {
  await db.tx(async (db) => {
    /*    for (const article of dataArticle) {
      await db.query(sql`
        INSERT INTO article (
          id,
          title, 
          status, 
          categoryId, 
          image, 
          content, 
          createdAt, 
          updatedAt, 
          created_by, 
          updated_by
        )
        VALUES (
          ${article.id},
          ${article.title}, 
          ${article.status}, 
          ${article.categoryId}, 
          ${article.image}, 
          ${article.content}, 
          ${article.createdAt}, 
          ${article.updatedAt}, 
          ${article.created_by}, 
          ${article.updated_by}
        )
      `);
    }
    for (const articleCategories of dataArticleCategories) {
      await db.query(sql`
  INSERT INTO article_category (
    categoryId,
    name,
    createdAt,
    updatedAt
  )
  VALUES (
    ${articleCategories.categoryId},
    ${articleCategories.name},
    ${articleCategories.createdAt},
    ${articleCategories.updatedAt || null})
`);
    }
 */
    /*   for (const user of dataUser) {
      await db.query(sql`
    INSERT INTO "user" (
      email,
      password,
      session_id,
      user_id
    )
    VALUES (
      ${user.email},
      ${user.password},
      ${user.sessionId},
      ${user.userId})`);
    }
  */
  });

  await db.dispose();
  console.log("Insertion de données réussie.");
}
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
