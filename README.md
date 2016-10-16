Описание
========

Фреймвок Meteor. База данных - PostgreSQL. Сущность (таблица) blog
представляет собой либо пользователя, либо группу, либо чат. Используется
пакет accounts-password для аунтентификации, который хранит их список
в MongoDB, соответсвующие blog создаются в PostgreSQL при регистрации.

Id любой сущности есть время ее создания в наносекундах, но это число
превешает Number.MAX_SAFE_INTEGER, поэтому, на самом деле, оно округляется
до долей микросекунды, что увеличивает возможность коллизи при создании
создании новой сущности, хоть и вероятность этого остаеться весьма малой.

Frontend
========
`/imports/ui/common/widget`
Любой компонент, которму нужно подписатся на запрос наследуется от
Subscriber, который упрощает работу из подписками, очищает их во время
демонтирования компонента.

Также есть другие компоненты, которые повторно используются. Например
Search - поле поиска из калбеком, ImageDropzone - контейнер, который
позволяет загружать картинку и изменяет соответствующее свойство сущности,
к которой привязан

Что надо сделать
================

Нету уведомлений пользователя, не отображается количество новых сообщений.
Нету аудио и видео звонков. Сообственно надо наладить передачу offer,
 candidate, answer между peer-ами, код есть.
Надо отобразить вложения не только на стене но и в личных сообщениях.
Сделать возможность добавления одного файла (фотография, аудио или видео)
нескольким пользователям (сейчас при добавлении аудиофайла одним
пользователем у другого он удаляется, грубоговоря)
Почти нету ограничений доступа, через API можно менять профайл другого
 пользователя.
 Нету редактирования администраторов группы.
Нотификации для мобильных приложений в Cordova
