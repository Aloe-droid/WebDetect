## 객체 감지를 .NET Blazor 웹으로 구현한 코드입니다.

-------
### WebDetect-ONNX 
#### OpenCV 와 ONNXRuntime 라이브러리를 이용, Blazor Server 앱입니다.
-------
### WebDetect-TFLite
#### TFjs 와 TFlite 라이브러리를 이용, Blazor WebAssembly 앱입니다.
-------

각 폴더의 차이는 모델 tflite/onnx 차이이며 내부 로직은 거의 동일합니다. <br/>
두 폴더를 다운받고, 폴더 중 하나를 선택한 하여 접속한 후 커맨드 창에 아래와 같이 입력하면 실행할 수 있습니다.

    dotnet run

### 실행하면 옆 네비 메뉴에서 Detect를 선택합니다.

![image](https://github.com/Aloe-droid/WebDetect/assets/103430477/d3ffef51-75f6-4c8d-ab33-a0d1ce71a898)

#### 1. 감지하고자 하는 객체를 선택할 수 있습니다. (객체별 모델이 따로 존재합니다. (wwwroot/model/))
#### 2. 위 사진과 같이 상단에 confidence threshold를 변경할 수 있습니다.
</br></br>
## 선택할 수 있는 모델은 아래와 같습니다.

#### 1. COCO 감지 모델
#### 2. 화재 감지 모델
#### 3. 얼굴 감지 모델
#### 4. 포즈 감지 모델
#### 5. 움직임 감지 (tflite 폴더에만 존재합니다.)
<br/>

##### 1번 모델은 YOLOv8n object detection (pretrained) 모델을 onnx/tflite로 변경 후 사용했습니다.

##### 2번 모델은 YOLOv8n object detection 모델을 따로 학습시킨 후 onnx/tflite로 변경 후 사용했습니다.

##### 3번 모델은 YuNet을 onnx/tflite로 변경 후 사용했습니다. 이후 감지 된 얼굴에 가우시안 블러 처리를 진행합니다. 

https://github.com/opencv/opencv_zoo/blob/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx 
<br/>
이곳에서 다운받을 수 있습니다.

##### 4번 모델은 YOLOv8n pose estimation (pretrained) 모델을 onnx/tflite로 변경 후 사용했습니다.

##### 5번은 모델은 따로 없으며 픽셀 비교 연산을 통한 움직임 감지입니다. (tflite 폴더에만 존재합니다.)

<br/>

## 아래는 감지된 사진입니다.

### 1. COCO
![image](https://github.com/Aloe-droid/WebDetect/assets/103430477/dd81e467-eb19-48d1-ae2b-fab39ce55f4d)
</br>
### 2. 화재
![image](https://github.com/Aloe-droid/WebDetect/assets/103430477/4fdc3af8-27bf-4d3a-b5f3-ee6811633ac4)
</br>
### 3. 얼굴 + 가우시안 블러 (얼굴은 가렸습니다.)
![image](https://github.com/Aloe-droid/WebDetect/assets/103430477/6d1ed538-f60a-4af2-b034-923e44cd3229)
</br>
### 4. 포즈 (얼굴은 가렸습니다.)
![image](https://github.com/Aloe-droid/WebDetect/assets/103430477/5e348af6-8045-407d-8281-d2bd8851ec9c)
</br>
### 5. 움직임 감지
![image](https://github.com/Aloe-droid/WebDetect/assets/103430477/a95d0d68-3492-4ad3-842a-0f0606b5fda5)



