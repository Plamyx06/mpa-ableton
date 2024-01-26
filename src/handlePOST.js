import { convertFormDataToJSON, readBody, response302 } from "./utils.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import cookie from "cookie";
import * as argon2 from "argon2";
import { z } from "zod";
import db from "./database.js";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);
  const targetId = path.basename(requestURLData.pathname);

  if (requestURLData.pathname === "/articles/create") {
    const addArticle = await addNewArticle(form, request);
    console.log({ addArticle });
    if (!addArticle) {
      response302(response, `/articles/create?failed=true`);
    } else {
      response302(response, `/articles?createSuccess=true`);
    }
  } else if (targetId === form.id) {
    await editedArticle(form);
    response302(response, `/articles?editSuccess=true`);
  } else if (requestURLData.pathname === "/articles/delete") {
    await deleteArticle(form);
    response302(response, `/articles?deleteSuccess=true`);
  } else if (requestURLData.pathname === "/login") {
    await handleLoginRequest(response, form);
  } else if (requestURLData.pathname === "/register") {
    await handleRegisterRequest(response, form);
  } else if (requestURLData.pathname === "/logout") {
    await handleLogoutRequest(request, response);
  } else if (requestURLData.pathname === "/header/edit") {
    await editedDataHeader(form);
    response302(response, `/header?editHeaderSuccess=true`);
  } else if (requestURLData.pathname === "/footer/edit") {
    await editedDataFooter(form);
    response302(response, `/footer?editFooterSuccess=true`);
  } else if (requestURLData.pathname === "/article-category/edit") {
    await editedCategoryArticle(form);
    response302(response, `/category?editCategorySuccess=true`);
  } else if (requestURLData.pathname === "/article-category/add") {
    await addNewCategoryArticle(form);
    response302(response, `/category?createCategorySuccess=true`);
  } else if (requestURLData.pathname === "/article-category/delete") {
    await deleteCategoryArticle(form);
    response302(response, `/category?deleteCategorySuccess=true`);
  }
}

async function addNewArticle(form, request) {
  const articleSchema = z.object({
    title: z.string().min(3).max(255),
    status: z.enum(["draft", "published"]),
    category_id: z.string().uuid(),
    image: z.string().url(),
    content: z.string(),
  });
  const validatedArticle = articleSchema.safeParse(form);
  console.log({ validatedArticle });

  if (!validatedArticle.success) {
    console.log("Validation de l'article échouée:", validatedArticle.error);
    return validatedArticle.success;
  } else {
    form.updated_at = null;
    form.created_by = await findUserWithCookie(request);
    form.updated_by = null;

    await db("article").insert(form);
    return validatedArticle.success;
  }
}

async function editedArticle(form) {
  const updatedBy = "7ea82967-3bbf-4aa4-89a2-44624bcb73e6";
  const editData = {
    title: form.title,
    image: form.image,
    category_id: form.category,
    content: form.content,
    updated_at: new Date().toISOString(),
    status: form.status,
    updated_by: updatedBy,
  };
  await db("article").update(editData).where({ id: form.id });

  return editData;
}
async function deleteArticle(form) {
  await db("article").del().where({ id: form.id });
}
async function deleteCategoryArticle(form) {
  await db("article_category").del().where({ id: form.id });
}
async function editedDataHeader(form) {
  const headerData = await db("header_link").select("*");
  const navbarLogoData = await db("header_logo").select("*");
  console.log({ form });
  navbarLogoData[0].logo_svg = form.logoSvg;
  await db("header_logo").update({ logo_svg: navbarLogoData[0].logo_svg });

  for (const index in headerData) {
    const titleKey = `title_${index}`;
    const hrefKey = `href_${index}`;
    headerData[index].title = form[titleKey];
    headerData[index].href = form[hrefKey];

    const id = headerData[index].id;
    const title = headerData[index].title;
    const href = headerData[index].href;

    await db("header_link").update({ title, href }).where({ id });
  }
  console.log("Header data is edited");
}
async function editedDataFooter(form) {
  const footer = await db("footer_link")
    .select("*")
    .orderBy("main_title", "asc");
  const footerDataSection1 = footer.slice(0, 3);
  const footerDataSection2 = footer.slice(3, 6);
  const socialLink = await db("social_link").select("*");

  for (const data of footerDataSection1) {
    const id = data.id;
    const index = footerDataSection1.indexOf(data);
    const titleKey = `section1Title_${index}`;
    const hrefKey = `section1Href_${index}`;
    const title = form[titleKey];
    const href = form[hrefKey];

    data.title = title;
    data.href = href;

    await db("footer_link").update({ title, href }).where({ id });
  }

  for (const data of footerDataSection2) {
    const id = data.id;
    const index = footerDataSection2.indexOf(data);
    const titleKey = `section2Title_${index}`;
    const hrefKey = `section2Href_${index}`;
    const title = form[titleKey];
    const href = form[hrefKey];
    const mainTitle = form.mainTitle;

    data.title = title;
    data.href = href;
    data.main_title = mainTitle;

    await db("footer_link")
      .update({ title, href, main_title: mainTitle })
      .where({ id });
  }

  for (const data of socialLink) {
    const id = data.id;
    const index = socialLink.indexOf(data);
    const hrefKey = `socialHref_${index}`;
    const href = form[hrefKey];
    data.href = href;

    await db("social_link").update({ href }).where({ id });
  }
  console.log("Footer data is edited");
}
async function addNewCategoryArticle(form) {
  form.updated_at = null;
  await db("article_category").insert(form);
  console.log("New category added successfully.");
}
async function editedCategoryArticle(form) {
  for (const key in form) {
    if (key.includes("id_")) {
      const id = form[key];
      const nameKey = key.replace("id_", "name_");
      const name = form[nameKey];
      await db("article_category").update({ name }).where({ id });
    }
  }
  console.log("article-category is edited");
}
async function handleLoginRequest(response, form) {
  const users = await db("user").select("*");

  const user = users.find((user) => user.email === form.email);
  const verifyPassword = await argon2.verify(
    `$argon2id$v=19$m=65536,t=4,p=${user.password}`,
    form.password
  );

  if (user && verifyPassword) {
    const trx = await db.transaction();
    user.session_id = uuidv4();
    const id = user.session_id;
    const maxAge = 3600 * 7;
    await db("user").where("email", form.email).update({ session_id: id });
    response.setHeader(
      "Set-Cookie",
      `session_id=${id} ; HttpOnly; Max-Age=${maxAge}; Path=/`
    );
    response302(response, "/?connectSuccess=true");
  } else {
    response302(response, "/login?connectFail=true");
  }
}
async function handleLogoutRequest(request, response) {
  const cookieObject = request.headers.cookie;
  const cookieParse = cookie.parse(cookieObject);
  const cookieId = cookieParse.session_id;

  if (cookieId) {
    await db("user")
      .where({ session_id: cookieId })
      .update({ session_id: null });
  }
  response.setHeader("Set-Cookie", "session_id=; HttpOnly; Max-Age=0; Path=/");
  response302(response, "/login");
}
async function handleRegisterRequest(response, form) {
  const users = await db("user").select("*");
  const UserSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(100)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/),
  });
  const validatedUser = UserSchema.safeParse(form);

  const userExist = users.find((user) => user.email === form.email);
  if (userExist) {
    response302(response, "/register?userExist=true");
    return;
  }
  if (!validatedUser.success) {
    response302(response, "/register?validationFailed=true");
    return;
  } else {
    const hashedPassword = await argon2.hash(form.password, {
      timeCost: 4,
      hashLength: 16,
    });
    const hashedSplit = hashedPassword.split("=");
    const hash = hashedSplit[4];
    const session = {
      email: form.email,
      password: hash,
      session_id: null,
    };
    await db("user").insert(session);
    response302(response, "/login?createAccount=true");
  }
}

async function findUserWithCookie(request) {
  const users = await db("user").select("*");
  const objCookie = request.headers.cookie;
  const cookies = cookie.parse(objCookie || "");
  const cookieId = cookies.session_id;
  const foundUser = users.find((user) => user.session_id === cookieId);
  if (foundUser) {
    return foundUser.user_id;
  }
}
