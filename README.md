# BookShop

Веб-приложение для заказа и покупки книг с современным UI.

## Стек технологий

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + TailwindCSS
- **База данных**: PostgreSQL 15

## Быстрый старт

### Требования
- Docker + Docker Compose

### Запуск

```bash
# 1. Клонируй репозиторий
git clone https://github.com/USERNAME/bookshop.git
cd bookshop

# 2. Запусти
docker-compose up --build
```

Открой http://localhost:3000

## Доступ

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Тестовые аккаунты
- **Админ**: `admin@bookshop.com` / `admin123`
- **Создай свой аккаунт** через регистрацию

## Функционал

- 📚 Каталог книг с поиском и фильтрацией
- 🛒 Корзина покупок
- 📦 Оформление заказов
- 👤 Регистрация и авторизация (JWT)
- 🔐 Админ-панель для управления книгами

## API Endpoints

- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/books` - список книг
- `GET /api/books/:id` - детали книги
- `GET /api/cart` - корзина пользователя
- `POST /api/orders` - создать заказ
