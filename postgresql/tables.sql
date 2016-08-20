CREATE TYPE file_type AS ENUM ('image', 'audio', 'video', 'text', 'archive', 'application');

CREATE TABLE file (
  id    BIGSERIAL PRIMARY KEY,
  name  VARCHAR(250),
  type  file_type,
  mime  VARCHAR(40),
  url   VARCHAR(250) UNIQUE,
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
  avatar BIGINT REFERENCES file (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  time   TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TYPE relation_type AS ENUM ('follow', 'manage', 'deny');

CREATE TABLE relation (
  "from" INT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  "to"   INT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  type   relation_type NOT NULL DEFAULT 'follow',
  UNIQUE ("from", "to")
);

CREATE TYPE message_type AS ENUM ('dialog', 'chat', 'wall', 'comment', 'child');

CREATE TABLE "message" (
  id     BIGINT PRIMARY KEY,
  "type" message_type             NOT NULL,
  "from" INT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "to"   INT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  parent BIGINT,
  "text" VARCHAR(8000)            NOT NULL
);

CREATE TABLE attachment (
  number  SMALLINT NOT NULL DEFAULT 0,
  message BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  file    BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  UNIQUE ("message", file)
);

CREATE TYPE attitude_type AS ENUM ('like', 'hate');

CREATE TABLE attitude (
  "from"    INT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "message" BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "type"    attitude_type             NOT NULL
);
