# NovaCart Account Dashboard
### HC&D Associates Capstone — App Developer + App Consultant

A fully implemented account manager dashboard for NovaCart, built with FastAPI (backend) and React 18 (frontend), deployed on Snowflake SPCS.

---

## What's in this repo

```
backend/          Python + FastAPI API — 5 endpoints implemented
  main.py         ← App entry point and router registration
  connection.py   ← Handles SQLite (local) and Snowflake (SPCS) automatically
  routers/franchise/
    summary.py    ← GET /franchise/{id}/summary
    orders.py     ← GET /franchise/{id}/orders
    products.py   ← GET /franchise/{id}/products
    customers.py  ← GET /franchise/{id}/customers
    countries.py  ← GET /franchise/{id}/countries
  requirements.txt
  Dockerfile

frontend/         React 18 dashboard — 3 views implemented
  src/pages/
    OrdersView.js     ← Stat cards + monthly revenue chart + revenue by state
    ProductsView.js   ← Top 10 products bar chart + product details table
    CustomersView.js  ← Sortable top 20 customers table
  src/components/     ← Navbar, ServiceStatus
  src/utils/          ← api.js (all API calls), ThemeContext.js
  Dockerfile

router/           NGINX reverse proxy — routes /api → backend, / → frontend
data/
  novacart_gold.db  ← SQLite database for local development
                      30,000 orders · 400 customers · 15 products

build-and-push.sh   ← Builds and pushes all 3 Docker images to Snowflake registry
```

---

## Quick Start — Local Development

### 1. Backend

```bash
cd backend
cp .env.example .env
# Default DATA_BACKEND=sqlite works out of the box

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** — Swagger UI with all 5 endpoints.

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env

npm install
npm start
# Opens at http://localhost:3000
```

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Service health check |
| `GET /franchise/{id}/summary` | Total revenue, orders, unique customers, date range |
| `GET /franchise/{id}/orders` | Monthly order volume and revenue (supports `start`/`end` params) |
| `GET /franchise/{id}/products` | Top 10 products by revenue (supports `start`/`end` params) |
| `GET /franchise/{id}/customers` | Top 20 customers by spend (supports `start`/`end` params) |
| `GET /franchise/{id}/countries` | Revenue by state (supports `start`/`end` params) |

Revenue calculations use `status IN ('delivered', 'shipped')` only.

---

## Data Schema

```
fact_orders    order_id, customer_id, product_id, order_date, amount,
               currency, status, quantity, date_key

dim_customer   customer_id, name, email, signup_date,
               addr_street, addr_city, addr_state, addr_zip,
               valid_from, valid_to, is_current

dim_product    product_id, name, category, price, updated_at

dim_date       date_key, full_date, year, quarter, month,
               month_name, day_of_week, is_weekend
```

---

## Deploying to SPCS (Day 4)

Deployment is handled by the facilitator via the GitHub Actions workflow.

**What the facilitator needs:**
- Your fork URL: `https://github.com/<your-username>/novacart-dashboard-starter`
- Your group number

**What gets deployed:**
- `backend_service_image_group{N}` — FastAPI backend on port 8000
- `frontend_service_image_group{N}` — React frontend on port 3000
- `router_service_image_group{N}` — NGINX reverse proxy on port 9000 (public)

**Image repository:**
```
se58322-snowflake-containers-adrianm.registry.snowflakecomputing.com/novacart_db/app/novacart_repository
```

**Verify images are in the registry (run in Snowsight):**
```sql
CALL SYSTEM$REGISTRY_LIST_IMAGES('/novacart_db/app/novacart_repository');
```

---

## Troubleshooting

**Backend can't find the database** — Run `uvicorn` from inside the `backend/` directory.

**CORS error in browser** — Make sure `CLIENT_VALIDATION=Dev` in your backend `.env`.

**Something broken after SPCS deployment** — Check service logs in Snowsight:
```sql
CALL SYSTEM$GET_SERVICE_LOGS('backend_service', '0', 'backend', 50);
CALL SYSTEM$GET_SERVICE_LOGS('frontend_service', '0', 'frontend', 50);
```
