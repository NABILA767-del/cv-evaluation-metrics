"""Object detection metrics implemented from scratch with NumPy.

Boxes are [x1, y1, x2, y2]. Implements IoU, greedy matching of detections to
ground truth, precision-recall curve, Average Precision (all-point
interpolation, as in PASCAL VOC 2010+), mAP@0.5 and COCO-style mAP@[.5:.95].
A small synthetic example is used so the numbers can be checked by hand.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

FIG_DIR = Path(__file__).parent / "figures"
FIG_DIR.mkdir(exist_ok=True)


def iou(a, b):
    """Intersection over Union of two boxes."""
    x1, y1 = max(a[0], b[0]), max(a[1], b[1])
    x2, y2 = min(a[2], b[2]), min(a[3], b[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    area_a = (a[2] - a[0]) * (a[3] - a[1])
    area_b = (b[2] - b[0]) * (b[3] - b[1])
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0.0


def precision_recall(detections, ground_truths, iou_thr=0.5):
    """detections: list of (image_id, score, box); ground_truths: {image_id: [boxes]}.

    Returns precision and recall arrays, detections sorted by decreasing score.
    """
    n_gt = sum(len(v) for v in ground_truths.values())
    dets = sorted(detections, key=lambda d: -d[1])
    used = {k: np.zeros(len(v), dtype=bool) for k, v in ground_truths.items()}
    tp = np.zeros(len(dets))
    fp = np.zeros(len(dets))
    for i, (img, _, box) in enumerate(dets):
        gts = ground_truths.get(img, [])
        best, best_j = 0.0, -1
        for j, g in enumerate(gts):
            v = iou(box, g)
            if v > best:
                best, best_j = v, j
        if best >= iou_thr and not used[img][best_j]:
            tp[i] = 1
            used[img][best_j] = True
        else:
            fp[i] = 1
    tp_c, fp_c = np.cumsum(tp), np.cumsum(fp)
    recall = tp_c / max(n_gt, 1)
    precision = tp_c / np.maximum(tp_c + fp_c, 1e-12)
    return precision, recall


def average_precision(precision, recall):
    """Area under the monotone (interpolated) precision-recall curve."""
    mrec = np.concatenate(([0.0], recall, [1.0]))
    mpre = np.concatenate(([0.0], precision, [0.0]))
    for i in range(len(mpre) - 2, -1, -1):
        mpre[i] = max(mpre[i], mpre[i + 1])
    idx = np.where(mrec[1:] != mrec[:-1])[0]
    return float(np.sum((mrec[idx + 1] - mrec[idx]) * mpre[idx + 1]))


def synthetic_example():
    gts = {
        0: [[10, 10, 60, 60], [100, 100, 160, 170]],
        1: [[20, 30, 90, 100]],
        2: [[50, 50, 120, 110], [150, 20, 200, 80], [10, 130, 70, 190]],
    }
    dets = [
        (0, 0.95, [12, 12, 58, 62]),      # good match
        (0, 0.90, [98, 105, 158, 168]),   # good match
        (0, 0.60, [200, 200, 240, 240]),  # false positive
        (1, 0.88, [25, 35, 95, 105]),     # good match
        (1, 0.55, [22, 32, 92, 102]),     # duplicate -> false positive
        (2, 0.92, [52, 48, 118, 112]),    # good match
        (2, 0.80, [150, 25, 205, 90]),    # good match
        (2, 0.45, [0, 120, 50, 170]),     # weak overlap -> false positive
        (2, 0.40, [12, 128, 72, 188]),    # good match, low score
    ]
    return dets, gts


def run():
    dets, gts = synthetic_example()
    results = {}
    p, r = precision_recall(dets, gts, 0.5)
    results["AP@0.5"] = average_precision(p, r)
    thresholds = np.arange(0.5, 0.96, 0.05)
    aps = [average_precision(*precision_recall(dets, gts, t)) for t in thresholds]
    results["AP@0.75"] = aps[5]
    results["AP@[.5:.95]"] = float(np.mean(aps))

    fig, ax = plt.subplots(figsize=(5.2, 4.0), facecolor="white")
    ax.step(np.concatenate(([0], r)), np.concatenate(([1], p)), where="post",
            color="#1565C0", lw=2)
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_xlim(0, 1.02)
    ax.set_ylim(0, 1.05)
    ax.set_title(f"Precision-recall curve (AP@0.5 = {results['AP@0.5']:.3f})")
    ax.grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(FIG_DIR / "detection_pr_curve.png", dpi=200)
    plt.close(fig)
    return results, thresholds, aps


if __name__ == "__main__":
    print("IoU example:", round(iou([0, 0, 10, 10], [5, 5, 15, 15]), 4), "(expected 0.1429)")
    res, thr, aps = run()
    print("=== Object detection metrics (synthetic example) ===")
    for k, v in res.items():
        print(f"{k:>14s}: {v:.4f}")
    print("AP per IoU threshold:", {round(float(t), 2): round(a, 3) for t, a in zip(thr, aps)})
