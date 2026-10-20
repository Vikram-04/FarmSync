"""
Run:  uvicorn app:app --port 8001      (interactive docs at http://localhost:8001/docs)

POST /predict   multipart form with:
    image  - the leaf photo (file)
    crop   - PlantVillage crop name, e.g. "Tomato", "Potato", "Grape", "Corn_(maize)"
  The model only considers that crop's classes (healthy + its diseases).
  -> { "disease": "Late blight", "confidence": 0.93, "crop": "Tomato",
       "healthy": false, "low_confidence": false,
       "alternatives": [ {"disease": "Early blight", "confidence": 0.04}, ... ] }

GET /health     status, training metrics and the crops the model supports
"""
import io
import re

import joblib
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image

from features import embed

LOW_CONFIDENCE = 0.5  # below this, the UI can ask for a clearer photo

bundle = joblib.load("model.joblib")
clf = bundle["clf"]
CLASSES = [str(c) for c in clf.classes_]
SUPPORTED = sorted({c.split("___")[0] for c in CLASSES})
app = FastAPI(title="Leaf Disease Prediction")


def tidy(s):
    return re.sub(r"[_\s]+", " ", s).strip(" _,").strip()


def pretty(label):
    """'Tomato___Late_blight' -> ('Tomato', 'Late blight'); 'Corn_(maize)___healthy' -> ('Corn (maize)', 'Healthy')"""
    crop, _, disease = label.partition("___")
    crop, disease = tidy(crop), tidy(disease)
    return crop, (disease[:1].upper() + disease[1:]) if disease else "Unknown"


@app.get("/health")
def health():
    return {"status": "ok", "crops": SUPPORTED, "metrics": bundle["metrics"]}


@app.post("/predict")
def predict(crop: str = Form(...), image: UploadFile = File(...)):
    prefix = f"{crop.strip()}___".lower()
    mask = np.array([c.lower().startswith(prefix) for c in CLASSES])
    if not mask.any():
        raise HTTPException(status_code=400, detail=f"Crop '{crop}' is not supported. Supported: {', '.join(SUPPORTED)}")

    try:
        img = Image.open(io.BytesIO(image.file.read())).convert("RGB")
    except OSError:
        raise HTTPException(status_code=400, detail="Not a valid image file")

    probs = clf.predict_proba(embed([img]))[0]
    probs = np.where(mask, probs, 0.0)
    probs = probs / probs.sum()  # confidence is now relative to this crop's classes only
    top = np.argsort(probs)[::-1][:3]

    crop_name, disease = pretty(CLASSES[top[0]])
    conf = float(probs[top[0]])
    return {
        "disease": disease,
        "confidence": round(conf, 4),
        "crop": crop_name,
        "healthy": disease.lower() == "healthy",
        "low_confidence": conf < LOW_CONFIDENCE,
        "alternatives": [
            {"disease": pretty(CLASSES[i])[1], "confidence": round(float(probs[i]), 4)}
            for i in top[1:] if probs[i] > 0
        ],
    }
