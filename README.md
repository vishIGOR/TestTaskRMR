# TestTaskRMR
Test task for rmr.

Для работы проекта необходимо иметь установленный MongoDb с пользователем и бд (имя/пароля/название бд необходимо установить в .env файле)
Также необходим установленный node.js версии 16

Для запуска введите команду ```npm start```

Основные виды файлов -
1) .module.ts - предоставляемые nestjs объекты для разграничения модулей и установления зависимостей между ними
2) .controller.ts - необходимы для принятия и роутинга http запросов
3) .service.ts - содержат основную бизнес-логику по обработке запросов
4) .helper.ts - содержат низкоуровневую логику (например, для работы с бд или файлами)
5) .dtos.ts - data transfer object объекты для обмена данными между сервисами и контроллерами, а также контроллерами и клиентом
6) .schema.ts - содежит класс, представляющий объект в БД (в данном случае mongoose)
7) .interface.ts - абстракции для отделения реализации сервисов и хэлперов
