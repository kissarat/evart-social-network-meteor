CREATE TYPE file_type AS ENUM ('image', 'audio', 'video', 'text', 'archive', 'application');

CREATE TABLE mime (
  id      VARCHAR(80) NOT NULL PRIMARY KEY,
  size    BIGINT,
  type    file_type,
  enabled BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE file (
  id    BIGINT PRIMARY KEY,
  name  VARCHAR(250),
  mime  VARCHAR(80) REFERENCES mime (id),
  url   VARCHAR(250) UNIQUE,
  hash  CHAR(32),
  size  BIGINT,
  data  JSON,
  time  TIMESTAMP NOT NULL DEFAULT current_timestamp,
  thumb VARCHAR(50)
);

CREATE TABLE convert (
  id        BIGSERIAL PRIMARY KEY,
  file      BIGINT NOT NULL UNIQUE REFERENCES file (id),
  pid       INT CHECK (pid > 0),
  progress  FLOAT4 NOT NULL DEFAULT 0,
  processed BIGINT NOT NULL DEFAULT 0,
  blog      BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  size      BIGINT
);

CREATE TYPE blog_type AS ENUM ('user', 'group', 'chat');

CREATE TABLE blog (
  id     BIGINT PRIMARY KEY,
  domain VARCHAR(24) UNIQUE,
  name   VARCHAR(128),
  type   blog_type NOT NULL,
  avatar BIGINT REFERENCES file (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  time   TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TYPE relation_type AS ENUM ('follow', 'manage', 'deny', 'reject');

CREATE TABLE relation (
  id     BIGINT PRIMARY KEY,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  "to"   BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  type   relation_type NOT NULL DEFAULT 'follow',
  UNIQUE ("from", "to")
);

CREATE TYPE message_type AS ENUM ('dialog', 'chat', 'wall', 'comment', 'child');

CREATE TABLE "message" (
  id     BIGINT PRIMARY KEY,
  "type" message_type                 NOT NULL,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "to"   BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  parent BIGINT,
  "text" VARCHAR(8000)                NOT NULL,
  original BIGINT REFERENCES message (id)
);

CREATE TABLE attachment (
  number  SMALLINT                    NOT NULL DEFAULT 0,
  message BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  file    BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  UNIQUE ("message", file)
);

CREATE TYPE attitude_type AS ENUM ('like', 'hate');

CREATE TABLE attitude (
  "from"    BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "message" BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "type"    attitude_type             NOT NULL,
  UNIQUE ("from", "message")
);

CREATE TYPE event_type AS ENUM ('offer', 'answer', 'candidate');

CREATE TABLE channel (
  id     BIGINT PRIMARY KEY,
  "type" event_type                   NOT NULL,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "to"   BIGINT REFERENCES blog (id),
  "text" VARCHAR(8000)                NOT NULL
);
