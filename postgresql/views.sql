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
    UNION
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
    mm.recipient,
    b.name,
    b.avatar,
    mm.text
  FROM mm
    JOIN blog b ON mm."from" = b.id;

CREATE OR REPLACE VIEW "last" AS
  SELECT
    max(id) AS id,
    peer,
    recipient
  FROM dialog
  WHERE peer <> recipient
  GROUP BY peer, recipient;

CREATE OR REPLACE VIEW messenger AS
  SELECT
    l.peer AS id,
    m.id   AS message,
    b.name,
    b.avatar,
    m.type,
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

CREATE OR REPLACE VIEW repost_count AS
  SELECT
    m.*,
    (SELECT count(*)
     FROM message
     WHERE original = m.id) AS repost
  FROM message m;

CREATE OR REPLACE VIEW "message_attitude_recipient" AS
  SELECT
    m.*,
    b.id   AS recipient,
    a.type AS attitude
  FROM "blog" b CROSS JOIN repost_count m
    LEFT JOIN attitude a ON a.message = m.id AND a."from" = b.id
  WHERE b.type = 'user';

CREATE OR REPLACE VIEW "wall" AS
  SELECT *
  FROM message_attitude_recipient m
  WHERE type = 'wall';

CREATE OR REPLACE VIEW "news" AS
  SELECT w.*
  FROM relation r
    JOIN wall w ON r.to = w.parent
  WHERE r.type = 'follow';

CREATE OR REPLACE VIEW "child" AS
  SELECT *
  FROM message_attitude_recipient
  WHERE type = 'child';

CREATE OR REPLACE VIEW "comments_count" AS
  SELECT
    m.id,
    count(c.id) AS comments
  FROM "message" m
    LEFT JOIN "message" c ON m.id = c.parent AND 'child' = c.type
  WHERE 'wall' = m.type
  GROUP BY m.id;

CREATE OR REPLACE VIEW convert_file AS
  SELECT
    f.id,
    f.name,
    f.mime,
    f.data,
    coalesce(c.size, f.size)      AS size,
    (c.size * power(random(), 2)) AS priority
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

CREATE OR REPLACE VIEW "blog_recipient" AS
  SELECT
    b.*,
    rec.id            AS recipient,
    CASE WHEN b.id = rec.id
      THEN 'manage'
    ELSE rel.type END AS relation
  FROM "blog" rec CROSS JOIN blog b
    LEFT JOIN relation rel ON rel."to" = b.id AND rel."from" = rec.id
  WHERE rec.type = 'user';

CREATE OR REPLACE VIEW invite AS
  WITH inv AS (
      SELECT
        r2."from",
        r2."to" AS recipient,
        r1.type AS establish
      FROM relation r1 RIGHT
        JOIN relation r2 ON r2."from" = r1."to" AND r2."to" = r1."from"
      WHERE r2.type = 'follow'
  )
  SELECT
    b.type,
    b.name,
    b.domain,
    b.avatar,
    inv.from,
    inv.establish,
    inv.recipient
  FROM blog b
    JOIN inv ON b.id = inv.from;

CREATE OR REPLACE VIEW file_message AS
  SELECT
    f.*,
    coalesce(t.type, 'video') AS type,
    m.from,
    m.text
  FROM file f
    JOIN message m ON f.id = m.id
    LEFT JOIN mime t ON f.mime = t.id;

CREATE OR REPLACE VIEW from_list AS
  SELECT
    b.*,
    r.type AS establish,
    r."from"
  FROM blog b
    JOIN relation r ON b.id = r."to";

CREATE OR REPLACE VIEW to_list AS
  SELECT
    b.*,
    r.type AS establish,
    r."to"
  FROM blog b
    JOIN relation r ON b.id = r."from";

CREATE OR REPLACE VIEW informer AS
  SELECT
    b.id,
    b.domain,
    b.name,
    b.type,
    b.avatar,
    b.status,
    b.recipient,
    b.relation,
    (SELECT count(*)
     FROM invite
     WHERE
       (establish IS NULL OR establish = 'reject')
       AND type = 'user'
       AND recipient = b.id)                    AS subscribers,
    (SELECT count(*)
     FROM invite
     WHERE
       recipient = b.id
       AND type = 'user'
       AND establish = 'follow')                AS friends,
    (SELECT count(*)
     FROM from_list
     WHERE "from" = b.id AND type = 'group')    AS groups,
    (SELECT count(*)
     FROM file_message fm
     WHERE "from" = b.id AND fm.type = 'image') AS image,
    (SELECT count(*)
     FROM file_message fm
     WHERE "from" = b.id AND fm.type = 'audio') AS audio,
    (SELECT count(*)
     FROM file_message fm
     WHERE "from" = b.id AND fm.type = 'video') AS video,
    row_to_json(f.*)                            AS playing
  FROM blog_recipient b
    LEFT JOIN file f ON b.playing = f.id;
