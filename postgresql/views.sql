CREATE OR REPLACE VIEW member AS
  SELECT
    "from",
    "to",
    r.type AS relation_type,
    b.type AS blog_type
  FROM relation r
    JOIN blog b ON r."from" = b.id;

CREATE OR REPLACE VIEW dialog AS
  WITH mm AS (
    SELECT
      m.id,
      r."to"   AS recipient,
      m."from" AS peer,
      m."from",
      m.type,
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
      m.type,
      m.text
    FROM "message" m
    WHERE m.type = 'dialog'
    UNION
    SELECT
      m.id,
      m."from" AS recipient,
      m."to"   AS peer,
      m."from",
      m.type,
      m.text
    FROM "message" m
    WHERE m.type = 'dialog'
  )
  SELECT
    mm.id,
    mm."from",
    mm.peer,
    r.domain AS recipient,
    b.name,
    b.avatar,
    mm.text
  FROM mm
    JOIN blog b ON mm."from" = b.id
    JOIN blog r ON mm.recipient = b.id;

CREATE OR REPLACE VIEW "last" AS
  SELECT
    max(id) AS id,
    peer,
    recipient
  FROM dialog
  GROUP BY peer, recipient;

CREATE OR REPLACE VIEW messenger AS
  SELECT
    l.peer AS id,
    m.id   AS message,
    b.name,
    b.avatar,
    b.type,
    m."text",
    l.recipient
  FROM "last" l
    JOIN "message" m ON l.id = m.id
    JOIN blog b ON l.peer = b.id;

CREATE OR REPLACE VIEW "message_attitude" AS
  SELECT
    m.id,
    m.type,
    count('like' = a.type) AS "likes",
    count('hate' = a.type) AS "hates"
  FROM "message" m
    JOIN blog b ON m."from" = b.id
    RIGHT JOIN attitude a ON m.id = a.message
  GROUP BY m.id;

CREATE OR REPLACE VIEW "message_attitude_recipient" AS
  SELECT
    m.id,
    a.type AS attitude,
    a.from AS recipient
  FROM message m
    LEFT JOIN attitude a ON m.id = a.message;

CREATE OR REPLACE VIEW "comments_count" AS
  SELECT
    m.id,
    count(c.id) AS comments
  FROM "message" m
    LEFT JOIN "message" c ON m.id = c.parent AND 'child' = c.type
  WHERE 'wall' = m.type
  GROUP BY m.id;

CREATE OR REPLACE VIEW "wall" AS
  SELECT
    m.*,
    a.attitude,
    a.recipient,
    c.comments
  FROM message_attitude_recipient a
    JOIN "message" m ON a.id = m.id
    JOIN comments_count c ON m.id = c.id AND m.type = 'wall';

CREATE OR REPLACE VIEW convert_file AS
  SELECT
    f.id,
    f.name,
    f.mime,
    f.data,
    coalesce(c.size, f.size) as size,
    (c.size * power(random(), 2)) as priority
  FROM file f
    JOIN "convert" c ON f.id = c.file
  WHERE c.pid IS NULL;

CREATE OR REPLACE VIEW convert_progress AS
  SELECT
    f.name,
    f.size,
    c.progress,
    c.processed
  FROM file f
    JOIN "convert" c ON f.id = c.file;
