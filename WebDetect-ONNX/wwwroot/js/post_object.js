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
    'fire',
    'smoke'
];

function post_process_yolov8(output, size, viewW, viewH) {
    let boxes = [];
    const outputArray = output.output0.data;
    let maxLen = 1029;
    let classes = [];

    if (model_name == "fire") classes = fire_classes;
    else if (model_name == "coco") classes = coco_classes;
        

    for (let i = 0; i < maxLen; i++) {
        const [class_id, prob] = [...Array(classes.length).keys()]
            .map(col => [col, outputArray[maxLen * (col + 4) + i]])
            .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);

        
        if (prob < confidence_threshold) continue;
        
        const label = classes[class_id];
        const centerX = outputArray[maxLen * 0 + i] * (viewW / size);
        const centerY = outputArray[maxLen * 1 + i] * (viewH / size);
        const width = outputArray[maxLen * 2 + i] * (viewW / size);
        const height = outputArray[maxLen * 3 + i] * (viewH / size);

        const x1 = Math.max(0.0, Math.min(viewW - 1, centerX - width / 2));
        const y1 = Math.max(0.0, Math.min(viewH - 1, centerY - height / 2));
        const x2 = Math.max(0.0, Math.min(viewW - 1, centerX + width / 2));
        const y2 = Math.max(0.0, Math.min(viewH - 1, centerY + height / 2));
        boxes.push([x1, y1, x2, y2, label, prob])
    }
    boxes = boxes.sort((box1, box2) => box2[5] - box1[5]);

    const result = [];
    while (boxes.length > 0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0], box) < iou_threshold || boxes[0][4] !== box[4]);
    }

    output.dispose();
    return result;
}