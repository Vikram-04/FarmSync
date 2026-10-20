"""Train a crop-yield model.  Usage: python train.py --data crop_production.csv"""
import argparse, json
import joblib, numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder, TargetEncoder

CAT_LOW = ["State_Name", "Season", "Crop"]   # low cardinality -> native categorical
CAT_HIGH = ["District_Name"]                 # ~600 values -> target encoding
NUM = ["Crop_Year", "Area"]
FEATURES = CAT_LOW + CAT_HIGH + NUM


def load(path):
    df = pd.read_csv(path)
    for c in CAT_LOW + CAT_HIGH:
        df[c] = df[c].astype(str).str.strip()          # Season has trailing spaces
    df = df.dropna(subset=["Production", "Area"])
    df = df[(df.Area > 0) & (df.Production >= 0)]
    df["Yield"] = df.Production / df.Area                # tonnes per hectare
    cap = df.groupby("Crop")["Yield"].transform(lambda s: s.quantile(0.995))
    return df[df.Yield <= cap]                           # trim data-entry outliers


def build():
    pre = ColumnTransformer([
        ("low", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), CAT_LOW),
        ("high", TargetEncoder(random_state=0), CAT_HIGH),
        ("num", "passthrough", NUM),
    ])
    gbm = HistGradientBoostingRegressor(
        categorical_features=[0, 1, 2], learning_rate=0.08,
        max_iter=500, early_stopping=True, random_state=0)
    return TransformedTargetRegressor(
        regressor=Pipeline([("pre", pre), ("gbm", gbm)]),
        func=np.log1p, inverse_func=np.expm1)


def main(path):
    df = load(path)
    # Time-based split: train on the past, test on the last 2 years
    cutoff = df.Crop_Year.max() - 2
    tr, te = df[df.Crop_Year <= cutoff], df[df.Crop_Year > cutoff]
    m = build().fit(tr[FEATURES], tr.Yield)
    pred = m.predict(te[FEATURES])
    # baseline: mean yield per crop
    base = te.Crop.map(tr.groupby("Crop").Yield.mean()).fillna(tr.Yield.mean())
    metrics = {
        "mae_t_per_ha": float(mean_absolute_error(te.Yield, pred)),
        "r2": float(r2_score(te.Yield, pred)),
        "baseline_mae_t_per_ha": float(mean_absolute_error(te.Yield, base)),
        "test_years": f">{cutoff}",
    }
    print(metrics)

    final = build().fit(df[FEATURES], df.Yield)          # refit on everything
    joblib.dump(final, "model.joblib")
    meta = {c: sorted(df[c].unique().tolist()) for c in CAT_LOW + CAT_HIGH}
    meta["metrics"] = metrics
    json.dump(meta, open("meta.json", "w"), indent=2)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    main(ap.parse_args().data)
