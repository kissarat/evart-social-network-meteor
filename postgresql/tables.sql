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
  url   VARCHAR(250),
  hash  CHAR(32),
  size  BIGINT,
  data  JSON,
  time  TIMESTAMP NOT NULL DEFAULT current_timestamp,
  thumb VARCHAR(50)
);
COMMENT ON TABLE file IS 'фото, видео, аудио или другой файл';
COMMENT ON COLUMN file.url IS 'ccылка на оригинальной ресурс';
COMMENT ON COLUMN file.data IS 'oembed информация о вложеном видео или id3-данные аудио-файла';
COMMENT ON COLUMN file.thumb IS 'ccылка на миниатюру, в случае видео берется из oembed';
COMMENT ON COLUMN file.time IS 'время изменение, пока не используется';

CREATE TYPE blog_type AS ENUM ('user', 'group', 'chat');

CREATE TABLE blog (
  id     BIGINT PRIMARY KEY,
  domain VARCHAR(24) UNIQUE,
  name   VARCHAR(128),
  surname   VARCHAR(64),
  forename   VARCHAR(64),
  phone   VARCHAR(24),
  email VARCHAR(128),
  type   blog_type NOT NULL,
  playing BIGINT REFERENCES file(id),
  status VARCHAR(140),
  birthday DATE,
  data JSON,
  avatar BIGINT REFERENCES file (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  /* t0 - t6 - фотографии на плитках */
  t0 BIGINT REFERENCES file(id),
  t1 BIGINT REFERENCES file(id),
  t2 BIGINT REFERENCES file(id),
  t3 BIGINT REFERENCES file(id),
  t4 BIGINT REFERENCES file(id),
  t5 BIGINT REFERENCES file(id),
  t6 BIGINT REFERENCES file(id),
  time TIMESTAMP NOT NULL DEFAULT current_timestamp
);
COMMENT ON TABLE blog IS 'либо пользователь, либо группа, либо чат';
COMMENT ON COLUMN blog.domain IS 'логин, можно использовать также и в url evart.com/<domain>';
COMMENT ON COLUMN blog.name IS 'отображаемое имя, для пользователя составляется из surname и forename';
COMMENT ON COLUMN blog.data IS 'дополнительные данные, если нужно';
COMMENT ON COLUMN blog.time IS 'время изменение, пока не используется';

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
COMMENT ON TABLE convert IS 'очередь конвертации, см. file/convert.js';

CREATE TYPE relation_type AS ENUM ('follow', 'manage', 'deny', 'reject', 'friend');

CREATE TABLE relation (
  id     BIGINT PRIMARY KEY,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  "to"   BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  type   relation_type NOT NULL DEFAULT 'follow',
  UNIQUE ("from", "to")
);
COMMENT ON TABLE relation IS 'отношение между blog';

CREATE TYPE message_type AS ENUM ('dialog', 'chat', 'wall', 'comment', 'child', 'file');

CREATE TABLE "message" (
  id     BIGINT PRIMARY KEY,
  "type" message_type                 NOT NULL,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  "to"   BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  parent BIGINT,
  "text" VARCHAR(8000),
  original BIGINT REFERENCES message (id)
);
COMMENT ON TABLE "message" IS 'сообщение или запись на стене';
COMMENT ON COLUMN "message"."from" IS 'отправитель';
COMMENT ON COLUMN "message"."to" IS 'используеться только в приватных сообщениях';
COMMENT ON COLUMN "message".parent IS 'ссылается на cущность, которой принадлежит сообщения, на message или blog';

CREATE TABLE attachment (
  number  SMALLINT                    NOT NULL DEFAULT 0,
  message BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  file    BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  UNIQUE ("message", file)
);
COMMENT ON TABLE attachment IS 'вложение сообщений';
COMMENT ON COLUMN attachment.number IS 'порядок, в котором вложение упорядочиваются';

CREATE TYPE attitude_type AS ENUM ('like', 'hate');

CREATE TABLE attitude (
  "from"    BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "message" BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "type"    attitude_type             NOT NULL,
  UNIQUE ("from", "message")
);
COMMENT ON TABLE attitude IS 'отношение пользователя к сообщению (лайки)';

CREATE TYPE event_type AS ENUM ('offer', 'answer', 'candidate');

CREATE TABLE channel (
  id     BIGINT PRIMARY KEY,
  "type" event_type                   NOT NULL,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "to"   BIGINT REFERENCES blog (id),
  "text" VARCHAR(8000)                NOT NULL
);
COMMENT ON TABLE channel IS 'канал cвязи во время WebRTC-дозвона';

CREATE TABLE "log" (
  id BIGINT PRIMARY KEY,
  type VARCHAR(16) NOT NULL,
  action VARCHAR(32) NOT NULL,
  ip INET,
  actor BIGINT REFERENCES blog(id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  data JSON
);
COMMENT ON TABLE "log" IS 'журнал действий пользователя, необходим для проверки телефона при регистрации и восстановление пароля';
