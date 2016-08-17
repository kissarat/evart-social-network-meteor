CREATE OR REPLACE VIEW member AS
  SELECT
    "from",
    "to",
    r.type AS relation_type,
    b.type AS blog_type
  FROM relation r
    JOIN blog b ON r."from" = b.id;

CREATE OR REPLACE VIEW message_view AS
  WITH m AS (
    SELECT
      m.id,
      r."to"   AS recipient,
      m."from" AS peer,
      b.name,
      b.avatar,
      m.text
    FROM "message" m
      JOIN blog b ON m."from" = b.id
      LEFT JOIN member r ON m."to" = r."from"
    WHERE r.blog_type = 'chat'
    UNION ALL
    SELECT
      m.id,
      m."to"   AS recipient,
      m."from" AS peer,
      b.name,
      b.avatar,
      m.text
    FROM "message" m
      JOIN blog b ON m."from" = b.id
    UNION ALL
    SELECT
      m.id,
      m."from" AS recipient,
      m."to"   AS peer,
      b.name,
      b.avatar,
      m.text
    FROM "message" m
      JOIN blog b ON m."to" = b.id
  )
  SELECT * FROM m GROUP BY id, recipient, peer, name, avatar, text;

CREATE OR REPLACE VIEW "last" AS
  SELECT
    max(id) AS id,
    peer,
    recipient
  FROM message_view
  GROUP BY peer, recipient;

CREATE OR REPLACE VIEW recipient AS
  SELECT
    l.peer   AS id,
    m.id     AS message_id,
    b.name   AS peer_name,
    b.avatar AS peer_avatar,
    b.type,
    m."text",
    l.recipient
  FROM "last" l
    JOIN "message" m ON l.id = m.id
    JOIN blog b ON l.peer = b.id;
