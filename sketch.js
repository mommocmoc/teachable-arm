var logits = new Array(3);
let buttons;
let confidences;

let video;
let features;
let knn;
let labelP;
let deviceP;
let port;
let encoder = new TextEncoder();
let trigger = true;
let isBitSet = false;

function setup() {
  let colors = [color(52, 235, 94), color(235, 52, 232), color(235, 73, 52)];
  var canvas = createCanvas(320, 240);
  //canvas.parent("videoDiv");
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.parent("videoDiv");
  //video.hide();
  canvas.hide();
  console.log("ml5 version:", ml5.version);
  features = ml5.featureExtractor("MobileNet", modelReady);
  knn = ml5.KNNClassifier();
  buttons = selectAll(".learning");
  for (let index = 0; index < buttons.length; index++) {
    const element = buttons[index];
    element.attribute("disabled","")
    element.mousePressed(alert);
  }
  // buttons.style("disable")
  buttons[0].mousePressed(learningA);
  buttons[1].mousePressed(learningB);
  buttons[2].mousePressed(learningC);

  confidences = selectAll(".inner");
  var testButton = select("#selectUSB");
  testButton.mousePressed(testUSB);
  deviceP = select("#selectedDeviceInfo");

  for (let index = 0; index < confidences.length; index++) {
    const element = confidences[index];
    element.style("background-color", colors[index]);
    element.style("background-width", "0%");
  }
  labelP = select("#label");
  let result = createButton("Test");
  result.mousePressed(testEvent);
  result.hide();
}
function testEvent() {
  //Microbit interface 4, encoding해서 message 보내기
  port.transferOut(4, encoder.encode("next\n"));
}

function testUSB() {
  navigator.usb
    .requestDevice({ filters: [{ vendorId: 0x0d28, productID: 0x0204 }] }) // mircrobit vendorID,productID
    .then(device => {
      port = device;
      deviceP.html(device.productName + "가 연결되었습니다.");
      console.log(device.productName);
      console.log(device.manufacturerName);
      //버튼 활성화 Button Activated!
      for (let index = 0; index < buttons.length; index++) {
        const element = buttons[index];
        element.removeAttribute("disabled")
      }
      //알림 삭제
      let alert = select(".alert");
      alert.hide();
      return port.open();
    })
    .then(() => port.selectConfiguration(1))
    .then(() => port.claimInterface(2))
    .then(() =>
      port.controlTransferOut({
        requestType: "standard",
        recipient: "interface",
        request: 0x22,
        value: 0x01,
        index: 0x02
      })
    )
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
}
function learningB() {
  const currentVideo = features.infer(video);
  knn.addExample(currentVideo, "ClassB");
  console.log("클래스 B 학습");
}
function learningC() {
  const currentVideo = features.infer(video);
  knn.addExample(currentVideo, "ClassC");
  console.log("클래스 C 학습");
}
function gotResult(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
}
function goClassify() {
  const logits = features.infer(video);

  knn.classify(logits, function(err, result) {
    //Video 아래 레이블 변경하기
    if (err) {
      console.error(err);
    } else {
      labelP.html(result.label + " " + result.confidencesByLabel[result.label]);
      //레이블 값에 따라 마이크로비트에 시리얼 값 보내기
      if (
        result.label === "ClassA" &&
        result.confidencesByLabel["ClassA"] >= 1.0 &&
        trigger === true
      ) {
        setTimeout(() => {
          console.log("A!");
          port.transferOut(4, encoder.encode("0\n"));
        }, 500);
        trigger = false;
      } else if (
        result.label === "ClassB" &&
        result.confidencesByLabel["ClassB"] >= 1.0 &&
        trigger === true
      ) {
        setTimeout(() => {
          console.log("B!");
          port.transferOut(4, encoder.encode("1\n"));
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
          port.transferOut(4, encoder.encode("2\n"));
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
  image(video, 0, 0);
  if (knn.getNumLabels() > 1) {
    goClassify();
  }
}
