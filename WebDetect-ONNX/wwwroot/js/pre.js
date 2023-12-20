function preprocess(src, videoW, videoH, scale, size) {

    // rgb 형태의 이미지를 모델 크기에 맞게 변환
    const input = new cv.Mat(videoH, videoW, cv.CV_32FC3);
    cv.cvtColor(src, input, cv.COLOR_RGBA2RGB);
    cv.resize(input, input, new cv.Size(size, size));
    input.convertTo(input, cv.CV_32FC3, scale);

    // [r,g,b,r,g,b,...] 형태를 [r,r,...,g,g,...,b,b,...] 형태로 변환
    const input_data = input.data32F;
    const red = []; const green = []; const blue = [];
    for (let i = 0; i < input_data.length; i += 3) {
        red.push(input_data[i]);
        green.push(input_data[i + 1]);
        blue.push(input_data[i + 2]);
    }
    const input_data_rgb = new Float32Array([...red, ...green, ...blue]);
    input.delete();

    // onnxruntime에서 사용하는 tensor 형태로 변환
    return new ort.Tensor('float32', input_data_rgb, [1, 3, size, size]);
}