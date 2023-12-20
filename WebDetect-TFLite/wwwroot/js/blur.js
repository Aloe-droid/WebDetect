function get1dGaussianKernel(sigma, size) {
    const x = tf.range(Math.floor(-size / 2) + 1, Math.floor(size / 2) + 1);
    const squaredX = tf.pow(x, 2);
    const expValues = tf.exp(tf.div(squaredX, -2.0 * (sigma * sigma)));
    const gaussianKernel1d = tf.div(expValues, tf.sum(expValues));
    return gaussianKernel1d;
}

function get2dGaussianKernel(size, sigma) {
    sigma = sigma || (0.3 * ((size - 1) * 0.5 - 1) + 0.8);
    const kernel1d = get1dGaussianKernel(sigma, size);
    const kernel2d = tf.outerProduct(kernel1d, kernel1d);
    return kernel2d;
}

function getGaussianKernel(size = 5, sigma) {
    return tf.tidy(() => {
        const kernel2d = get2dGaussianKernel(size, sigma);
        const kernel3d = tf.stack([kernel2d, kernel2d, kernel2d]);
        return tf.reshape(kernel3d, [size, size, 3, 1]);
    });
}

function gaussianBlur(image, kernel) {
    return tf.tidy(() => {
        return tf.depthwiseConv2d(image, kernel, 1, "valid");
    });
}