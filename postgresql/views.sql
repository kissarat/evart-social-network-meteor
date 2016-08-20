CREATE OR REPLACE VIEW member AS
  SELECT
    "from",
    "to",
    r.type AS relation_type,
    b.type AS blog_type
  FROM relation r
    JOIN blog b ON r."from" = b.id;

CREATE OR REPLACE VIEW message_view AS
  WITH mm AS (
    SELECT
      m.id,
      r."to"   AS recipient,
      m."from" AS peer,
      m."from",
      m.text
    FROM "message" m
      JOIN member r ON m."to" = r."from"
    WHERE r.blog_type = 'chat'
    UNION ALL
    SELECT
      m.id,
      m."to"   AS recipient,
      m."from" AS peer,
      m."from",
      m.text
    FROM "message" m
    UNION
    SELECT
      m.id,
      m."from" AS recipient,
      m."to"   AS peer,
      m."from",
      m.text
    FROM "message" m
  )
  SELECT
    mm.*,
    b.name,
    b.avatar
  FROM mm
    JOIN blog b ON mm."from" = b.id;

CREATE OR REPLACE VIEW "last" AS
  SELECT
    max(id) AS id,
    peer,
    recipient
  FROM message_view
  GROUP BY peer, recipient;

CREATE OR REPLACE VIEW messenger AS
  SELECT
    l.peer   AS id,
    m.id     AS dialog,
    b.name   AS name,
    b.avatar AS avatar,
    b.type,
    m."text",
    l.recipient
  FROM "last" l
    JOIN "message" m ON l.id = m.id
    JOIN blog b ON l.peer = b.id;

CREATE OR REPLACE VIEW "message_attitude" AS
  SELECT
    m.id,
    m."from",
    m.to,
    m.parent,
    m.type,
    count('like' = a.type) AS "likes",
    count('hate' = a.type) AS "hates",
    m.text
  FROM "message" m
    LEFT JOIN attitude a ON m.id = a.message
  GROUP BY m.id, m.from, m.to, m.parent, m.type, m.text;

CREATE OR REPLACE VIEW "message_attitude_recipient" AS
  SELECT
    b.*,
    a.type as attitude,
    b.id AS recipient
  FROM message m
    LEFT JOIN attitude a ON m.id = a.message
    LEFT JOIN blog b ON b.id = m."from";

CREATE OR REPLACE VIEW "wall" AS
  SELECT
    m.id,
    m.parent,
    m."from",
    m.text,
    count(c.id) AS comments
  FROM "message" m
    JOIN "message" c ON m.id = c.parent AND 'child' = c.type
  WHERE 'wall' = m.type
  GROUP BY m.id, m.parent, m."from", m.text;
