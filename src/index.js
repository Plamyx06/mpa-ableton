import * as dotenv from "dotenv";
dotenv.config();
import http from "http";
import nunjucks from "nunjucks";
import {
  render404,
  formatDate,
  getPropertyById,
  createArticleSlug,
} from "./utils.js";
import { handlePOST } from "./handlePOST.js";
import { handleGET } from "./handleGET.js";

let env = nunjucks.configure({
  noCache: true,
});
env.addFilter("formattedDate", formatDate);
env.addFilter("getPropertyById", getPropertyById);
env.addFilter("createArticleSlug", createArticleSlug);

const PORT = process.env.PORT;

const server = http.createServer(async (request, response) => {
  try {
    await handleServer(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal server error");
  }
});

async function handleServer(request, response) {
  const requestURLData = new URL(request.url, `http://localhost:${PORT}`);
  console.info(`\n---\nRequest ${new Date().getTime()}`, {
    method: request.method,
    url: request.url,
    requestURLData,
  });

  if (request.method === "GET") {
    await handleGET(response, requestURLData, request);
  } else if (request.method === "POST") {
    await handlePOST(request, response, requestURLData);
  } else {
    render404(response);
  }
}

server.listen(PORT, () => {
  console.info(`Server started on port ${PORT}`);
});
