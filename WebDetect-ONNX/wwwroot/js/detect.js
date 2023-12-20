const FPS = 15;
let model_name = "none";
let frameInterval = 1000 / FPS;
let confidence_threshold = 0.3;
const iou_threshold = 0.3;
let boxes = [];
let keys = [];

function detect() {
    try {
        const video = document.querySelector('video');
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let cap = new cv.VideoCapture(video);
        boxes = [];
        keys = [];

        function processVideo() {
            cap.read(src);
            cv.flip(src, src, 1);

            cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB);
            const time = get_date();
            cv.putText(dst, time, new cv.Point(video.width - 200, 30), cv.FONT_HERSHEY_SIMPLEX, 0.5, new cv.Scalar(0, 0, 0), 1.7);

            if (model_name != "none") {
                if (boxes.length > 0) draw_boxes(dst, boxes);
                if (keys.length > 0) draw_keyPoints(dst, keys);

                // 모델 마다 사이즈나 scale은 다를 수 있음
                let size = 224;
                let scale = 1.0;

                // yunet 모델은 size가 640이며 scale이 1값 (정수형)
                if (model_name == "face") size = 640;
                // yolov8 모델은 size를 224이며 scale을 1/255로 설정
                else scale = 1 / 255.0;
                
                const tensor = preprocess(src, video.width, video.height, scale, size);
                inference(tensor, model_name, size).then(output => {
                    if (output == null) return;
                   
                    const viewW = src.size().width;
                    const viewH = src.size().height;

                    if (model_name == "face") {
                        boxes = post_process_face(output, size, viewW, viewH)[0];
                    } else if (model_name == "pose") {
                        boxWithKeys = post_process_pose(output, size, viewW, viewH);
                        boxes = boxWithKeys[0];
                        keys = boxWithKeys[1];
                    } else if (model_name == "fire" || model_name == "coco") {
                        boxes = post_process_yolov8(output, size, viewW, viewH);
                    }
                });
            }
            cv.imshow('canvasOutput', dst);
        };
        intervalId = setInterval(processVideo, frameInterval);
    } catch (err) {
        // 1초 대기 (opencv 라이브러리가 로드되기 전에 실행되는 경우가 있음)
        setTimeout(detect, 1000);
    }
}

function get_date() {
    //yyyy-MM-ddThh:mm:ss
    const date = new Date();
    const year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    let second = date.getSeconds().toString();
    if (month.length == 1) month = "0" + month;
    if (day.length == 1) day = "0" + day;
    if (hour.length == 1) hour = "0" + hour;
    if (minute.length == 1) minute = "0" + minute;
    if (second.length == 1) second = "0" + second;

    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
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
    if (intervalId) {
        clearInterval(intervalId);
    }
    model_name = name;
    detect();
}

function unload() {
    if (intervalId) {
        clearTimeout(intervalId);
    }
    stop_video("video");
}