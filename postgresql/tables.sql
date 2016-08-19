CREATE TYPE file_type AS ENUM ('image', 'audio', 'video', 'text', 'archive', 'application');

CREATE TABLE file (
  id    BIGINT PRIMARY KEY,
  name  VARCHAR(250),
  type  file_type,
  mime  VARCHAR(40),
  url   VARCHAR(250),
  data  VARCHAR(15000),
  time  TIMESTAMP NOT NULL DEFAULT current_timestamp,
  thumb VARCHAR(50)
);

CREATE TYPE blog_type AS ENUM ('user', 'group', 'chat');

CREATE TABLE blog (
  id     SERIAL PRIMARY KEY,
  domain VARCHAR(24) UNIQUE,
  name   VARCHAR(128),
  type   blog_type NOT NULL,
  avatar BIGINT REFERENCES file (id),
  time   TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TYPE relation_type AS ENUM ('follow', 'manage', 'deny');

CREATE TABLE relation (
  number SMALLINT      NOT NULL DEFAULT 0,
  "from" INT REFERENCES blog (id),
  "to"   INT REFERENCES blog (id),
  type   relation_type NOT NULL DEFAULT 'follow',
  time   TIMESTAMP,
  UNIQUE ("from", "to")
);

CREATE TABLE "user" (
  password CHAR(60)
)
  INHERITS (blog);

-- CREATE TYPE message_type AS ENUM ('dialog', 'chat', 'wall', 'child');

CREATE TABLE "message" (
  id     BIGINT PRIMARY KEY,
  --   type message_type NOT NULL,
  file   BIGINT REFERENCES file (id),
  "from" INT REFERENCES blog (id),
  "to"   INT REFERENCES blog (id),
  "text" VARCHAR(8000) NOT NULL
);

CREATE TABLE "note" (
  parent INT REFERENCES blog (id)
)
  INHERITS (message);

CREATE TABLE "comment" (
  parent INT REFERENCES message (id)
)
  INHERITS (message);

CREATE TABLE attachment (
  number  SMALLINT NOT NULL DEFAULT 0,
  message BIGINT REFERENCES message (id),
  file    BIGINT REFERENCES message (id),
  UNIQUE (message, file)
);
