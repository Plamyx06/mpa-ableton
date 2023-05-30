import {
  convertFormDataToJSON,
  readBody,
  response302,
  fetchDataFromTable,
} from "./utils.js";
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
    await addNewArticle(form, request);
    response302(response, `/articles?createSuccess=true`);
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
  form.updated_at = null;
  form.created_by = await findUserWithCookie(request);
  form.updated_by = null;

  const trx = await db.transaction();
  await trx("article").insert(form);
  await trx.commit();
  await trx.destroy();
}
async function editedArticle(form) {
  const trx = await db.transaction();
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
  await trx("article").update(editData).where({ id: form.id });
  await trx.commit();
  return editData;
}
async function deleteArticle(form) {
  const trx = await db.transaction();

  await trx("article").del().where({ id: form.id });
  await trx.commit();
  await trx.destroy();
}
async function deleteCategoryArticle(form) {
  const trx = await db.transaction();
  await trx("article_category").del().where({ id: form.id });
  await trx.commit();
  await trx.destroy();
}
async function editedDataHeader(form) {
  const trx = await db.transaction();
  try {
    const headerData = await fetchDataFromTable("header_link");
    const navbarLogoData = await fetchDataFromTable("header_logo");
    console.log({ form });
    navbarLogoData[0].logo_svg = form.logoSvg;
    await trx("header_logo").update({ logo_svg: navbarLogoData[0].logo_svg });

    for (const index in headerData) {
      const titleKey = `title_${index}`;
      const hrefKey = `href_${index}`;
      headerData[index].title = form[titleKey];
      headerData[index].href = form[hrefKey];

      const id = headerData[index].id;
      const title = headerData[index].title;
      const href = headerData[index].href;

      await trx("header_link").update({ title, href }).where({ id });
    }

    await trx.commit();

    console.log("Header data is edited");
  } catch (error) {
    await trx.rollback();
    throw error;
  } finally {
    await trx.destroy();
  }
}
async function editedDataFooter(form) {
  const trx = await db.transaction();
  try {
    const footer = await fetchDataFromTable("footer_link", "main_title", "asc");
    const footerDataSection1 = footer.slice(0, 3);
    const footerDataSection2 = footer.slice(3, 6);
    const socialLink = await fetchDataFromTable("social_link");

    for (const data of footerDataSection1) {
      const id = data.id;
      const index = footerDataSection1.indexOf(data);
      const titleKey = `section1Title_${index}`;
      const hrefKey = `section1Href_${index}`;
      const title = form[titleKey];
      const href = form[hrefKey];

      data.title = title;
      data.href = href;

      await trx("footer_link").update({ title, href }).where({ id });
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

      await trx("footer_link")
        .update({ title, href, main_title: mainTitle })
        .where({ id });
    }

    for (const data of socialLink) {
      const id = data.id;
      const index = socialLink.indexOf(data);
      const hrefKey = `socialHref_${index}`;
      const href = form[hrefKey];
      data.href = href;

      await trx("social_link").update({ href }).where({ id });
    }

    await trx.commit();

    console.log("Footer data is edited");
  } catch (error) {
    await trx.rollback();
    throw error;
  } finally {
    await trx.destroy();
  }
}
async function addNewCategoryArticle(form) {
  form.updated_at = null;
  const trx = await db.transaction();
  await trx("article_category").insert(form);
  await trx.commit();
  await trx.destroy();
  console.log("New category added successfully.");
}
async function editedCategoryArticle(form) {
  const trx = await db.transaction();
  try {
    for (const key in form) {
      if (key.includes("id_")) {
        const id = form[key];
        const nameKey = key.replace("id_", "name_");
        const name = form[nameKey];
        await trx("article_category").update({ name }).where({ id });
      }
    }
    await trx.commit();
    console.log("article-category is edited");
  } catch (error) {
    await trx.rollback();
    throw error;
  } finally {
    await trx.destroy();
  }
}
async function handleLoginRequest(response, form) {
  const users = await fetchDataFromTable("user");

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
    await trx("user").where("email", form.email).update({ session_id: id });
    await trx.commit();
    await trx.destroy();
    console.log({ user });
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
  const trx = await db.transaction();
  if (cookieId) {
    await trx("user")
      .where({ session_id: cookieId })
      .update({ session_id: null });
    await trx.commit();
    await trx.destroy();
  }
  response.setHeader("Set-Cookie", "session_id=; HttpOnly; Max-Age=0; Path=/");
  response302(response, "/login");
}
async function handleRegisterRequest(response, form) {
  const users = await fetchDataFromTable("user");
  const emailSchema = z.string().email();
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;
  const passwordSchema = z.string().min(8).max(20).regex(regex);
  const validatedEmail = emailSchema.safeParse(form.email);
  const validatedPassword = passwordSchema.safeParse(form.password);
  console.log({ validatedEmail, validatedPassword });
  const userExist = users.find((user) => user.email === form.email);
  if (userExist) {
    response302(response, "/register?userExist=true");
    return;
  }
  if (!validatedEmail.success) {
    response302(response, "/register?emailFormat=true");
    return;
  }
  if (!validatedPassword.success) {
    response302(response, "/register?passwordFormat=true");
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
    const trx = await db.transaction();
    await trx("user").insert(session);
    await trx.commit();
    await trx.destroy();
    response302(response, "/login?createAccount=true");
  }
}
async function findUserWithCookie(request) {
  const users = await fetchDataFromTable("user");
  const objCookie = request.headers.cookie;
  const cookies = cookie.parse(objCookie || "");
  const cookieId = cookies.session_id;
  const foundUser = users.find((user) => user.session_id === cookieId);
  if (foundUser) {
    return foundUser.user_id;
  }
}
