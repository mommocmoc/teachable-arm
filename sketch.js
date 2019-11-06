var logits = new Array(3);
let buttons;
let confidences;
let onceTrigger = [true, true, true];
let video;
let features;
let knn;
let labelP;
let device;
let deviceP;
let port;
let encoder = new TextEncoder("utf-8");
let trigger = true;
let isBitSet = false;
let learningNums;
let progressBars;
let clearLabels;
let captureX_s = [0, 0, 0],
  captureY_s = [0, 0, 0];
let imageViewers = new Array(3);
let x_s = new Array(3),
  y_s = new Array(3);
let canvases = new Array(3);
let connectionTrigger = true;

function setup() {
  for (let index = 0; index < imageViewers.length; index++) {
    imageViewers[index] = select("#imageViewer" + index);
  }
  for (let index = 0; index < x_s.length; index++) {
    x_s[index] = imageViewers[index].width;
    y_s[index] = imageViewers[index].height;
  }
  for (let index = 0; index < canvases.length; index++) {
    canvases[index] = createCanvas(x_s[index], y_s[index]);
    canvases[index].parent(imageViewers[index]);
    canvases[index].hide();
    //TODO : Making captureImage Function
    canvases[index].mousePressed(captureImage);
  }

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.parent("videoDiv");
  //video.hide();

  console.log("ml5 version:", ml5.version);
  features = ml5.featureExtractor("MobileNet", modelReady);
  knn = ml5.KNNClassifier();
  //학습하기 버튼
  buttons = selectAll(".learning");
  //학습하기 버튼 마이크로 비트 연동 전 동작 : 안눌림
  for (let index = 0; index < buttons.length; index++) {
    const element = buttons[index];
    element.attribute("disabled", "");
  }
  //학습 데이터 수 표시를 위한 H5태그
  learningNums = selectAll(".learningNums");
  //신뢰도 표시를 위한 progress-bar 클래스 div
  progressBars = selectAll(".progress-bar");
  confidences = selectAll(".inner");
  //usb연결을 위한 버튼
  var usbButton = select("#selectUSB");
  // usbButton.mousePressed(connectUSB);
  usbButton.mousePressed(connectDevice);
  deviceP = select("#selectedDeviceInfo");
  //분류 안내용 P태그 엘레먼트
  labelP = select("#label");
  labelP.hide();
  //초기화 버튼
  clearLabels = selectAll(".clearLabel");
  clearLabels[0].mousePressed(clearLabelA);
  clearLabels[1].mousePressed(clearLabelB);
  clearLabels[2].mousePressed(clearLabelC);
  clearLabels[0].touchEnded(clearLabelA);
  clearLabels[1].touchEnded(clearLabelB);
  clearLabels[2].touchEnded(clearLabelC);
  // //테스트용 버튼
  // let result = createButton("Test");
  // result.mousePressed(testEvent);
  // result.hide();
}
function connectDevice() {
  uBitConnectDevice(uBitEventHandler);
}
function testEvent() {
  //Microbit interface 4, encoding해서 message 보내기
  port.transferOut(4, encoder.encode("next\n"));
}

function captureImage() {
  console.log("TODO!");
  // image(video, captureX, captureY, 100, 100);
}
function clearLabelA() {
  knn.clearLabel("ClassA");
  progressBars[0].style("width", 0 + "%");
  let num = knn.getCountByLabel().ClassA;
  if (num === undefined) {
    learningNums[0].html("0");
    learningNums[3].html("0");
  } else {
    learningNums[0].html(num);
    learningNums[3].html(num);
  }
}
function clearLabelB() {
  knn.clearLabel("ClassB");
  progressBars[1].style("width", 0 + "%");
  let num = knn.getCountByLabel().ClassB;
  if (num === undefined) {
    learningNums[1].html("0");
    learningNums[4].html("0");
  } else {
    learningNums[1].html(num);
    learningNums[4].html(num);
  }
}
function clearLabelC() {
  knn.clearLabel("ClassC");
  progressBars[2].style("width", 0 + "%");
  let num = knn.getCountByLabel().ClassC;
  if (num === undefined) {
    learningNums[2].html("0");
    learningNums[5].html("0");
  } else {
    learningNums[2].html(num);
    learningNums[5].html(num);
  }
}

function connectUSB() {
  navigator.usb
    .requestDevice({ filters: [{ vendorId: 0x0d28 }] }) // mircrobit vendorID, productID: 0x0204
    .then(device => {
      port = device;
      deviceP.html(device.productName + "가 연결되었습니다.");
      console.log(device.productName);
      console.log(device.manufacturerName);
      //버튼 활성화 Button Activated!
      for (let index = 0; index < buttons.length; index++) {
        const element = buttons[index];
        element.removeAttribute("disabled");
        element.html("학습하기" + (index + 1));
      }
      buttons[0].mousePressed(learningA);
      buttons[1].mousePressed(learningB);
      buttons[2].mousePressed(learningC);
      buttons[0].touchStarted(learningA);
      buttons[1].touchStarted(learningB);
      buttons[2].touchStarted(learningC);
      //알림 삭제
      let alert = select(".alert");
      alert.hide();
      //학습이 필요하다고 알려줌
      labelP.show();
      return port.open();
    })
    .then(() => port.selectConfiguration(1))
    .then(() => port.claimInterface(4))
    .then(()=> port.controlTransferOut(DAPOutReportRequest))
    .then(() => port.transferIn(4, 64))
    .then(result => {
      let decoder = new TextDecoder();
      console.log("Recieved: " + decoder.decode(result.data));
    })
    .catch(error => {
      deviceP.html(error);
      console.log(error);
    });
}

function modelReady() {
  console.log("model ready!");
}

function learningA() {
  const currentVideo = features.infer(video);
  knn.addExample(currentVideo, "ClassA");
  console.log("클래스 A 학습");
  let num = knn.getCountByLabel().ClassA;
  if (num > 0 && onceTrigger[0] === true) {
    learningNums[0].id("learnedA");
    learningNums[3].id("learnedA");
    onceTrigger[0] = false;
  }
  learningNums[0].html(num);
  learningNums[3].html(num);
}
function learningB() {
  const currentVideo = features.infer(video);
  knn.addExample(currentVideo, "ClassB");
  console.log("클래스 B 학습");
  let num = knn.getCountByLabel().ClassB;
  if (num > 0 && onceTrigger[1] === true) {
    learningNums[1].id("learnedB");
    learningNums[4].id("learnedB");
    onceTrigger[1] = false;
  }
  learningNums[1].html(num);
  learningNums[4].html(num);
}
function learningC() {
  const currentVideo = features.infer(video);
  knn.addExample(currentVideo, "ClassC");
  console.log("클래스 C 학습");
  let num = knn.getCountByLabel().ClassC;
  if (num > 0 && onceTrigger[2] === true) {
    learningNums[2].id("learnedC");
    learningNums[5].id("learnedC");
    onceTrigger[2] = false;
  }
  learningNums[2].html(num);
  learningNums[5].html(num);
}
function gotResult(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
}
function progressBarUpdate(err, result) {
  progressBars[0].style(
    "width",
    result.confidencesByLabel["ClassA"] * 100 + "%"
  );
  progressBars[1].style(
    "width",
    result.confidencesByLabel["ClassB"] * 100 + "%"
  );
  progressBars[2].style(
    "width",
    result.confidencesByLabel["ClassC"] * 100 + "%"
  );
}

function goClassify() {
  const logits = features.infer(video);

  knn.classify(logits, function(err, result) {
    progressBarUpdate(err, result);

    if (err) {
      console.error(err);
    } else {
      //Video 아래 레이블 변경하기
      if (result.label === undefined) {
        labelP.html(
          "현재 학습량이 적어 분류할 수 없습니다. 모든 클래스를 학습시켜주세요!"
        );
      } else {
        labelP.html("현재 입력값은 " + result.label + " 로 분류되었습니다.");
      }
      //레이블 값에 따라 마이크로비트에 시리얼 값 보내기
      if (
        result.label === "ClassA" &&
        result.confidencesByLabel["ClassA"] >= 1.0 &&
        trigger === true
      ) {
        setTimeout(() => {
          console.log("A!");
          uBitSend(connectedDevices[0],"0");
          //  port.transferOut(4, encoder.encode("0\n"));
          //  connectedDevices[0].transferOut(4, encoder.encode("0\n"));
        }, 500);
        trigger = false;
      } else if (
        result.label === "ClassB" &&
        result.confidencesByLabel["ClassB"] >= 1.0 &&
        trigger === true
      ) {
        setTimeout(() => {
          console.log("B!");
          uBitSend(connectedDevices[0], "1");
          // port.transferOut(4, encoder.encode("1\n"));
          // connectedDevices[0].transferOut(4, encoder.encode("1\n"));
        }, 500);
        trigger = false;
        // port.transferIn(4, encoder.encode("1"));
      } else if (
        result.label === "ClassC" &&
        result.confidencesByLabel["ClassC"] >= 1.0 &&
        trigger === true
      ) {
        setTimeout(() => {
          console.log("C!");
          uBitSend(connectedDevices[0], "2");
          // port.transferOut(4, encoder.encode("2\n"));
          // connectedDevices[0].transferOut(4, encoder.encode("2\n"));
        }, 500);
        trigger = false;
      } else {
        setTimeout(() => {
          trigger = true;
        }, 1000);
      }
      //Repeat!
      goClassify();
    }
  });
}

//결과값 보기 테스트용 함수입니다.
function resultEvent() {
  const logits = features.infer(video);
  if (knn.getNumLabels() > 0) {
    knn.classify(logits, gotResult);
  }
  // console.log(test.dataSync());
}

function draw() {
  if (connectedDevices.length > 0 && connectionTrigger) {
    deviceP.html(connectedDevices[0].productName + "가 연결되었습니다.");
    for (let index = 0; index < buttons.length; index++) {
      const element = buttons[index];
      element.removeAttribute("disabled");
      element.html("학습하기" + (index + 1));
    }
    buttons[0].mousePressed(learningA);
    buttons[1].mousePressed(learningB);
    buttons[2].mousePressed(learningC);
    buttons[0].touchStarted(learningA);
    buttons[1].touchStarted(learningB);
    buttons[2].touchStarted(learningC);
    //알림 삭제
    let alert = select(".alert");
    alert.hide();
    //학습이 필요하다고 알려줌
    labelP.show();
    connectionTrigger = false;
  }
  if (knn.getNumLabels() > 2) {
    goClassify();
  }
}
