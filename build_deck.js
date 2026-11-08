const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const BLUE = "0B6FB8", DARK = "1F2937", GRAY = "5B6470", LIGHT = "EAF3FB",
  ORANGE = "EF6C00", PEACH = "FDEBDD", WHITE = "FFFFFF";
const HEAD = "Cambria", BODY = "Calibri";
const FIG = path.join(__dirname, "figures");
const AUTHOR = "Nabila Imouzaz";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = AUTHOR;
pres.title = "Evaluation Metrics for Computer Vision Tasks";

const notes = [];
let n = 0;

function base(title, note) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  n += 1;
  notes.push(note);
  s.addNotes(note);
  if (title) {
    s.addText(title, { x: 0.5, y: 0.35, w: 9, h: 0.7, fontFace: HEAD, fontSize: 34, bold: true,
      color: DARK, margin: 0, valign: "middle", isTextBox: true });
    s.addText(AUTHOR + "  |  Master Data & IA  |  INPT", { x: 0.5, y: 5.25, w: 6, h: 0.25,
      fontFace: BODY, fontSize: 10, color: GRAY, margin: 0, isTextBox: true });
    s.addText(String(n), { x: 8.5, y: 5.25, w: 1, h: 0.25, fontFace: BODY, fontSize: 10,
      color: GRAY, align: "right", margin: 0, isTextBox: true });
  }
  return s;
}

function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill || LIGHT },
    line: { color: fill || LIGHT, width: 0 }, rectRadius: 0.08, objectName: "card" });
}

function numCircle(s, x, y, d, label, fill) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill || BLUE },
    line: { color: fill || BLUE, width: 0 } });
  s.addText(String(label), { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: BODY,
    fontSize: 16, bold: true, color: WHITE, margin: 0, isTextBox: true });
}

// 1. Title
{
  const s = base(null,
    "Hello, I'm Nabila Imouzaz, Master Data and AI student at INPT. In this presentation I cover how we evaluate computer vision models. " +
    "The right metric depends on the task, so I picked three tasks: image classification, object detection and semantic segmentation. " +
    "For each one I explain the main metrics, show the formulas, and run a short Python example whose code is in my GitHub repository.");
  s.addText("Evaluation Metrics for Computer Vision Tasks", { x: 0.5, y: 0.8, w: 8.8, h: 1.5,
    fontFace: HEAD, fontSize: 40, bold: true, color: DARK, margin: 0, valign: "top", isTextBox: true });
  s.addText("Image classification  |  Object detection  |  Semantic segmentation", { x: 0.5, y: 2.45,
    w: 8.8, h: 0.4, fontFace: BODY, fontSize: 18, color: BLUE, margin: 0, isTextBox: true });
  s.addText(AUTHOR, { x: 0.5, y: 3.1, w: 8, h: 0.4, fontFace: BODY, fontSize: 22, bold: true,
    color: DARK, margin: 0, isTextBox: true });
  s.addText("Master Data & IA, INPT  |  ML Evaluation  |  2026", { x: 0.5, y: 3.55, w: 8, h: 0.35,
    fontFace: BODY, fontSize: 14, color: GRAY, margin: 0, isTextBox: true });
  const chips = ["Classification", "Detection", "Segmentation"];
  chips.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 4.3, 2.9, 0.65, LIGHT);
    numCircle(s, x + 0.12, 4.4, 0.45, i + 1);
    s.addText(c, { x: x + 0.7, y: 4.3, w: 2.1, h: 0.65, fontFace: BODY, fontSize: 16, bold: true,
      color: DARK, valign: "middle", margin: 0, isTextBox: true });
  });
}

// 2. Why task matters
{
  const s = base("One task, one family of metrics",
    "A model's output changes from task to task, so the metric must change too. " +
    "In classification the output is one label per image, so we compare labels. " +
    "In detection the model returns boxes with labels and scores, so we must also measure how well a box fits the object. " +
    "In segmentation every pixel gets a label, so we measure the overlap between predicted and true masks. " +
    "Let's go through them one by one.");
  const cols = [
    ["Classification", "Output: one label per image", "We compare predicted and true labels: accuracy, precision, recall, F1, ROC-AUC"],
    ["Object detection", "Output: boxes, labels, scores", "We also need localization quality: IoU, then AP and mAP"],
    ["Segmentation", "Output: one label per pixel", "We measure mask overlap: pixel accuracy, IoU, mIoU, Dice"],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.4, 2.9, 3.3);
    numCircle(s, x + 0.2, 1.6, 0.5, i + 1);
    s.addText(c[0], { x: x + 0.2, y: 2.25, w: 2.5, h: 0.45, fontFace: BODY, fontSize: 20, bold: true,
      color: DARK, margin: 0, isTextBox: true });
    s.addText(c[1], { x: x + 0.2, y: 2.75, w: 2.5, h: 0.4, fontFace: BODY, fontSize: 14, bold: true,
      color: BLUE, margin: 0, isTextBox: true });
    s.addText(c[2], { x: x + 0.2, y: 3.2, w: 2.5, h: 1.3, fontFace: BODY, fontSize: 14, color: DARK,
      margin: 0, valign: "top", isTextBox: true });
  });
}

// 3. Classification metrics
{
  const s = base("Classification: the metrics",
    "Everything starts from the confusion matrix: true positives, false positives, false negatives and true negatives. " +
    "Accuracy is the share of correct predictions, but it can be misleading when classes are imbalanced. " +
    "Precision tells how many predicted positives are right, recall how many real positives we found, and F1 is their harmonic mean. " +
    "For multi-class problems we average per class: macro averages treat every class equally. " +
    "ROC-AUC measures ranking quality across all thresholds, and top-k accuracy counts a hit if the true class is among the k best guesses.");
  const items = [
    ["Accuracy", "(TP + TN) / N", "Share of correct predictions"],
    ["Precision / Recall", "TP/(TP+FP)   TP/(TP+FN)", "Quality vs. coverage of positives"],
    ["F1-score", "2PR / (P + R)", "Harmonic mean of P and R"],
    ["ROC-AUC, top-k", "AUC of TPR vs. FPR", "Threshold-free ranking; top-k hit"],
  ];
  items.forEach((it, i) => {
    const x = 0.5 + (i % 2) * 2.95, y = 1.3 + Math.floor(i / 2) * 1.9;
    card(s, x, y, 2.8, 1.75);
    s.addText(it[0], { x: x + 0.15, y: y + 0.12, w: 2.5, h: 0.35, fontFace: BODY, fontSize: 16, bold: true,
      color: BLUE, margin: 0, isTextBox: true });
    s.addText(it[1], { x: x + 0.15, y: y + 0.55, w: 2.5, h: 0.45, fontFace: HEAD, fontSize: 14, italic: true,
      color: DARK, margin: 0, isTextBox: true });
    s.addText(it[2], { x: x + 0.15, y: y + 1.05, w: 2.5, h: 0.55, fontFace: BODY, fontSize: 12, color: GRAY,
      margin: 0, valign: "top", isTextBox: true });
  });
  s.addText("Binary confusion matrix", { x: 6.7, y: 1.3, w: 2.8, h: 0.35, fontFace: BODY, fontSize: 14,
    bold: true, color: DARK, margin: 0, isTextBox: true });
  const cells = [["TP", "found", BLUE, WHITE], ["FN", "missed", PEACH, DARK], ["FP", "false alarm", PEACH, DARK], ["TN", "rejected", BLUE, WHITE]];
  cells.forEach((c, i) => {
    const x = 6.7 + (i % 2) * 1.45, y = 1.75 + Math.floor(i / 2) * 1.25;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 1.35, h: 1.15, fill: { color: c[2] },
      line: { color: c[2], width: 0 }, rectRadius: 0.06 });
    s.addText([{ text: c[0], options: { fontSize: 24, bold: true, breakLine: true } },
      { text: c[1], options: { fontSize: 12 } }], { x, y, w: 1.35, h: 1.15, align: "center", valign: "middle",
      fontFace: BODY, color: c[3], margin: 0, isTextBox: true });
  });
  s.addText("Multi-class: macro average = unweighted mean over classes", { x: 6.7, y: 4.35, w: 2.8, h: 0.7,
    fontFace: BODY, fontSize: 12, color: GRAY, margin: 0, valign: "top", isTextBox: true });
}

// 4. Classification demo
{
  const s = base("Classification: example",
    "Here is the example in the repository: a logistic regression on the scikit-learn digits dataset, with 1,797 images of 8 by 8 pixels and a stratified 70/30 split. " +
    "The accuracy is 98.2 percent, the macro F1 is 0.981, the ROC-AUC is 0.999 and the top-3 accuracy is 99.8 percent. " +
    "The confusion matrix shows that nearly all predictions sit on the diagonal, and the few errors are between visually similar digits. " +
    "On a balanced dataset like this one accuracy and macro F1 agree; on imbalanced data they would not.");
  s.addImage({ path: path.join(FIG, "classification_confusion.png"), x: 0.5, y: 1.3, w: 3.6, h: 3.18 });
  const stats = [["98.2%", "Accuracy"], ["0.981", "Macro F1"], ["0.999", "ROC-AUC (OvR)"], ["99.8%", "Top-3 accuracy"]];
  stats.forEach((st, i) => {
    const x = 4.5 + (i % 2) * 2.5, y = 1.3 + Math.floor(i / 2) * 1.65;
    card(s, x, y, 2.35, 1.5);
    s.addText(st[0], { x, y: y + 0.2, w: 2.35, h: 0.75, align: "center", fontFace: HEAD, fontSize: 36,
      bold: true, color: BLUE, margin: 0, isTextBox: true });
    s.addText(st[1], { x, y: y + 0.95, w: 2.35, h: 0.35, align: "center", fontFace: BODY, fontSize: 14,
      color: DARK, margin: 0, isTextBox: true });
  });
  s.addText("Logistic regression, scikit-learn digits (1,797 images, 8x8), 70/30 stratified split, 540 test images",
    { x: 0.5, y: 4.65, w: 9, h: 0.4, fontFace: BODY, fontSize: 12, color: GRAY, margin: 0, isTextBox: true });
}

// 5. Detection metrics
{
  const s = base("Detection: IoU, AP and mAP",
    "Detection adds localization. The key tool is Intersection over Union: the area of overlap between the predicted box and the ground-truth box, divided by the area of their union. " +
    "A detection counts as correct only if its IoU passes a threshold, typically 0.5. " +
    "To compute average precision we sort detections by confidence, match them one-to-one with ground truth to label each as true or false positive, " +
    "build the precision-recall curve, and take the area under it. " +
    "AP is computed per class, and mAP is the mean over classes. COCO goes further and averages over IoU thresholds from 0.5 to 0.95.");
  // IoU visual
  s.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.4, w: 1.9, h: 1.5, fill: { color: LIGHT }, line: { color: BLUE, width: 2 } });
  s.addShape(pres.ShapeType.rect, { x: 1.8, y: 2.1, w: 1.9, h: 1.5, fill: { color: PEACH, transparency: 40 }, line: { color: ORANGE, width: 2 } });
  s.addShape(pres.ShapeType.rect, { x: 1.8, y: 2.1, w: 0.9, h: 0.8, fill: { color: BLUE, transparency: 60 }, line: { color: BLUE, width: 0 } });
  s.addText("Ground truth", { x: 0.85, y: 1.45, w: 1.4, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: BLUE, margin: 0, isTextBox: true });
  s.addText("Prediction", { x: 2.3, y: 3.25, w: 1.3, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: ORANGE, margin: 0, align: "right", isTextBox: true });
  s.addText("IoU = Area(A ∩ B) / Area(A ∪ B)", { x: 0.5, y: 3.85, w: 4.3, h: 0.45, fontFace: HEAD, fontSize: 16,
    italic: true, color: DARK, margin: 0, isTextBox: true });
  s.addText("Correct detection if IoU ≥ threshold (0.5 up to 0.95)", { x: 0.5, y: 4.35, w: 4.3, h: 0.6,
    fontFace: BODY, fontSize: 13, color: GRAY, margin: 0, valign: "top", isTextBox: true });
  const steps = ["Rank detections by confidence score", "Match each to a ground truth (IoU ≥ t, one-to-one): TP or FP",
    "Build the precision-recall curve", "AP = area under the curve; mAP = mean over classes"];
  steps.forEach((t, i) => {
    const y = 1.3 + i * 0.9;
    numCircle(s, 5.2, y + 0.1, 0.5, i + 1);
    s.addText(t, { x: 5.9, y, w: 3.6, h: 0.7, fontFace: BODY, fontSize: 14, color: DARK, margin: 0,
      valign: "middle", isTextBox: true });
  });
}

// 6. Detection demo
{
  const s = base("Detection: example",
    "I implemented IoU, matching and AP from scratch with NumPy, and tested them on a small synthetic example with 6 ground-truth boxes and 9 detections that I can verify by hand. " +
    "At IoU 0.5 the AP is 0.944: five good detections come first, then three false positives, and the last true positive arrives late with a precision of 0.67. " +
    "The bar chart shows the key point: as the IoU threshold increases, AP drops, down to zero at 0.9, because the boxes are good but not perfect. " +
    "That's why COCO's mAP from 0.5 to 0.95, here 0.665, is much stricter than the 0.5 version.");
  s.addImage({ path: path.join(FIG, "detection_pr_curve.png"), x: 0.5, y: 1.3, w: 4.0, h: 3.08 });
  s.addChart(pres.charts.BAR, [{ name: "AP", labels: ["0.50", "0.55", "0.60", "0.65", "0.70", "0.75", "0.80", "0.85", "0.90", "0.95"],
    values: [0.944, 0.944, 0.944, 0.944, 0.944, 0.759, 0.688, 0.481, 0, 0] }],
    { x: 4.8, y: 1.3, w: 4.7, h: 3.1, barDir: "col", chartColors: [BLUE], showTitle: true,
      title: "AP versus IoU threshold", titleFontSize: 14, titleColor: DARK, titleFontFace: BODY,
      showValue: true, dataLabelFormatCode: "0.00", dataLabelFontSize: 10, dataLabelColor: DARK, dataLabelPosition: "outEnd",
      catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisLabelColor: GRAY, valAxisLabelColor: GRAY,
      valAxisMaxVal: 1.1, valAxisMinVal: 0, valGridLine: { color: "E5E7EB", size: 0.5 }, catGridLine: { style: "none" },
      showLegend: false, catAxisLabelFontFace: BODY, valAxisLabelFontFace: BODY, dataLabelFontFace: BODY });
  s.addText("AP@0.5 = 0.944    AP@0.75 = 0.759    AP@[.5:.95] = 0.665", { x: 0.5, y: 4.55, w: 9, h: 0.4,
    fontFace: BODY, fontSize: 16, bold: true, color: BLUE, margin: 0, align: "center", isTextBox: true });
}

// 7. Segmentation metrics
{
  const s = base("Segmentation: the metrics",
    "In semantic segmentation every pixel gets a class, so we compare masks. " +
    "Pixel accuracy is the share of correctly classified pixels, simple but dominated by the background when objects are small. " +
    "Intersection over Union, or Jaccard, divides the overlap by the union for each class, and mIoU averages over classes. It's the standard on Pascal VOC, Cityscapes and ADE20K. " +
    "The Dice coefficient is the F1 score of the masks and is popular in medical imaging; it is linked to IoU by Dice equals two IoU over one plus IoU. " +
    "Instance segmentation is evaluated like detection, but with mask IoU instead of box IoU.");
  const items = [
    ["Pixel accuracy", "TP / all pixels", "Simple, but dominated by the background when classes are imbalanced"],
    ["IoU and mIoU", "TP / (TP + FP + FN)", "Standard benchmark metric (VOC, Cityscapes, ADE20K), averaged over classes"],
    ["Dice (F1)", "2TP / (2TP + FP + FN)", "Common in medical imaging; Dice = 2 IoU / (1 + IoU)"],
  ];
  items.forEach((it, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.3, 2.9, 2.5);
    s.addText(it[0], { x: x + 0.2, y: 1.45, w: 2.5, h: 0.4, fontFace: BODY, fontSize: 18, bold: true,
      color: BLUE, margin: 0, isTextBox: true });
    s.addText(it[1], { x: x + 0.2, y: 1.95, w: 2.5, h: 0.45, fontFace: HEAD, fontSize: 15, italic: true,
      color: DARK, margin: 0, isTextBox: true });
    s.addText(it[2], { x: x + 0.2, y: 2.5, w: 2.5, h: 1.2, fontFace: BODY, fontSize: 13, color: GRAY,
      margin: 0, valign: "top", isTextBox: true });
  });
  card(s, 0.5, 4.0, 9, 0.85, PEACH);
  s.addText("Instance segmentation is evaluated like detection (AP, mAP) with mask IoU instead of box IoU",
    { x: 0.7, y: 4.0, w: 8.6, h: 0.85, fontFace: BODY, fontSize: 14, color: DARK, margin: 0, valign: "middle", isTextBox: true });
}

// 8. Segmentation demo
{
  const s = base("Segmentation: example",
    "In this example a ground-truth mask has three classes: background, a disk and a rectangle. The prediction is the same shapes, shifted by a few pixels. " +
    "Pixel accuracy is 88.8 percent, which sounds good. But the IoU of the disk is only 0.67 and of the rectangle 0.64, giving a mean IoU of 0.72. " +
    "The background, which covers most pixels, inflates the accuracy. This is exactly why we report per-class IoU or Dice instead of pixel accuracy alone.");
  s.addImage({ path: path.join(FIG, "segmentation_masks.png"), x: 0.5, y: 1.3, w: 5.4, h: 1.92 });
  s.addText("Pixel accuracy looks fine, but the objects themselves only overlap at 0.64 to 0.67 IoU: the large background hides the errors",
    { x: 0.5, y: 3.4, w: 5.4, h: 1.2, fontFace: BODY, fontSize: 14, color: DARK, margin: 0, valign: "top", isTextBox: true });
  const hdr = { bold: true, color: WHITE, fill: { color: BLUE }, fontFace: BODY, fontSize: 13, align: "center" };
  const c = (t, o) => ({ text: t, options: Object.assign({ fontFace: BODY, fontSize: 13, color: DARK, align: "center" }, o || {}) });
  s.addTable([
    [{ text: "Class", options: hdr }, { text: "IoU", options: hdr }, { text: "Dice", options: hdr }],
    [c("Background", { align: "left" }), c("0.859"), c("0.924")],
    [c("Disk", { align: "left" }), c("0.668"), c("0.801")],
    [c("Rectangle", { align: "left" }), c("0.644"), c("0.783")],
    [c("Mean", { align: "left", bold: true }), c("0.723", { bold: true }), c("0.836", { bold: true })],
  ], { x: 6.2, y: 1.3, w: 3.3, colW: [1.5, 0.9, 0.9], rowH: 0.42, border: { type: "solid", color: "D6E4F0", pt: 1 }, valign: "middle" });
  s.addText("88.8%", { x: 6.2, y: 3.65, w: 3.3, h: 0.7, fontFace: HEAD, fontSize: 36, bold: true, color: ORANGE, margin: 0, align: "center", isTextBox: true });
  s.addText("pixel accuracy", { x: 6.2, y: 4.35, w: 3.3, h: 0.35, fontFace: BODY, fontSize: 14, color: DARK, margin: 0, align: "center", isTextBox: true });
}

// 9. Summary table
{
  const s = base("Choosing the right metric",
    "To summarize. For classification use accuracy only if classes are balanced, otherwise rely on macro F1 and ROC-AUC. " +
    "For detection report mAP over several IoU thresholds, and always state the threshold and matching rules. " +
    "For segmentation report per-class IoU and Dice, because pixel accuracy is dominated by the background. " +
    "In all cases the metric must match what the application cares about.");
  const hdr = { bold: true, color: WHITE, fill: { color: BLUE }, fontFace: BODY, fontSize: 15, valign: "middle" };
  const c = (t, o) => ({ text: t, options: Object.assign({ fontFace: BODY, fontSize: 14, color: DARK, valign: "middle" }, o || {}) });
  s.addTable([
    [{ text: "Task", options: hdr }, { text: "Headline metrics", options: hdr }, { text: "Watch out for", options: hdr }],
    [c("Classification", { bold: true }), c("Accuracy, macro F1, ROC-AUC"), c("Class imbalance: accuracy hides minority-class errors")],
    [c("Object detection", { bold: true }), c("AP, mAP@0.5, mAP@[.5:.95]"), c("Results depend on the IoU threshold and matching rules: report them")],
    [c("Segmentation", { bold: true }), c("IoU, mIoU, Dice"), c("Background dominates pixel accuracy: compute per class")],
  ], { x: 0.5, y: 1.35, w: 9, colW: [1.9, 3.0, 4.1], rowH: [0.5, 0.95, 0.95, 0.95], border: { type: "solid", color: "D6E4F0", pt: 1 }, fill: { color: LIGHT } });
}

// 10. Code and thanks
{
  const s = base("Code and repository",
    "All the examples are in my GitHub repository, cv-evaluation-metrics. Install the requirements, then run one script per task; each one prints its metrics and saves a figure. " +
    "The README documents every function. Thank you for your attention.");
  card(s, 0.5, 1.3, 5.6, 3.2);
  s.addText("GitHub: cv-evaluation-metrics", { x: 0.7, y: 1.45, w: 5.2, h: 0.4, fontFace: BODY, fontSize: 18, bold: true, color: BLUE, margin: 0, isTextBox: true });
  s.addText([
    { text: "pip install -r requirements.txt", options: { breakLine: true } },
    { text: "python classification_metrics.py", options: { breakLine: true } },
    { text: "python detection_metrics.py", options: { breakLine: true } },
    { text: "python segmentation_metrics.py" },
  ], { x: 0.7, y: 2.05, w: 5.2, h: 1.5, fontFace: "Courier New", fontSize: 14, color: DARK, margin: 0, valign: "top", paraSpaceAfter: 6, isTextBox: true });
  s.addText("Code, figures and README with the documentation of each function", { x: 0.7, y: 3.7, w: 5.2, h: 0.65,
    fontFace: BODY, fontSize: 13, color: GRAY, margin: 0, valign: "top", isTextBox: true });
  s.addText("Thank you", { x: 6.5, y: 1.9, w: 3, h: 0.7, fontFace: HEAD, fontSize: 34, bold: true, color: DARK, margin: 0, isTextBox: true });
  s.addText(AUTHOR, { x: 6.5, y: 2.7, w: 3, h: 0.4, fontFace: BODY, fontSize: 18, bold: true, color: BLUE, margin: 0, isTextBox: true });
  s.addText("Master Data & IA, INPT", { x: 6.5, y: 3.15, w: 3, h: 0.35, fontFace: BODY, fontSize: 14, color: GRAY, margin: 0, isTextBox: true });
}

pres.writeFile({ fileName: path.join(__dirname, "Evaluation_Metrics_CV_Nabila_Imouzaz.pptx") }).then(() => {
  const words = notes.join(" ").split(/\s+/).length;
  fs.writeFileSync(path.join(__dirname, "video_script.md"),
    "# Video script (about 7 minutes max)\n\nSpeaking pace ~150 words/min. Total words: " + words + "\n\n" +
    notes.map((t, i) => "## Slide " + (i + 1) + "\n\n" + t + "\n").join("\n"));
  console.log("done, words:", words);
});
