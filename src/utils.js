import fs from "fs/promises";
import nunjucks from "nunjucks";
import slugify from "@sindresorhus/slugify";
import db from "./database.js";

export async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

export async function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("error", (err) => {
      reject(err);
    });
    request.on("end", () => {
      resolve(body);
    });
  });
}

export function convertFormDataToJSON(formData) {
  return Object.fromEntries(new URLSearchParams(formData));
}

export async function readJSON(jsonPath) {
  const dataStr = await fs.readFile(jsonPath);
  const data = JSON.parse(dataStr);
  return data;
}

export async function isFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

export async function isDir(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

export async function writeJSON(jsonPath, jsonData) {
  const dataStr = JSON.stringify(jsonData, null, 2);
  await fs.writeFile(jsonPath, dataStr);
  return jsonData;
}

export function render404(response) {
  const html = nunjucks.render(`src/template/404.njk`);
  response.statusCode = 404;
  response.end(html);
}
export function formatDate(dateStr) {
  const date = new Date(dateStr);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "Europe/Paris",
  };

  const formatter = new Intl.DateTimeFormat("fr-FR", options);
  const formattedDate = formatter.format(date);

  return formattedDate.replace(":", "h");
}

export function response302(response, pathRedirect) {
  response.statusCode = 302;
  response.setHeader("Location", pathRedirect);
  response.end();
}

export function getPropertyById(id, data) {
  const result = data.find((item) => item.user_id === id || item.id === id);
  return result ? result.email || result.name : null;
}

export function createArticleSlug(title, id) {
  const slug = `${slugify(title)}-${id}`;
  return slug;
}
export async function fetchDataFromTable(tableName, orderBy, orderDirection) {
  const trx = await db.transaction();
  let query = trx(tableName).select("*");

  if (orderBy) {
    query = query.orderBy(orderBy, orderDirection);
  }
  const data = await query;

  await trx.commit();
  await trx.destroy();

  return data;
}
