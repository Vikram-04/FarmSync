"""
Train the leaf-disease classifier.

Usage:
  python train.py --data /path/to/PlantVillage/color
  python train.py --data ... --limit 0              # use all images per class (slow)
  python train.py --data ... --crops "Tomato,Potato" # choose other crops (PlantVillage names)
  python train.py --data ... --crops all             # every crop in the folder
  python train.py --data ... --reuse                 # reuse features.npz if it matches

--data must be a folder containing one sub-folder per class, named Crop___Condition, e.g.
  Tomato___Late_blight/, Tomato___healthy/, Potato___Early_blight/ ...
(this is how the PlantVillage dataset on Kaggle is organised).

How it works:
  1. MobileNetV2 (pre-trained, not changed) turns every image into 1280 numbers.
  2. A logistic regression learns to map those numbers to a disease label.
Output: model.joblib (used by app.py)
"""
import argparse
import os
import random
from collections import defaultdict

import joblib
import numpy as np
from PIL import Image
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from features import embed

# Crops supported by FarmSync: the overlap of crops.json and PlantVillage.
DEFAULT_CROPS = ["Corn_(maize)", "Grape", "Potato", "Tomato"]
EXTS = {".jpg", ".jpeg", ".png"}
BATCH = 32
CACHE = "features.npz"


def crop_of(folder_name):
    return folder_name.split("___")[0]


def list_images(root, limit, crops):
    """Image paths and labels for the chosen crops. crops=None means every crop."""
    folders = sorted(f for f in os.listdir(root) if os.path.isdir(os.path.join(root, f)))
    available = sorted({crop_of(f) for f in folders})
    if crops is not None:
        wanted = {c.lower() for c in crops}
        missing = [c for c in crops if c.lower() not in {a.lower() for a in available}]
        if missing:
            print(f"WARNING: no folders found for: {', '.join(missing)}")
            print(f"Crops available in this dataset folder: {', '.join(available)}")
        folders = [f for f in folders if crop_of(f).lower() in wanted]

    per_crop = defaultdict(list)
    for f in folders:
        per_crop[crop_of(f)].append(f)
    for crop, fs in per_crop.items():
        if len(fs) < 2:
            print(f"WARNING: {crop} has only one class ({fs[0]}); the model cannot tell healthy from diseased for it.")

    rng = random.Random(0)
    paths, labels = [], []
    for cls in folders:
        folder = os.path.join(root, cls)
        files = [f for f in sorted(os.listdir(folder)) if os.path.splitext(f)[1].lower() in EXTS]
        if limit and len(files) > limit:
            files = rng.sample(files, limit)
        paths += [os.path.join(folder, f) for f in files]
        labels += [cls] * len(files)
    return paths, labels


def extract(paths, labels):
    feats, kept = [], []
    for i in range(0, len(paths), BATCH):
        imgs, labs = [], []
        for p, lab in zip(paths[i:i + BATCH], labels[i:i + BATCH]):
            try:
                imgs.append(Image.open(p).convert("RGB"))
                labs.append(lab)
            except OSError:
                print(f"Skipping unreadable image: {p}")
        if imgs:
            feats.append(embed(imgs))
            kept += labs
        if (i // BATCH) % 20 == 0:
            print(f"  {min(i + BATCH, len(paths))}/{len(paths)} images")
    return np.vstack(feats), np.array(kept)


def main(data, limit=500, reuse=False, crops=DEFAULT_CROPS):
    key = f"{','.join(sorted(crops)) if crops else 'all'}|{limit}"
    X = y = None
    if reuse and os.path.exists(CACHE):
        z = np.load(CACHE, allow_pickle=True)
        if str(z["key"]) == key:
            X, y = z["X"], z["y"]
            print(f"Loaded cached features: {len(y)} images")
        else:
            print("features.npz was made with different --crops/--limit, extracting again")
    if X is None:
        paths, labels = list_images(data, limit, crops)
        if not paths:
            raise SystemExit("No images found. Check --data and --crops.")
        print(f"{len(paths)} images in {len(set(labels))} classes. Extracting features...")
        X, y = extract(paths, labels)
        np.savez(CACHE, X=X, y=y, key=key)

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
    clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    clf.fit(X_tr, y_tr)

    pred = clf.predict(X_te)
    metrics = {
        "accuracy": float(accuracy_score(y_te, pred)),
        "macro_f1": float(f1_score(y_te, pred, average="macro")),
        "classes": int(len(clf.classes_)),
        "crops": sorted({crop_of(c) for c in clf.classes_}),
        "train_images": int(len(y_tr)),
        "test_images": int(len(y_te)),
    }
    print(metrics)

    joblib.dump({"clf": clf, "metrics": metrics}, "model.joblib")
    print("Saved model.joblib")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--limit", type=int, default=500, help="max images per class, 0 = all")
    ap.add_argument("--crops", default=",".join(DEFAULT_CROPS),
                    help='comma-separated PlantVillage crop names, or "all"')
    ap.add_argument("--reuse", action="store_true", help="reuse features.npz if it matches")
    a = ap.parse_args()
    crops = None if a.crops.strip().lower() == "all" else [c.strip() for c in a.crops.split(",") if c.strip()]
    main(a.data, a.limit, a.reuse, crops)
