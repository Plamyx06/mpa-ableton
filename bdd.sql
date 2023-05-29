CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

CREATE TABLE article_category (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT (now()),
  "updated_at" TIMESTAMPTZ
);
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "article_category"
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);


CREATE TABLE article (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status article_status NOT NULL,
  category_id UUID NOT NULL,
  image VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL,
  updated_by UUID,
  FOREIGN KEY (category_id) REFERENCES article_category (id),
  FOREIGN KEY (created_by) REFERENCES users (user_id),
  FOREIGN KEY (updated_by) REFERENCES users (user_id)
);
CREATE TYPE article_status AS ENUM ('published', 'draft');
CREATE TRIGGER handle_article_updated_at BEFORE UPDATE ON article
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);


