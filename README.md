# FarmSync

Crop-cycle management for Indian farmers: track expenses and sales, get yield estimates, see live mandi prices and weather alerts, and detect leaf disease from a photo.

## Features

- **Crop cycles:** create a cycle by state, district, crop and season; dashboard with crop stage, weather alerts and finance summary
- **Yield prediction:** gradient-boosting model (R² 0.92, MAE 0.74 t/ha vs 1.60 baseline)
- **Disease detection:** upload a leaf image (maize, grapes, potato, tomato) and get the disease with a confidence score
- **Mandi prices:** daily price from data.gov.in , with price history and carry-forward for missing days
- **Weather:** 7-day forecast (Open-Meteo) with heavy-rain, heat, cold and wind warnings
- **Finance:** expenses, sales and profit tracking per cycle
- **Auth:** JWT login and registration

## Architecture

```
client/  React 19 + Vite + Tailwind + Recharts
server/  Express + MongoDB (Mongoose), JWT auth
ml_service/
  yield-prediction/    FastAPI + scikit-learn (HistGradientBoosting)
  disease-prediction/  FastAPI + MobileNetV2 embeddings + logistic regression
```

## Setup

```bash
# Server
cd server && npm install
cp .env.example .env   # PORT, MONGODB_URI, JWT_SECRET, DATA_GOV_API_KEY, YIELD_SERVICE_URL, DISEASE_SERVICE_URL
npm run dev

# Client
cd client && npm install && npm run dev

# ML services (separate terminals)
cd ml_service/yield-prediction && pip install -r requirements.txt && uvicorn app:app --port 8000
cd ml_service/disease-prediction && pip install -r requirements.txt && uvicorn app:app --port 8001

# Fetch mandi prices manually
cd server && npm run fetch-prices
```

## API (all under `/api`)

| Route                                                                                  | Purpose           |
| -------------------------------------------------------------------------------------- | ----------------- |
| `POST /auth/register`, `/auth/login`                                                   | Authentication    |
| `GET/POST/DELETE /cycles`                                                              | Crop cycles       |
| `GET /cycles/:id/estimate \| price-history \| weather \| finance-summary \| dashboard` | Cycle insights    |
| `POST/GET /cycles/:id/disease`                                                         | Disease detection |
| `POST/GET /cycles/:id/expenses`, `/sales`                                              | Finance records   |
| `GET /meta/states \| districts \| crops \| seasons \| mandis`                          | Reference data    |

## Tech Stack

React, Vite, Tailwind, Node.js, Express, MongoDB, FastAPI, scikit-learn, PyTorch
