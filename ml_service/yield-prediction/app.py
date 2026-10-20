"""Run: uvicorn app:app --reload   (docs at /docs)"""
import json
import joblib, pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

model = joblib.load("model.joblib")
meta = json.load(open("meta.json"))
app = FastAPI(title="Crop Yield Prediction")


class PredictRequest(BaseModel):
    state_name: str
    district_name: str
    crop_year: int = Field(ge=1990, le=2100)
    season: str                      # e.g. "Kharif", "Rabi", "Whole Year"
    crop: str
    area: float = Field(gt=0, description="hectares")


class PredictResponse(BaseModel):
    yield_t_per_ha: float
    production_tonnes: float
    warnings: list[str] = []


@app.get("/health")
def health():
    return {"status": "ok", "metrics": meta["metrics"]}


@app.get("/options")
def options():
    return {k: v for k, v in meta.items() if k != "metrics"}


@app.post("/predict", response_model=PredictResponse)
def predict(r: PredictRequest):
    row = {"State_Name": r.state_name.strip(), "Season": r.season.strip(),
           "Crop": r.crop.strip(), "District_Name": r.district_name.strip(),
           "Crop_Year": r.crop_year, "Area": r.area}
    warnings = [f"Unseen {k}: '{v}' (prediction less reliable)"
                for k, v in row.items() if k in meta and v not in meta[k]]
    y = float(model.predict(pd.DataFrame([row]))[0])
    return PredictResponse(yield_t_per_ha=round(y, 4),
                           production_tonnes=round(y * r.area, 2), warnings=warnings)
