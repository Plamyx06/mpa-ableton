import db from "./database.js";
import {
  convertFormDataToJSON,
  readBody,
  readJSON,
  writeJSON,
  response302,
} from "./utils.js";
import { v4 as uuidv4 } from "uuid";

/*async function fetchDataFromTable(tableName) {
  const trx = await db.transaction();
  try {
    const data = await trx(tableName).select("*");
    await trx.commit();
    await trx.destroy();
    return data;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

/*async function writeSessionId(users) {
  const sessionId = "dhsdfhsdfgeherghrfghnsr";
  const userId = "tuzkq5rl";
  const user = users.find((user) => user.user_id === userId);

  if (user) {
    const trx = await db.transaction();
    try {
      await trx("user")
        .where("user_id", userId)
        .update({ session_id: sessionId });
      await trx.commit();
      await trx.destroy();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}*/

/*async function deleteSessionId(users) {
  const userId = "tuzkq5rl";
  const user = users.find((user) => user.user_id === userId);

  if (user) {
    const trx = await db.transaction();
    try {
      await trx("user").where("user_id", userId).update({ session_id: "" });

      await trx.commit();
      await trx.destroy();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}*/

/*async function main() {
  try {
    const users = await fetchDataFromTable("user");
    console.log("Données des utilisateurs récupérées :", users);

    await writeSessionId(users);
    console.log("Mise à jour de l'ID de session effectuée avec succès !");
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
  }
}
main();*/

/*async function addNewUser() {
  const users = await fetchDataFromTable("user");
  const addUsers = {
    email: "elo@gmail.com",
    password: "4$6OQqO6qRHDq4GfnosE5NCw$seEG6bDQYpWcGfFuyRpi3g",
    session_id: "",
    user_id: "tuzkk5rl",
  };
  const user = !!users.find((user) => addUsers.user_id === user.user_id);
  if (!user) {
    const trx = await db.transaction();
    try {
      await trx("user").insert(addUsers);
      await trx.commit();
      await trx.destroy();
      console.log("New user added successfully.");
      process.exit();
    } catch (error) {
      await trx.rollback();
      console.error(error);
      process.exit();
    }
  } else {
    console.log("The user already exists.");
    process.exit();
  }
}
await addNewUser();*/

/*async function insertArticles() {
  const articles = await readJSON("src/data/articles.json");
  try {
    await db.transaction(async (trx) => {
      for (const article of articles) {
        await trx("article").insert({
          title: article.title,
          status: article.status,
          image: article.image,
          content: article.content,
          created_at: article.createdAt,
          category_id: article.categoryId,
          created_by: article.created_by,
        });
      }
    });
    console.log("Articles inserted successfully!");
  } catch (error) {
    console.error("Error inserting articles:", error);
  } finally {
    db.destroy();
  }
}

insertArticles();*/

/*async function remplaceCat() {
  const articles = await readJSON("src/data/articles.json");

  const findCategory = "6r34v";
  const replaceCategory = "10bc9011-d521-435f-a32f-dd1b5e7f325d";

  for (const article of articles) {
    if (article.categoryId === findCategory) {
      article.categoryId = replaceCategory;
    }
  }

  await writeJSON("src/data/articles.json", articles);
}

remplaceCat();
// artist,download,tutorials,news,videos,loop*/

export async function fetchDataFromTable(tableName) {
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
