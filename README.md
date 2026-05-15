# E-commerce (WhatYouWear)

Full-stack e-commerce application with a **React + Vite** frontend and **Django REST Framework** backend, including JWT auth, Google login, cart/order flows, reviews, and Razorpay payments.

## Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS, Framer Motion
- **Backend:** Django, Django REST Framework, SimpleJWT, CORS Headers
- **Database:** SQLite (default), PostgreSQL via `dj-database-url`
- **Payments:** Razorpay
- **Auth:** Email/password + Google OAuth

## Project Structure

```text
E-commerce/
├── backend/
│   ├── accounts/          # user/auth APIs
│   ├── product/           # categories, products, cart, orders, reviews
│   ├── payment/           # Razorpay create/verify APIs
│   ├── backend/           # Django settings/urls
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── contexts/
    │   └── services/api.js
    └── package.json
```

## Main Features

- Product catalog with category, search, sorting, stock checks
- Product detail pages with images, sizes, colors, specs
- Cart for authenticated users and guests (session cart)
- Checkout and order creation
- Razorpay payment create + verify flow
- Order management (list, cancel, refund request)
- Product reviews (one review per user/product)
- User profile management
- Password reset flow
- Google login support

## Local Setup

## 1) Backend Setup (Django)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend default URL: `http://127.0.0.1:8000`

Create `backend/.env`:

```env
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

GOOGLE_CLIENT_ID=your_google_client_id

EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_email_password
FRONTEND_URL=http://localhost:5173
```

## 2) Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## API Overview

Base URL (local): `http://127.0.0.1:8000/api`

### Auth (`/api/accounts/`)

- `POST /register/`
- `POST /login/`
- `POST /google-login/`
- `GET/PATCH /profile/`
- `POST /logout/`
- `POST /forgot-password/`
- `POST /reset-password/<uidb64>/<token>/`
- `GET /validate-reset-token/<uidb64>/<token>/`

### Token

- `POST /api/token/refresh/`

### Catalog, Cart, Orders, Reviews (`/api/`)

- Categories: `GET /categories/`
- Products: `GET /products/`, `GET /products/<id_or_slug>/`
- Cart:
  - `GET /cart/current/`
  - `POST /cart/add_item/`
  - `PATCH /cart/update_item/`
  - `DELETE /cart/remove_item/?item_id=<id>`
  - `DELETE /cart/clear/`
- Orders:
  - `GET /orders/`
  - `POST /orders/`
  - `POST /orders/<id>/cancel/`
  - `POST /orders/<id>/refund/`
- Reviews:
  - `GET /reviews/?product_id=<id>`
  - `POST /reviews/`

### Payment

- `POST /api/payment/create-order/`
- `POST /api/payment/verify/`

## Frontend Scripts

Inside `frontend/`:

- `npm run dev` – start development server
- `npm run build` – build production assets
- `npm run lint` – run ESLint
- `npm run preview` – preview production build

## Notes

- Frontend uses `/api` proxy in Vite dev server to forward requests to production API unless `VITE_API_BASE_URL` is explicitly set.
- Keep all secrets in `.env` files and never commit them.
