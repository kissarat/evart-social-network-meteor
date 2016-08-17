CREATE TABLE blog (
  id     SERIAL PRIMARY KEY,
  domain VARCHAR(24),
  name   VARCHAR(128),
  time   TIMESTAMP    NOT NULL DEFAULT current_timestamp
);

CREATE TYPE relation_type AS ENUM ('follow', 'manage', 'deny');

CREATE TABLE relation (
  number SMALLINT      NOT NULL DEFAULT 0,
  "from" INT REFERENCES blog (id),
  "to"   INT REFERENCES blog (id),
  type   relation_type NOT NULL DEFAULT 'follow',
  time   TIMESTAMP
);

CREATE TABLE "user" (
  password CHAR(60)
)
  INHERITS (blog);

CREATE TYPE file_type AS ENUM ('image', 'video', 'audio', 'file');

CREATE TABLE file (
  id   BIGSERIAL PRIMARY KEY,
  name VARCHAR(256),
  type VARCHAR(64),
  mime VARCHAR(64),
  url  VARCHAR(256),
  data TEXT
);

CREATE TABLE message (
  id     BIGSERIAL PRIMARY KEY,
  parent BIGINT REFERENCES message (id),
  file   BIGINT REFERENCES file (id),
  "from" INT REFERENCES blog (id),
  "to"   INT REFERENCES blog (id),
  "text" TEXT      NOT NULL,
  time   TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE attachment (
  number  SMALLINT NOT NULL DEFAULT 0,
  message BIGINT REFERENCES message (id),
  file    BIGINT REFERENCES message (id)
);
