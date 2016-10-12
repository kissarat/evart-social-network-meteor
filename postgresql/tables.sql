CREATE TYPE file_type AS ENUM ('image', 'audio', 'video', 'text', 'archive', 'application');

CREATE TABLE mime (
  id      VARCHAR(80) NOT NULL PRIMARY KEY,
  size    BIGINT,
  type    file_type,
  enabled BOOLEAN     NOT NULL DEFAULT TRUE
);

/* фото, видео, аудио или другой файл */
CREATE TABLE file (
  id    BIGINT PRIMARY KEY,
  name  VARCHAR(250),
  mime  VARCHAR(80) REFERENCES mime (id),
  /* ccылка на оригинальной ресурс */
  url   VARCHAR(250),
  hash  CHAR(32),
  size  BIGINT,
  /* oembed информация о вложеном видео или id3-данные аудио-файла */
  data  JSON,
  /* время изменение, пока не используется */
  time  TIMESTAMP NOT NULL DEFAULT current_timestamp,
  /* ccылка на миниатюру, в случае видео берется из oembed */
  thumb VARCHAR(50)
);

CREATE TYPE blog_type AS ENUM ('user', 'group', 'chat');

CREATE TABLE blog (
  id     BIGINT PRIMARY KEY,
  /* логин, можно использовать также и в url evart.com/<domain> */
  domain VARCHAR(24) UNIQUE,
  /* отображаемое имя, для пользователя составляется из surname и forename */
  name   VARCHAR(128),
  surname   VARCHAR(64),
  forename   VARCHAR(64),
  phone   VARCHAR(24),
  email VARCHAR(128),
  type   blog_type NOT NULL,
  playing BIGINT REFERENCES file(id),
  status VARCHAR(140),
  birthday DATE,
  /* дополнительные данные, если нужно */
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
  /* время изменение, пока не используется */
  time TIMESTAMP NOT NULL DEFAULT current_timestamp
);

/* очередь конвертации, см. file/convert.js */
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

CREATE TYPE relation_type AS ENUM ('follow', 'manage', 'deny', 'reject', 'friend');

/* отношение между blog */
CREATE TABLE relation (
  id     BIGINT PRIMARY KEY,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  "to"   BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  type   relation_type NOT NULL DEFAULT 'follow',
  UNIQUE ("from", "to")
);

CREATE TYPE message_type AS ENUM ('dialog', 'chat', 'wall', 'comment', 'child', 'file');

/* сообщение или запись на стене */
CREATE TABLE "message" (
  id     BIGINT PRIMARY KEY,
  "type" message_type                 NOT NULL,
  /* отправитель */
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  /* используеться только в приватных сообщениях */
  "to"   BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  /* ссылается на cущность, которой принадлежит сообщения, на message или blog */
  parent BIGINT,
  "text" VARCHAR(8000),
  original BIGINT REFERENCES message (id)
);

/* вложение сообщений */
CREATE TABLE attachment (
  /* порядок, в котором вложение упорядочиваются */
  number  SMALLINT                    NOT NULL DEFAULT 0,
  message BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  file    BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  UNIQUE ("message", file)
);

CREATE TYPE attitude_type AS ENUM ('like', 'hate');

/* отношение пользователя к сообщению (лайки) */
CREATE TABLE attitude (
  "from"    BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "message" BIGINT REFERENCES message (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "type"    attitude_type             NOT NULL,
  UNIQUE ("from", "message")
);

CREATE TYPE event_type AS ENUM ('offer', 'answer', 'candidate');

/* канал cвязи для WebRTC-дозвона */
CREATE TABLE channel (
  id     BIGINT PRIMARY KEY,
  "type" event_type                   NOT NULL,
  "from" BIGINT REFERENCES blog (id)
  ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  "to"   BIGINT REFERENCES blog (id),
  "text" VARCHAR(8000)                NOT NULL
);

/* Журнал действий пользователя, необходим для проверки телефона при регистрации
и восстановление пароля.
*/
CREATE TABLE log (
  id BIGINT PRIMARY KEY,
  type VARCHAR(16) NOT NULL,
  action VARCHAR(32) NOT NULL,
  ip INET,
  actor BIGINT REFERENCES blog(id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  data JSON
)
