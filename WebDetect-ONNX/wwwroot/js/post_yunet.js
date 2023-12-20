const outputs = {
    0: "cls_8",
    1: "cls_16",
    2: "cls_32",
    3: "obj_8",
    4: "obj_16",
    5: "obj_32",
    6: "bbox_8",
    7: "bbox_16",
    8: "bbox_32",
    9: "kps_8",
    10: "kps_16",
    11: "kps_32",
}

const strides = [8, 16, 32];

function post_process_face(output, modelSize, viewW, viewH) {
    let faceBox = [];
    let faceKey = [];

    const dx = viewW / modelSize;
    const dy = viewH / modelSize;

    Array.from({ length: strides.length }, (_, index) => {
        const rows = modelSize / strides[index];
        const cols = modelSize / strides[index];

        const clsArray = output[outputs[index]].data;
        const objArray = output[outputs[index + strides.length * 1]].data;
        const boxArray = output[outputs[index + strides.length * 2]].data;
        const kpsArray = output[outputs[index + strides.length * 3]].data;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {

                const idx = row * cols + col;
                let clsConfidence = clsArray[idx];
                let objConfidence = objArray[idx];

                // 0 ~ 1 사이의 값으로 변환
                clsConfidence = Math.max(0.0, Math.min(1.0, clsConfidence));
                objConfidence = Math.max(0.0, Math.min(1.0, objConfidence));

                // 실제 확률 
                const confidence = Math.sqrt(clsConfidence * objConfidence);

                // confidence가 낮으면 continue
                if (confidence < confidence_threshold) continue;
                const boxes = boxArray.slice(idx * 4, (idx + 1) * 4);
                const centerX = (col + boxes[0]) * strides[index];
                const centerY = (row + boxes[1]) * strides[index];
                const width = Math.exp(boxes[2]) * strides[index];
                const height = Math.exp(boxes[3]) * strides[index];

                const x1 = Math.max(0.0, Math.min(viewW -1, (centerX - width / 2) * dx));
                const y1 = Math.max(0.0, Math.min(viewH -1, (centerY - height / 2) * dy));
                const x2 = Math.max(0.0, Math.min(viewW -1, (centerX + width / 2) * dx));
                const y2 = Math.max(0.0, Math.min(viewH -1, (centerY + height / 2) * dy));

                const keypoints = [];
                const kps = kpsArray.slice(idx * 10, (idx + 1) * 10);
                for (let i = 0; i < 5; i++) {
                    const x = Math.max(0.0, Math.min(viewW -1, (col + kps[i * 2]) * strides[index] * dx));
                    const y = Math.max(0.0, Math.min(viewH -1, (row + kps[i * 2 + 1]) * strides[index] * dy));
                    keypoints.push(x);
                    keypoints.push(y);
                }
                // 마지막에 index 추가 (nms 처리가 완료된 후 남아있는 index에 맞게 keypoints를 추출하기 위함)
                keypoints.push(idx);

                faceBox.push([x1, y1, x2, y2, "face", confidence, idx]);
                faceKey.push(keypoints);
            }
        }
    });

    // confidence 높은 순으로 정렬
    faceBox = faceBox.sort((box1, box2) => box2[5] - box1[5]);

    const result = [];
    while (faceBox.length > 0) {
        result.push(faceBox[0]);
        faceBox = faceBox.filter(box => iou(faceBox[0], box) < iou_threshold);
    }

    // i 에 맞게 keypoints 일부 추출
    const result_poses = [];
    for (let i = 0; i < result.length; i++) {
        const index = result[i][6];
        // poses의 마지막 index와 i가 같은 것만 추출
        const pose = faceKey.filter(pose => pose[10] == index);
        result_poses.push(pose[0]);
    }

    output.dispose();
    return [result, result_poses];
}