let busy = false;
let session = null;
let _model_name = "none"
let isLoading = false;

async function inference(input, model_name, size) {
    
    if (busy || isLoading) {
        return;
    }

    if (!session || _model_name != model_name || size == null) {
        session = null;
        await initializeModel(model_name, size);
        _model_name = model_name;
    }
    busy = true;

    const name = session.inputNames;
    const output = await session.run({ [name] : input});
    busy = false;
    return output;
}

async function initializeModel(model_name, size) {
    isLoading = true;

    const name = "/model/" + model_name + "_" + size + ".onnx";
    session = await ort.InferenceSession.create("/model/" + model_name + "_" + size + ".onnx");
    isLoading = false;
}

