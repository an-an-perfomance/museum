## MuzeumProject

Монорепозиторий проекта музея с раздельными приложениями:
- `backend` — API на Node.js (Express/Nest-подобная структура).
- `frontend` — SPA на React (Vite).
- `deploy` — конфигурация Docker/Docker Compose и nginx для деплоя.

### Структура

- `backend/` — исходный код и конфиги сервера.
- `frontend/` — исходный код клиентского приложения.
- `deploy/` — Docker/Docker Compose, nginx-конфиги и документация по деплою.

### Быстрый старт (общая идея)

1. Установить Node.js (LTS) и npm или pnpm.
2. Установить зависимости в `backend` и `frontend`:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
3. Запустить приложения для разработки (будут добавлены в соответствующих `package.json`).

### Деплой на одну VM (Linux + Docker)

- Используется `deploy/compose.prod.yml` с сервисами:
  - `db` — PostgreSQL.
  - `backend` — Node.js API.
  - `frontend` — nginx, раздающий статику React и проксирующий `/api` на `backend`.
- Внешний мир видит только порт HTTP(S) фронтенда, остальные сервисы находятся во внутренней сети Docker.

**Пошаговая инструкция деплоя на виртуальный сервер Selectel (с нуля):** [docs/DEPLOY_SELECTEL.md](docs/DEPLOY_SELECTEL.md)

