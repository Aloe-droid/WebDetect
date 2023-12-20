function draw_boxes(dst, boxes){
    boxes.forEach(([x1, y1, x2, y2, label]) => {
        cv.rectangle(dst, new cv.Point(x1, y1), new cv.Point(x2, y2), new cv.Scalar(0, 255, 255), 2);
        cv.putText(dst, label, new cv.Point(x1, y1 - 10), cv.FONT_HERSHEY_SIMPLEX, 0.5, new cv.Scalar(0, 0, 0), 1.7);

        if(label == "face"){
            const rect = new cv.Rect(x1, y1, x2 - x1, y2 - y1);
            const dst_roi = dst.roi(rect);
            cv.GaussianBlur(dst_roi, dst_roi, new cv.Size(25, 25), 0, 0, cv.BORDER_CONSTANT);
            dst_roi.delete();
        }
    });
}

function draw_keyPoints(dst, keys){
    keys.forEach(kept => {

        const points = new Array(17 * 2);

        for (let i = 0; i < 17; i++) {

            const x = kept[i * 3];
            const y = kept[i * 3 + 1];
            const prob = kept[i * 3 + 2];

            if (prob > confidence_threshold) {
                points[i * 2] = x;
                points[i * 2 + 1] = y;
            }
            draw_point(dst, points);
            draw_lines(dst, points);
        }
    });
}

function draw_point(dst, points) {

    for (let i = 0; i < 17; i++) {
        const x = points[i * 2];
        const y = points[i * 2 + 1];

        if (x == null || y == null) {
            continue;
        }
        cv.circle(dst, new cv.Point(x, y), 5, new cv.Scalar(255, 0, 0), -1);
    }
}

function draw_lines(dst, points) {
    //오른쪽 어깨 팔꿈치 연결
    start_x = points[10]
    start_y = points[11]
    end_x = points[14]
    end_y = points[15]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //왼쪽 어깨 팔꿈치 연결
    start_x = points[12]
    start_y = points[13]
    end_x = points[16]
    end_y = points[17]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //오른쪽 어깨 골반 연결
    start_x = points[10]
    start_y = points[11]
    end_x = points[22]
    end_y = points[23]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //왼쪽 어깨 골반 연결
    start_x = points[12]
    start_y = points[13]
    end_x = points[24]
    end_y = points[25]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //오른쪽 팔꿈치 손목 연결
    start_x = points[14]
    start_y = points[15]
    end_x = points[18]
    end_y = points[19]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //왼쪽 팔꿈치 손목 연결
    start_x = points[16]
    start_y = points[17]
    end_x = points[20]
    end_y = points[21]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //오른쪽 골반 무릎 연결
    start_x = points[22]
    start_y = points[23]
    end_x = points[26]
    end_y = points[27]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //왼쪽 골반 무릎 연결
    start_x = points[24]
    start_y = points[25]
    end_x = points[28]
    end_y = points[29]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //오른쪽 무릎 발 연결
    start_x = points[26]
    start_y = points[27]
    end_x = points[30]
    end_y = points[31]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //왼쪽 무릎 발 연결
    start_x = points[28]
    start_y = points[29]
    end_x = points[32]
    end_y = points[33]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //어깨 좌우 연결
    start_x = points[10]
    start_y = points[11]
    end_x = points[12]
    end_y = points[13]
    draw_line(dst, start_x, start_y, end_x, end_y)
    //골반 좌우 연결
    start_x = points[22]
    start_y = points[23]
    end_x = points[24]
    end_y = points[25]
    draw_line(dst, start_x, start_y, end_x, end_y)
}

function draw_line(dst, start_x, start_y, end_x, end_y) {
    if (start_x == null || start_y == null || end_x == null || end_y == null) {
        return;
    }
    cv.line(dst, new cv.Point(start_x, start_y), new cv.Point(end_x, end_y), new cv.Scalar(255, 255, 0), 2);
}