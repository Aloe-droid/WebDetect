function post_process_pose(output, size, viewW, viewH){
    let boxes = [];
    let poses = [];

    const outputArray = output.output0.data;
    let maxLen = 1029;

    const dx = viewW / size;
    const dy = viewH / size;

    for (let i = 0; i < maxLen; i++) {
        const prob = outputArray[maxLen * 4 + i];
        if (prob < confidence_threshold) {
            continue;
        }

        const xc = outputArray[i] * dx;
        const yc = outputArray[maxLen + i] * dy;
        const w = outputArray[2 * maxLen + i] * dx;
        const h = outputArray[3 * maxLen + i] * dy;
        
        const x1 = Math.max(0.0, Math.min(viewW - 1, xc - w / 2));
        const y1 = Math.max(0.0, Math.min(viewH - 1, yc - h / 2));
        const x2 = Math.max(0.0, Math.min(viewW - 1, xc + w / 2));
        const y2 = Math.max(0.0, Math.min(viewH - 1, yc + h / 2));

        const keys = [];
        for (let j = 0; j < 51; j++) {
            if (j % 3 == 0) {
                keys.push((outputArray[maxLen * (5 + j) + i]) * dx);
            } else if (j % 3 == 1) {
                keys.push((outputArray[maxLen * (5 + j) + i]) * dy);
            } else {
                keys.push((outputArray[maxLen * (5 + j) + i]));
            }
        }
        // 마지막에 index 추가 (nms 처리가 완료된 후 남아있는 index에 맞게 keypoints를 추출하기 위함)
        keys.push(i);

        // x1, y1, x2, y2, label, prob, index
        boxes.push([x1, y1, x2, y2, "person", prob, i]);
        // x, y, prob, ... , index
        poses.push(keys);
    }
    boxes = boxes.sort((box1, box2) => box2[5] - box1[5]);

    const result = [];
    while (boxes.length > 0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0], box) < iou_threshold);
    }

    // i 에 맞게 keypoints 일부 추출
    const result_poses = [];
    for (let i = 0; i < result.length; i++) {
        const index = result[i][6];
        // poses의 마지막 index와 i가 같은 것만 추출
        const pose = poses.filter(pose => pose[51] == index);
        result_poses.push(pose[0]);
    }

    output.dispose();
    return [result, result_poses];
}