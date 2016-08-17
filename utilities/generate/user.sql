INSERT INTO "blog" (id, DOMAIN, NAME, "type") VALUES
(1, 'admin', 'Admin', 'user'),
(2, 'taras', 'Taras', 'user'),
(3, 'viktor', 'Viktor', 'user'),
(4, 'yura', 'Yura', 'user'),
(5, 'alex', 'Alex', 'user'),
(6, 'andrey', 'Andrey', 'user'),
(7, 'dima', 'Dima', 'user'),
(8, 'artem', 'Artem', 'user'),
(9, 'piter', 'Piter', 'user'),
(10, 'maxim', 'Maxim', 'user'),
(11, 'vova', 'Vova', 'user'),
(12, 'anna', 'Anna', 'user'),
(13, 'natalya', 'Natalya', 'user'),
(14, 'julia', 'Yulia', 'user'),
(15, 'kate', 'Kate', 'user');

ALTER SEQUENCE blog_id_seq RESTART WITH 100;
