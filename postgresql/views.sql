CREATE OR REPLACE VIEW member AS
  SELECT
    "from",
    r.type AS relation,
    "to"   AS id,
    b.type AS type,
    b.name,
    b.avatar
  FROM relation r
    JOIN blog b ON r."to" = b.id;

CREATE OR REPLACE VIEW chat_dialog AS
  WITH mm AS (
      SELECT
        m.id,
        r."to"     AS recipient,
        m."parent" AS peer,
        m."from",
        m.type,
        m.text
      FROM "message" m
        JOIN relation r ON m."parent" = r."from"
      WHERE m.type = 'chat'
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

CREATE OR REPLACE VIEW dialog AS
  WITH mm AS (
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
  WITH mm AS (
    SELECT
      m.id,
      r."to"     AS recipient,
      m."parent" AS peer
    FROM "message" m
      RIGHT JOIN relation r ON m."parent" = r."from"
      RIGHT JOIN blog b ON m."parent" = b.id
    WHERE b.type = 'chat'
    UNION
    SELECT
      m.id,
      m."to"   AS recipient,
      m."from" AS peer
    FROM "message" m
    WHERE m.type = 'dialog'
    UNION
    SELECT
      m.id,
      m."from" AS recipient,
      m."to"   AS peer
    FROM "message" m
    WHERE m.type = 'dialog'
  )
  SELECT
    max(id) AS id,
    peer,
    recipient
  FROM mm
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
    author.name,
    author.avatar,
    b.id   AS recipient,
    a.type AS attitude
  FROM "blog" b CROSS JOIN repost_count m JOIN blog author ON m."from" = author.id
    LEFT JOIN attitude a ON a.message = m.id AND a."from" = b.id
  WHERE b.type = 'user';

CREATE OR REPLACE VIEW "wall" AS
  SELECT *
  FROM message_attitude_recipient m
  WHERE type = 'wall';

CREATE OR REPLACE VIEW "news" AS
  SELECT w.*
  FROM relation r
    JOIN wall w ON r.to = w.parent AND r."from" = w.recipient
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

CREATE OR REPLACE VIEW invite AS
  WITH inv AS (
      SELECT
        r2.id,
        r2."from",
        r2."to" AS recipient,
        r1.type AS relation
      FROM relation r1 RIGHT
        JOIN relation r2 ON r2."from" = r1."to" AND r2."to" = r1."from"
      WHERE r2.type = 'follow'
  )
  SELECT
    inv.id,
    b.type,
    b.name,
    b.domain,
    b.avatar,
    inv.from,
    inv.relation,
    inv.recipient
  FROM blog b
    JOIN inv ON b.id = inv.from;

CREATE OR REPLACE VIEW subscription AS
  SELECT *
  FROM invite
  WHERE (relation IS NULL OR relation = 'reject')
        AND type = 'user';

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
    r.type AS relation,
    r."from"
  FROM blog b
    JOIN relation r ON b.id = r."to";

CREATE OR REPLACE VIEW to_list AS
  SELECT
    b.*,
    r.type AS relation,
    r."to"
  FROM blog b
    JOIN relation r ON b.id = r."from";

CREATE OR REPLACE VIEW blog_cross AS
  SELECT
    t.*,
    f.id AS "recipient"
  FROM blog f CROSS JOIN blog t;

CREATE OR REPLACE VIEW "blog_recipient" AS
  SELECT
    j.*,
    CASE
    WHEN j.id = j.recipient OR 'manage' = rv.type
      THEN 'manage'
    WHEN r.type = 'follow' AND rv.type = 'follow'
      THEN 'friend'
    ELSE r.type END AS relation
  FROM blog_cross j
    LEFT JOIN relation r ON j.recipient = r."from" AND j.id = r."to"
    LEFT JOIN relation rv ON j.recipient = rv."to" AND j.id = rv."from";

CREATE OR REPLACE VIEW informer AS
  SELECT
    b.*,
    (SELECT count(*)
     FROM invite
     WHERE
       (relation IS NULL OR relation = 'reject')
       AND type = 'user'
       AND recipient = b.id)                    AS subscribers,
    (SELECT count(*)
     FROM invite
     WHERE
       recipient = b.id
       AND type = 'user'
       AND relation = 'follow')                 AS friends,
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
    row_to_json(f.*)                            AS track
  FROM blog_recipient b
    LEFT JOIN file f ON b.playing = f.id;

CREATE OR REPLACE VIEW verify AS
  SELECT data->>'sid' as sid, data->>'code' as code FROM log WHERE type = 'user' AND action = 'verify';
