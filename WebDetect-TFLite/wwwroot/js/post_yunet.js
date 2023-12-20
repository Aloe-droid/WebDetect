// key value 형태의 객체 생성
const output_name = {
    0 : "Identity",
    1 : "Identity_1",
    2 : "Identity_2",
    3 : "Identity_3",
    4 : "Identity_4",
    5 : "Identity_5",
    6 : "Identity_6",
    7 : "Identity_7",
    8 : "Identity_8",
    9 : "Identity_9",
    10 : "Identity_10",
    11 : "Identity_11"
};

const strides = [8 ,16, 32];

function process_output_yunet(output, modelSize, viewW, viewH){
    let faceBox = [];
    let faceKey = [];
    
    const dx = viewW / modelSize;
    const dy = viewH / modelSize;

    Array.from({ length: strides.length }, (_, index) => {
        const rows = modelSize / strides[index];
        const cols = modelSize / strides[index];

        const clsArray = output[output_name[index]].arraySync()[0];
        const objArray = output[output_name[index + strides.length * 1]].arraySync()[0];
        const boxArray = output[output_name[index + strides.length * 2]].arraySync()[0];
        const kpsArray = output[output_name[index + strides.length * 3]].arraySync()[0];
  
        for(let row = 0; row < rows; row++){
            for(let col = 0; col < cols; col++){
                const idx = row * cols + col;

                let clsConfidence = clsArray[idx][0];
                let objConfidence = objArray[idx][0];
                
                // 0 ~ 1 사이의 값으로 변환
                clsConfidence = Math.max(0.0, Math.min(1.0, clsConfidence));
                objConfidence = Math.max(0.0, Math.min(1.0, objConfidence));

                // 실제 확률 
                const confidence = Math.sqrt(clsConfidence * objConfidence);

                // confidence가 낮으면 continue
                if(confidence < confidence_threshold) continue;

                const boxes = boxArray[idx];
                const centerX = (col + boxes[0]) * strides[index];
                const centerY = (row + boxes[1]) * strides[index];
                const width = Math.exp(boxes[2]) * strides[index];
                const height = Math.exp(boxes[3]) * strides[index];
                
                const x1 = Math.max(0.0, Math.min(viewW -1, (centerX - width / 2) * dx));
                const y1 = Math.max(0.0, Math.min(viewH -1, (centerY - height / 2) * dy));
                const x2 = Math.max(0.0, Math.min(viewW -1, (centerX + width / 2) * dx));
                const y2 = Math.max(0.0, Math.min(viewH -1, (centerY + height / 2) * dy));

                const keypoints = [];
                const keyPointArray = kpsArray[idx];

                for(let key = 0; key < 5; key++){
                    let keyPointX = (col + keyPointArray[2 * key]) * strides[index] * dx;
                    let keyPointY = (row + keyPointArray[2 * key + 1]) * strides[index] * dy;

                    keyPointX = Math.max(0.0, Math.min(viewW -1, keyPointX));
                    keyPointY = Math.max(0.0, Math.min(viewH -1, keyPointY));

                    keypoints.push(keyPointX);
                    keypoints.push(keyPointY);
                }
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
    
    return [result, result_poses];
}