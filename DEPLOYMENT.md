# 🚀 Инструкция по Деплою Портала Росатома

## Быстрый старт (Рекомендуемый способ)

### Вариант 1: Vercel + Neon (PostgreSQL) - РЕКОМЕНДУЕТСЯ

#### Шаг 1: Подготовка базы данных PostgreSQL

1. **Создайте бесплатную PostgreSQL базу на Neon**
   - Зайдите на https://neon.tech
   - Зарегистрируйтесь (бесплатно)
   - Создайте новый проект
   - Скопируйте строку подключения (Connection String)

2. **Обновите schema.prisma**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Примените миграции к новой базе**
   ```bash
   # Установите новый DATABASE_URL временно
   DATABASE_URL="postgresql://username:password@host/database" npx prisma db push

   # Заполните базу данными
   DATABASE_URL="postgresql://username:password@host/database" npx tsx prisma/seed.ts
   ```

#### Шаг 2: Деплой на Vercel

1. **Установите Vercel CLI** (опционально)
   ```bash
   npm i -g vercel
   ```

2. **Подготовьте проект**
   ```bash
   # Создайте .gitignore если его нет
   echo "node_modules
   .next
   .env
   .env.local
   prisma/dev.db
   prisma/*.db
   prisma/*.db-journal" > .gitignore
   ```

3. **Загрузите проект на GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Rosatom Volunteer Portal"
   git branch -M main
   git remote add origin https://github.com/your-username/rosatom-portal.git
   git push -u origin main
   ```

4. **Деплой через Vercel Dashboard**
   - Зайдите на https://vercel.com
   - Нажмите "Add New Project"
   - Импортируйте ваш GitHub репозиторий
   - Настройте Environment Variables (см. ниже)
   - Нажмите "Deploy"

#### Шаг 3: Настройка Environment Variables в Vercel

В настройках проекта на Vercel добавьте следующие переменные:

```env
# Database
DATABASE_URL=postgresql://username:password@host/database

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-string-here-at-least-32-characters

# Email (опционально)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-domain.com

# Yandex Maps
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=your-yandex-maps-api-key

# VK OAuth (опционально)
VK_CLIENT_ID=your-vk-client-id
VK_CLIENT_SECRET=your-vk-client-secret
NEXT_PUBLIC_VK_CLIENT_ID=your-vk-client-id
NEXT_PUBLIC_VK_ENABLED=true

# App
NEXT_PUBLIC_APP_NAME=Волонтерский Портал Росатома
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Генерация NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Или используйте онлайн генератор: https://generate-secret.vercel.app/32

---

## Вариант 2: Railway (All-in-one решение)

Railway предоставляет и хостинг приложения, и PostgreSQL базу в одном месте.

1. **Зарегистрируйтесь на Railway**
   - Зайдите на https://railway.app
   - Зарегистрируйтесь через GitHub

2. **Создайте новый проект**
   - New Project → Deploy from GitHub repo
   - Выберите ваш репозиторий

3. **Добавьте PostgreSQL**
   - Add Service → Database → PostgreSQL
   - Railway автоматически создаст DATABASE_URL

4. **Настройте переменные окружения**
   - Зайдите в настройки вашего сервиса
   - Добавьте все переменные из примера выше

5. **Деплой**
   - Railway автоматически задеплоит при каждом push в GitHub

---

## Вариант 3: Render (Бесплатный tier)

1. **Создайте PostgreSQL базу на Render**
   - https://dashboard.render.com → New → PostgreSQL
   - Сохраните Internal/External Database URL

2. **Деплой приложения**
   - New → Web Service
   - Подключите GitHub репозиторий
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Добавьте Environment Variables**
   - Используйте тот же список переменных

---

## Подготовка данных для деплоя

### Миграция данных из SQLite в PostgreSQL

Если у вас уже есть данные в SQLite и вы хотите перенести их в PostgreSQL:

1. **Экспорт данных (опционально)**
   ```bash
   # Создайте скрипт для экспорта данных
   npx tsx scripts/export-data.ts
   ```

2. **Или пересоздайте данные на новой базе**
   ```bash
   # Подключитесь к PostgreSQL базе
   DATABASE_URL="your-postgres-url" npx prisma db push
   DATABASE_URL="your-postgres-url" npx tsx prisma/seed.ts
   ```

### Важно: Обновите schema.prisma для PostgreSQL

```prisma
datasource db {
  provider = "postgresql"  // Измените с "sqlite"
  url      = env("DATABASE_URL")
}
```

После изменения выполните:
```bash
npx prisma generate
```

---

## После деплоя

### 1. Проверьте работу сайта
- Откройте ваш URL
- Проверьте регистрацию/вход
- Проверьте создание НКО
- Проверьте карту (Yandex Maps API)

### 2. Первоначальная настройка

Войдите как администратор:
```
Email: admin@rosatom-volunteers.ru
Password: admin123
```

**ВАЖНО: Сразу смените пароль администратора!**

### 3. Настройте домен (опционально)

**На Vercel:**
- Settings → Domains → Add Domain
- Следуйте инструкциям по настройке DNS

**На Railway:**
- Settings → Networking → Custom Domain

### 4. Настройте VK OAuth (опционально)

1. Зайдите на https://vk.com/apps?act=manage
2. Создайте новое приложение
3. Укажите Redirect URI: `https://your-domain.com/api/auth/callback/vk`
4. Добавьте Client ID и Secret в переменные окружения

---

## Проверочный список перед деплоем

- [ ] Обновлен schema.prisma (SQLite → PostgreSQL)
- [ ] Создана PostgreSQL база данных
- [ ] Применены миграции (prisma db push)
- [ ] Заполнена база данными (seed.ts)
- [ ] Настроены все Environment Variables
- [ ] Сгенерирован безопасный NEXTAUTH_SECRET
- [ ] Проект загружен на GitHub
- [ ] Выбрана платформа для хостинга
- [ ] Проведен тестовый деплой
- [ ] Сменен пароль администратора

---

## Устранение проблем

### Ошибка: "Prisma Client not generated"
```bash
npx prisma generate
```

### Ошибка при миграции базы данных
```bash
# Пересоздайте базу
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

### Не работает карта
- Проверьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY
- Убедитесь, что API ключ активен на https://developer.tech.yandex.ru

### Ошибки при входе
- Проверьте NEXTAUTH_URL (должен соответствовать вашему домену)
- Проверьте NEXTAUTH_SECRET (должен быть одинаковым на всех инстансах)

---

## Рекомендуемая архитектура для production

```
┌─────────────────┐
│   Vercel        │  ← Next.js приложение
│   (Frontend +   │
│   API Routes)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Neon.tech     │  ← PostgreSQL база данных
│   (Database)    │
└─────────────────┘
```

---

## Мониторинг и аналитика (опционально)

### Добавьте Sentry для отслеживания ошибок
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Добавьте Vercel Analytics
- Vercel Dashboard → Analytics → Enable

---

## Резервное копирование данных

### Автоматические бэкапы на Neon
- Neon автоматически создает бэкапы
- Можно восстановить на любую точку времени (Point-in-Time Recovery)

### Ручной экспорт базы
```bash
# PostgreSQL dump
pg_dump $DATABASE_URL > backup.sql

# Восстановление
psql $DATABASE_URL < backup.sql
```

---

## Полезные ссылки

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Railway Docs**: https://docs.railway.app
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Стоимость хостинга (ориентировочно)

### Бесплатные опции:
- **Vercel**: Бесплатно для hobby проектов
- **Neon**: Бесплатно до 3 GB storage
- **Railway**: $5 кредитов в месяц бесплатно
- **Render**: Бесплатный tier (засыпает после неактивности)

### Платные опции (если нужно):
- **Vercel Pro**: $20/месяц
- **Neon Pro**: от $19/месяц
- **Railway**: Pay-as-you-go (~$10-20/месяц)

---

**Удачи с деплоем! 🚀**

Если возникнут вопросы - обращайтесь к документации или в поддержку выбранной платформы.
