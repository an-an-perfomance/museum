# Развёртывание MuzeumProject на виртуальном сервере Selectel

Пошаговая инструкция для первого деплоя на [Selectel](https://selectel.ru/) (облачный сервер / VPS).

---

## Что понадобится

- Аккаунт на [selectel.ru](https://selectel.ru/)
- Банковская карта или счёт для оплаты (есть [грант для новичков](https://selectel.ru/services/cloud/servers/) на тестирование)
- Компьютер с установленным Git (или архив с кодом проекта)

---

## Часть 1. Создание сервера в Selectel

### 1.1. Вход в панель

1. Зайдите на [selectel.ru](https://selectel.ru/) и нажмите **«Войти»** (или **«Регистрация»**, если аккаунта ещё нет).
2. После входа откройте **«Панель управления»** (правый верхний угол).

### 1.2. Создание облачного сервера

1. В меню выберите **«Облако»** → **«Облачные серверы»** (или **«Серверы»** → **«Облачные серверы»**).
2. Нажмите **«Создать сервер»** (или **«Добавить сервер»**).
3. Заполните параметры:
   - **Регион** — например, Москва или Санкт-Петербург.
   - **Образ ОС** — **Ubuntu 22.04 LTS** (рекомендуется).
   - **Конфигурация** — для начала подойдёт минимальная (1–2 vCPU, 2 ГБ RAM, 10–20 ГБ диск). Позже можно изменить.
   - **SSH-ключ** — лучше добавить свой ключ (см. ниже). Если не добавите, пароль придёт на email.
4. Задайте имя сервера (например, `muzeum-prod`) и нажмите **«Создать»**.

### 1.3. SSH-ключ (рекомендуется)

На своём компьютере (PowerShell или «Терминал»):

```powershell
# Проверьте, есть ли уже ключ
dir $env:USERPROFILE\.ssh

# Если нет id_rsa.pub — создайте ключ (Enter без пароля для простоты)
ssh-keygen -t rsa -b 4096 -f $env:USERPROFILE\.ssh\id_rsa -N '""'
```

Скопируйте **содержимое файла** `C:\Users\ВашеИмя\.ssh\id_rsa.pub` (одна длинная строка) и вставьте его в поле «SSH-ключ» при создании сервера в Selectel.

### 1.4. Данные для входа

После создания сервера в панели появятся:

- **IP-адрес** — например, `123.45.67.89`.
- **Пользователь** — обычно `root` или `ubuntu`.
- **Пароль** — если не использовали SSH-ключ, пароль пришлют на email.

Сохраните IP и логин — они понадобятся для SSH.

---

## Часть 2. Подключение к серверу по SSH

### 2.1. Подключение с Windows

Откройте **PowerShell** или **Windows Terminal** и выполните (подставьте свой IP и пользователя):

```powershell
ssh root@123.45.67.89
```

Или, если пользователь `ubuntu`:

```powershell
ssh ubuntu@123.45.67.89
```

При первом подключении появится вопрос о доверии к серверу — введите `yes` и нажмите Enter. Затем введите пароль (если используете ключ — пароль не запросится).

Успешное подключение выглядит так: приглашение вроде `root@muzeum-prod:~#`.

### 2.2. Обновление системы (рекомендуется)

Выполните на сервере:

```bash
apt update && apt upgrade -y
```

---

## Часть 3. Установка Docker и Docker Compose

Все команды ниже выполняются **на сервере** (по SSH).

### 3.1. Установка Docker

```bash
# Установка зависимостей
apt install -y ca-certificates curl

# Добавление репозитория Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a644 /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка пакетов
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3.2. Проверка

```bash
docker --version
docker compose version
```

Должны отобразиться версии Docker и плагина Compose.

---

## Часть 4. Размещение кода проекта на сервере

### Вариант А: Клонирование из Git (если проект в репозитории)

```bash
# Установка Git, если ещё не установлен
apt install -y git

# Переход в домашнюю папку и клонирование (подставьте свой репозиторий)
cd ~
git clone https://github.com/ВАШ_ЛОГИН/MuzeumProject.git
cd MuzeumProject
```

### Вариант Б: Загрузка архива с компьютера

На **своём компьютере** в папке проекта (где лежат `frontend`, `backend`, `deploy`) создайте архив **без** папок `node_modules` и `.git` (если не нужны):

```powershell
# В PowerShell в корне MuzeumProject
Compress-Archive -Path backend, frontend, deploy, docs, README.md -DestinationPath MuzeumProject.zip
```

Затем загрузите `MuzeumProject.zip` на сервер, например через **SCP** (в новом окне PowerShell на вашем ПК):

```powershell
scp C:\Users\ВашеИмя\Desktop\MuzeumProject.zip root@123.45.67.89:~/
```

На сервере:

```bash
cd ~
apt install -y unzip
unzip MuzeumProject.zip -d MuzeumProject
cd MuzeumProject
```

(Если архив распаковался в одну папку с тем же именем — зайдите в неё: `cd MuzeumProject` и проверьте наличие папок `backend`, `frontend`, `deploy`.)

---

## Часть 5. Настройка переменных окружения

### 5.1. Файл .env для бэкенда

На сервере выполните:

```bash
cd ~/MuzeumProject/backend
cp .env.example .env
nano .env
```

В открывшемся редакторе задайте (или оставьте как есть и только замените `JWT_SECRET`):

```env
PORT=5000
DATABASE_URL=postgres://muzeum:muzeum_password@db:5432/muzeum_db
JWT_SECRET=придумайте_длинный_случайный_ключ_не_меньше_32_символов
```

Сгенерировать случайный ключ можно так (на сервере):

```bash
openssl rand -base64 32
```

Вставьте результат в `JWT_SECRET=` вместо примера. Сохраните файл: в nano — `Ctrl+O`, Enter, затем `Ctrl+X`.

---

## Часть 6. Первый запуск: база данных и таблицы

### 6.1. Запуск только базы данных

```bash
cd ~/MuzeumProject/deploy
docker compose -f compose.prod.yml up -d db
```

Подождите 10–15 секунд, пока контейнер PostgreSQL поднимется.

### 6.2. Создание таблиц (один раз)

**Вариант 1 — скрипт из репозитория:**

```bash
cd ~/MuzeumProject/deploy
chmod +x init-db.sh
./init-db.sh
```

**Вариант 2 — вручную:**

```bash
docker exec -i muzeum-postgres psql -U muzeum -d muzeum_db < ~/MuzeumProject/backend/init.sql
```

Если команда выдаёт ошибку «нет такого файла», укажите полный путь к `init.sql`, например: `/root/MuzeumProject/backend/init.sql`.

Проверка (должны появиться таблицы и пользователь admin):

```bash
docker exec -it muzeum-postgres psql -U muzeum -d muzeum_db -c "\dt"
```

### 6.3. Миграция (если в проекте есть миграции)

Если используете `migrate_db.js`:

```bash
cd ~/MuzeumProject/backend
# Временно задайте DATABASE_URL для хоста (на сервере контейнер db доступен как localhost при пробросе порта или из другого контейнера)
# Проще запустить миграцию из контейнера бэкенда после первого полного запуска (см. ниже).
```

Миграцию можно выполнить после первого полного запуска (см. шаг 8.1).

---

## Часть 7. Сборка фронтенда

Фронтенд нужно собрать с правильным адресом API (чтобы запросы шли на тот же домен).

На сервере установите Node.js (если ещё не установлен), затем соберите проект:

```bash
# Установка Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

cd ~/MuzeumProject/frontend
npm ci
VITE_API_URL=/api npm run build
```

После успешной сборки появится папка `frontend/dist`. Она будет использоваться контейнером nginx.

---

## Часть 8. Запуск всего приложения

### 8.1. Запуск всех контейнеров

```bash
cd ~/MuzeumProject/deploy
docker compose -f compose.prod.yml up -d
```

Проверка:

```bash
docker compose -f compose.prod.yml ps
```

Должны быть в состоянии «Up» три контейнера: `muzeum-frontend`, `muzeum-backend`, `muzeum-postgres`.

### 8.2. Миграция БД (если нужно)

Если в проекте есть скрипт миграции и вы ещё не применяли его:

```bash
cd ~/MuzeumProject/backend
# Установка зависимостей на хосте для одноразового запуска миграции
npm ci
DATABASE_URL=postgres://muzeum:muzeum_password@localhost:5432/muzeum_db node migrate_db.js
```

Порт 5432 должен быть проброшен из контейнера. Если в `compose.prod.yml` порт БД не проброшен, временно добавьте в сервис `db`:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

затем снова `docker compose -f compose.prod.yml up -d` и выполните миграцию. После этого порт можно убрать.

---

## Часть 9. Проверка работы

1. Откройте в браузере: **http://ВАШ_IP_АДРЕС** (например, `http://123.45.67.89`).
2. Должна открыться главная страница «Музей школы».
3. Перейдите в галерею — фото пока не должно быть (или только после загрузки).
4. Вход в админку: **http://ВАШ_IP/login**. В `init.sql` создаётся пользователь `admin` с тестовым хешем пароля — для прода **обязательно** смените пароль. Можно зайти в БД и обновить поле `password` на хеш bcrypt нового пароля, либо создать нового админа через панель (если есть регистрация с выдачей роли).

Если страница не открывается:

- Проверьте, что контейнеры запущены: `docker compose -f compose.prod.yml ps`.
- Проверьте логи: `docker compose -f compose.prod.yml logs -f`.
- Убедитесь, что в панели Selectel для сервера открыт входящий трафик на порт **80** (см. раздел про файрвол ниже).

---

## Часть 10. Файрвол (открытие портов)

В панели Selectel найдите настройки **сети** или **файрвола** для вашего облачного сервера и откройте:

- **Входящий TCP порт 80** — для веб-сайта.
- **Входящий TCP порт 22** — для SSH (обычно уже открыт).

Если используете Ubuntu UFW на самом сервере:

```bash
ufw allow 80/tcp
ufw allow 22/tcp
ufw enable
ufw status
```

---

## Часть 11. Домен и HTTPS (по желанию)

### 11.1. Домен

1. Купите или привяжите домен (например, `museum-school.ru`) в любой регистрации или в Selectel (раздел «Домены»).
2. В настройках DNS создайте **A-запись**: имя `@` (или `www`) → значение **IP вашего сервера** (тот же, что использовали для SSH).

### 11.2. SSL-сертификат (HTTPS)

На сервере можно поставить **Certbot** и получить бесплатный сертификат Let's Encrypt:

```bash
apt install -y certbot
# Для nginx в контейнере потребуется отдельная настройка: либо certbot в контейнере, либо nginx на хосте с проксированием в контейнер. Упрощённый вариант — установить nginx на хост и проксировать в docker.
```

Полная настройка nginx на хосте + Certbot выходит за рамки этой инструкции; можно оформить отдельным шагом после стабильной работы по HTTP.

---

## Часть 12. Полезные команды

| Действие | Команда |
|---------|--------|
| Посмотреть логи всех сервисов | `cd ~/MuzeumProject/deploy && docker compose -f compose.prod.yml logs -f` |
| Логи только бэкенда | `docker logs muzeum-backend -f` |
| Остановить всё | `docker compose -f compose.prod.yml down` |
| Запустить снова | `docker compose -f compose.prod.yml up -d` |
| Пересобрать бэкенд после изменений | `docker compose -f compose.prod.yml up -d --build backend` |
| Зайти в контейнер БД | `docker exec -it muzeum-postgres psql -U muzeum -d muzeum_db` |

---

## Краткий чек-лист деплоя

- [ ] Создан облачный сервер в Selectel (Ubuntu 22.04).
- [ ] Подключение по SSH работает.
- [ ] Установлены Docker и Docker Compose.
- [ ] Код проекта на сервере (git clone или загрузка архива).
- [ ] В `backend/.env` заданы `DATABASE_URL` и `JWT_SECRET`.
- [ ] Запущена БД, применён `init.sql`.
- [ ] Собран фронтенд: `VITE_API_URL=/api npm run build` в папке `frontend`.
- [ ] Выполнено `docker compose -f compose.prod.yml up -d` в папке `deploy`.
- [ ] Сайт открывается по http://IP_СЕРВЕРА.
- [ ] Открыт порт 80 (и при необходимости 22) в файрволе/панели Selectel.

Если что-то пойдёт не так, в первую очередь смотрите логи: `docker compose -f compose.prod.yml logs -f`.
