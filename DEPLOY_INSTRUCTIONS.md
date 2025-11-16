# Инструкция по деплою на Vercel

## Шаг 1: Загрузка на GitHub

1. Создай новый репозиторий на https://github.com (НЕ инициализируй с README)
2. Выполни команды (замени YOUR_USERNAME на свой):

```bash
git remote add origin https://github.com/YOUR_USERNAME/rosatom-volunteer-portal.git
git branch -M main
git push -u origin main
```

## Шаг 2: Деплой на Vercel

1. Зайди на https://vercel.com и войди через GitHub
2. Нажми **"Add New..." → "Project"**
3. Выбери репозиторий `rosatom-volunteer-portal`
4. Нажми **"Import"**

### Настройка переменных окружения (Environment Variables)

В настройках проекта добавь переменные:

#### 1. База данных (Vercel Postgres - бесплатно)

- Нажми **"Storage"** → **"Create Database"** → выбери **"Postgres"**
- После создания автоматически добавятся:
  - `DATABASE_URL`
  - `POSTGRES_URL`
  - И другие PostgreSQL переменные

#### 2. NextAuth

```
NEXTAUTH_URL=https://твой-проект.vercel.app
NEXTAUTH_SECRET=твой-секретный-ключ-сгенерируй-его
```

Сгенерировать NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### 3. Email (опционально, для уведомлений)

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=твой-email@gmail.com
EMAIL_SERVER_PASSWORD=твой-app-пароль
EMAIL_FROM=твой-email@gmail.com
```

#### 4. Yandex Maps API

```
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=твой-ключ-яндекс-карт
```

Получить ключ: https://developer.tech.yandex.ru/

#### 5. VK OAuth (опционально)

```
VK_CLIENT_ID=твой-vk-app-id
VK_CLIENT_SECRET=твой-vk-app-secret
```

## Шаг 3: Настройка базы данных

Перед деплоем нужно изменить Prisma schema на PostgreSQL:

1. Открой `prisma/schema.prisma`
2. Измени:
```prisma
datasource db {
  provider = "postgresql"  // было "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Закоммить и запушить:
```bash
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

4. После деплоя выполни команды в Vercel терминале:
```bash
npx prisma db push
npx prisma db seed
```

Или через Vercel CLI:
```bash
vercel env pull
npx prisma db push
npx prisma db seed
vercel deploy --prod
```

## Шаг 4: Проверка

1. Дождись завершения деплоя
2. Перейди по ссылке типа `https://твой-проект.vercel.app`
3. Проверь работу сайта

## Тестовые пользователи (будут созданы через seed)

После выполнения `npx prisma db seed`:

**Администратор:**
- Email: admin@rosatom.ru
- Пароль: admin123

**Волонтер:**
- Email: volunteer@test.ru
- Пароль: volunteer123

**НКО:**
- Email: ngo@test.ru
- Пароль: ngo123

## Если что-то пошло не так

### Проблема: База данных не подключается
- Проверь `DATABASE_URL` в environment variables
- Убедись, что Vercel Postgres создана

### Проблема: Ошибка при билде
- Проверь логи в Vercel Dashboard
- Убедись, что schema.prisma использует postgresql

### Проблема: Карты не работают
- Проверь `NEXT_PUBLIC_YANDEX_MAPS_API_KEY`
- Убедись, что ключ активен на Yandex Developer

## Полезные ссылки

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Yandex Maps API: https://developer.tech.yandex.ru/
