function draw_boxes(context, boxes) {
    context.strokeStyle = "#00FF00";
    context.lineWidth = 3;
    context.font = "18px serif";

    boxes.forEach(([x1, y1, x2, y2, label]) => {
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        context.fillStyle = "#00ff00";
        const width = context.measureText(label).width;
        context.fillRect(x1, y1, width + 10, 25);
        context.fillStyle = "#000000";
        context.fillText(label, x1, y1 + 18);
    });
}

function draw_blur(context, boxes) {
    boxes.forEach(([x1, y1, x2, y2]) => {
        roi_x1 = x1 - (x2 - x1) * 0.125;
        roi_y1 = y1 - (y2 - y1) * 0.125;
        roi_x2 = x2 + (x2 - x1) * 0.125;
        roi_y2 = y2 + (y2 - y1) * 0.125;

        const face_roi = context.getImageData(roi_x1, roi_y1, roi_x2 - roi_x1, roi_y2 - roi_y1);
        const face_roi_tensor = tf.cast(tf.browser.fromPixels(face_roi), 'float32');
        
        const kernel = getGaussianKernel(15, 15);
        const blurImg = gaussianBlur(face_roi_tensor, kernel);
        const blurred_face_roi = tf.cast(blurImg, 'int32');

        const blurred_face_roi_canvas = document.createElement('canvas');
        blurred_face_roi_canvas.width = roi_x2 - roi_x1;
        blurred_face_roi_canvas.height = roi_y2 - roi_y1;

        tf.browser.draw(blurred_face_roi, blurred_face_roi_canvas);
        context.drawImage(blurred_face_roi_canvas, roi_x1, roi_y1);
    })
}
