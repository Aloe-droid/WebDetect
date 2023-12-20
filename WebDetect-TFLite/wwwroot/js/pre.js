function preprocess_input(image, size) {
    const [image_width, image_height] = [size, size];
    const canvas = document.createElement("canvas");
    canvas.width = image_width;
    canvas.height = image_height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

    const img = tf.browser.fromPixels(imgData);

    if (model_name == "face") return tf.cast(tf.expandDims(img), 'float32');
    else return tf.div(tf.expandDims(img), 255);
}