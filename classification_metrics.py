"""Image classification metrics on the scikit-learn digits dataset (8x8 images).

Computes: accuracy, top-k accuracy, per-class precision / recall / F1,
macro and weighted averages, confusion matrix, one-vs-rest ROC-AUC.
Figures are saved in ./figures.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
    roc_auc_score,
    top_k_accuracy_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FIG_DIR = Path(__file__).parent / "figures"
FIG_DIR.mkdir(exist_ok=True)


def run():
    X, y = load_digits(return_X_y=True)
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    scaler = StandardScaler().fit(X_tr)
    clf = LogisticRegression(max_iter=2000).fit(scaler.transform(X_tr), y_tr)
    proba = clf.predict_proba(scaler.transform(X_te))
    pred = proba.argmax(axis=1)

    results = {
        "accuracy": accuracy_score(y_te, pred),
        "top3_accuracy": top_k_accuracy_score(y_te, proba, k=3),
        "roc_auc_ovr_macro": roc_auc_score(y_te, proba, multi_class="ovr"),
    }
    p, r, f1, _ = precision_recall_fscore_support(y_te, pred, average="macro")
    results.update(macro_precision=p, macro_recall=r, macro_f1=f1)
    _, _, wf1, _ = precision_recall_fscore_support(y_te, pred, average="weighted")
    results["weighted_f1"] = wf1

    cm = confusion_matrix(y_te, pred)
    fig, ax = plt.subplots(figsize=(5.2, 4.6), facecolor="white")
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xlabel("Predicted class")
    ax.set_ylabel("True class")
    ax.set_xticks(range(10))
    ax.set_yticks(range(10))
    for i in range(10):
        for j in range(10):
            ax.text(j, i, cm[i, j], ha="center", va="center", fontsize=7,
                    color="white" if cm[i, j] > cm.max() / 2 else "black")
    fig.colorbar(im, ax=ax, fraction=0.046)
    ax.set_title("Confusion matrix (digits, test set)")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "classification_confusion.png", dpi=200)
    plt.close(fig)
    return results, cm


if __name__ == "__main__":
    res, cm = run()
    print("=== Image classification metrics (digits) ===")
    for k, v in res.items():
        print(f"{k:>20s}: {v:.4f}")
    print("Confusion matrix saved to figures/classification_confusion.png")
