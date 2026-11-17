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
<img width="8267" height="8414" alt="diagram" src="https://github.com/user-attachments/assets/b5459bd0-fa37-4f1a-b5c7-e38053a3bcf3" />

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

## Screenshots
<img width="988" height="808" alt="create-cycle" src="https://github.com/user-attachments/assets/5d44d0b7-fa2b-4658-955e-7ad74ef49cf1" />
<img width="1917" height="916" alt="cycles" src="https://github.com/user-attachments/assets/580ce245-b5c8-474d-bb3d-be7efefac247" />
<img width="1031" height="912" alt="dashboard" src="https://github.com/user-attachments/assets/cf13eaac-47cf-4482-89ce-da0b618b81c7" />
<img width="1510" height="796" alt="graph" src="https://github.com/user-attachments/assets/5c99119a-2f65-461e-8c44-2822b4f6519e" />
<img width="1520" height="802" alt="disease" src="https://github.com/user-attachments/assets/623736f4-9128-48cd-bc56-d7b1317b9bb1" />




