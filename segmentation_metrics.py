"""Semantic segmentation metrics with NumPy on synthetic masks.

Computes pixel accuracy, per-class IoU (Jaccard), mean IoU, per-class Dice (F1)
and mean Dice from a confusion matrix. A ground-truth mask with three classes
(0 background, 1 disk, 2 rectangle) is compared to a perturbed prediction.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import ListedColormap

FIG_DIR = Path(__file__).parent / "figures"
FIG_DIR.mkdir(exist_ok=True)


def confusion(gt, pred, n_classes):
    idx = n_classes * gt.ravel() + pred.ravel()
    return np.bincount(idx, minlength=n_classes**2).reshape(n_classes, n_classes)


def metrics_from_confusion(cm):
    tp = np.diag(cm).astype(float)
    fp = cm.sum(axis=0) - tp
    fn = cm.sum(axis=1) - tp
    iou = tp / np.maximum(tp + fp + fn, 1e-12)
    dice = 2 * tp / np.maximum(2 * tp + fp + fn, 1e-12)
    return {
        "pixel_accuracy": tp.sum() / cm.sum(),
        "iou_per_class": iou,
        "mIoU": iou.mean(),
        "dice_per_class": dice,
        "mean_dice": dice.mean(),
    }


def make_masks(size=128):
    yy, xx = np.mgrid[:size, :size]
    gt = np.zeros((size, size), dtype=int)
    gt[(yy - 50) ** 2 + (xx - 45) ** 2 < 28**2] = 1
    gt[70:115, 70:120] = 2
    pred = np.zeros_like(gt)
    pred[(yy - 55) ** 2 + (xx - 52) ** 2 < 27**2] = 1   # shifted disk
    pred[76:118, 66:112] = 2                             # shifted rectangle
    return gt, pred


def run():
    gt, pred = make_masks()
    res = metrics_from_confusion(confusion(gt, pred, 3))
    cmap = ListedColormap(["#FFFFFF", "#1565C0", "#EF6C00"])
    fig, axes = plt.subplots(1, 3, figsize=(9, 3.2), facecolor="white")
    for ax, img, t in zip(axes, [gt, pred, (gt != pred)],
                          ["Ground truth", "Prediction", "Errors"]):
        ax.imshow(img, cmap=cmap if t != "Errors" else "Reds", vmin=0, vmax=2 if t != "Errors" else 1)
        ax.set_title(t)
        ax.axis("off")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "segmentation_masks.png", dpi=200)
    plt.close(fig)
    return res


if __name__ == "__main__":
    r = run()
    print("=== Semantic segmentation metrics (synthetic masks) ===")
    print(f"pixel accuracy : {r['pixel_accuracy']:.4f}")
    print("IoU per class  :", np.round(r["iou_per_class"], 4), f"-> mIoU = {r['mIoU']:.4f}")
    print("Dice per class :", np.round(r["dice_per_class"], 4), f"-> mean Dice = {r['mean_dice']:.4f}")
