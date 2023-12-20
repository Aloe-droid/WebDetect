let model_name = "none";
let intervalId;
let FPS = 15;
let frameInterval = 1000 / FPS;

let confidence_threshold = 0.3;
const iou_threshold = 0.3;

let video;
let canvas;
let flippedCanvas;

let boxes = [];
let kepts = [];

// 좌우 반전 추가한 detect
function detect() {
    try {
        video = document.querySelector("video");
        canvas = document.querySelector("canvas");
        flippedCanvas = document.createElement("canvas");

        canvas.width = video.width;
        canvas.height = video.height;
        flippedCanvas.width = video.width;
        flippedCanvas.height = video.height;
        boxes = [];
        kepts = [];

        function processVideo() {
            const flippedCtx = flippedCanvas.getContext("2d", { willReadFrequently: true });
            flippedCtx.scale(-1, 1);
            flippedCtx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(flippedCanvas, 0, 0, canvas.width, canvas.height);

            if (model_name == "face" && boxes.length > 0) draw_blur(ctx, boxes);

            // 현재 시간 표시
            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(new Date().toLocaleTimeString(), canvas.width - 140, 30);

            // boxes와 kepts를 그리기
            if (boxes.length > 0) draw_boxes(ctx, boxes);
            if (kepts.length > 0) draw_keypoints(ctx, kepts);

            let size = 0;
            if (model_name == "face") size = 640;
            else size = 224;

            const input = tf.tidy(() => { return preprocess_input(canvas, size); });

            if (model_name == "coco" || model_name == "fire" || model_name == "pose" || model_name == "face") {
                inference(input, model_name, size).then(output => {
                    if (output == null) return;

                    if (model_name == "pose") {
                        const outputArray = output.arraySync()[0].flat();
                        const boxes_and_kepts = process_output_pose(outputArray, size, canvas.width, canvas.height);
                        boxes = boxes_and_kepts[0];
                        kepts = boxes_and_kepts[1];
                        output.dispose();
                    } else if (model_name == "face") {
                        const faces_and_kepts = process_output_yunet(output, size, canvas.width, canvas.height);
                        boxes = faces_and_kepts[0];
                    } else {
                        const outputArray = output.arraySync()[0].flat();
                        boxes = process_output(outputArray, size, canvas.width, canvas.height, model_name);
                        output.dispose();
                    }
                });
                // motion 감지 할 때
            } else if (model_name == "motion") {
                boxes = motion_detect(input, canvas.width, canvas.height)
            }
        }
        intervalId = setInterval(processVideo, frameInterval);
    } catch (err) {
        // 라이브러리 로드가 안되었을 때
        setTimeout(detect, 1000);
    }
}

function change_confidence_threshold() {
    const conf = document.getElementById("conf").value;
    // 만약 0.1~0.9 사이가 아니라면 경고창을 띄우고 기존 값으로 돌아감, 숫자가 아니여도 경고창 띄움
    if (conf < 0.1 || conf > 0.9 || isNaN(conf)) {
        alert("0.1~0.9 사이의 값을 입력해주세요.");
        document.getElementById("conf").value = 0.3;
        return;
    }
    confidence_threshold = conf;
}

function change_model(name) {
    if (intervalId) clearTimeout(intervalId);
    tf.disposeVariables();

    model_name = name;
    detect();
}


function unload() {
    if (intervalId) clearTimeout(intervalId);

    stop_video("video");
}