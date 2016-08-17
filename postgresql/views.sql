CREATE OR REPLACE VIEW member AS
  SELECT
    "from" AS chat,
    "to"   AS member
  FROM relation r
    JOIN blog b ON r."from" = b.id
  WHERE b.type = 'chat';

CREATE OR REPLACE VIEW "last" AS
  SELECT
    "from",
    "to",
    max(id) AS "message"
  FROM "message"
  WHERE file IS NULL
  GROUP BY "from", "to";

CREATE OR REPLACE VIEW excess AS
  SELECT
    "last".message AS "message",
    member.chat    AS peer,
    member.member  AS recipient
  FROM "last"
    JOIN member ON "last"."to" = member.chat
  UNION
  SELECT
    "last".message       AS "message",
    CASE WHEN u.id <> "last"."from"
      THEN "last"."from"
    ELSE "last"."to" END AS peer,
    CASE WHEN u.id = "last"."from"
      THEN "last"."from"
    ELSE "last"."to" END AS recipient
  FROM "blog" u
    JOIN "last" ON (u.id <> "last"."from" AND u.id = "last"."to") OR (u.id <> "last"."to" AND u.id = "last"."from")
  WHERE u.type = 'user';

CREATE OR REPLACE VIEW recipient AS
  WITH grouped AS (
      SELECT
        max("message") AS "message",
        peer,
        recipient
      FROM excess
      GROUP BY peer, recipient
  )
  SELECT
    g.peer   AS id,
    m.id     AS message_id,
    b.name   AS peer_name,
    b.avatar AS peer_avatar,
    b.type,
    m."text",
    g.recipient
  FROM grouped g
    JOIN "message" m ON g.message = m.id
    JOIN blog b ON g.peer = b.id;
