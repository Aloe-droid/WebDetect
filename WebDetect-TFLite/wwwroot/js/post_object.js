const coco_classes = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse',
    'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase',
    'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard',
    'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant',
    'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven',
    'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

const fire_classes = [
    'fire', 'smoke'
];

function get_name(model_name) {
    if (model_name == "coco") {
        return coco_classes;
    } else if (model_name == "fire") {
        return fire_classes;
    } 
}

function process_output(output, size, image_width, image_height, model_name) {
    let boxes = [];
    const maxLen = 1029;
    const dx = image_width / size;
    const dy = image_height / size;

    const classes = get_name(model_name);

    for (let i = 0; i < maxLen; i++) {
        const [class_id, prob] = [...Array(classes.length).keys()]
            .map(col => [col, output[maxLen * (col + 4) + i]])
            .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);

        if (prob < confidence_threshold) {
            continue;
        }

        const label = classes[class_id];
        const xc = output[i];
        const yc = output[maxLen + i];
        const w = output[2 * maxLen + i];
        const h = output[3 * maxLen + i];
        const x1 = (xc - w / 2) * dx;
        const y1 = (yc - h / 2) * dy;
        const x2 = (xc + w / 2) * dx;
        const y2 = (yc + h / 2) * dy;
        boxes.push([x1, y1, x2, y2, label, prob]);
    }
    boxes = boxes.sort((box1, box2) => box2[5] - box1[5]);

    const result = [];
    while (boxes.length > 0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0], box) < iou_threshold || boxes[0][4] !== box[4]);
    }

    return result;
}
