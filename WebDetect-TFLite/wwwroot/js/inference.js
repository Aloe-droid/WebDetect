let busy = false;
let model = null;
let _model_name = "none"
let isLoading = false;

async function inference(input, model_name, size) {
    
    if (busy || isLoading) {
        return;
    }

    if (!model || _model_name != model_name || size == null) {
        model = null;
        await initializeModel(model_name, size);
        _model_name = model_name;
    }

    busy = true;

    const output = model.predict(input);

    busy = false;
    return output;
}

async function initializeModel(model_name, size) {
    isLoading = true;
    model = await tflite.loadTFLiteModel("/model/" + model_name + "_" + size+ ".tflite", { numThreads: navigator.hardwareConcurrency / 2 });  
    isLoading = false;
}
