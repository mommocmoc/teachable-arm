var logits = new Array(3);
let buttons;
let confidences;

let video;
let features;
let knn;
let labelP;

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
  buttons = selectAll("button");
  buttons[0].mousePressed(learningA);
  buttons[1].mousePressed(learningB);
  buttons[2].mousePressed(learningC);

  confidences = selectAll(".inner");
  
  for (let index = 0; index < confidences.length; index++) {
      const element = confidences[index];
      element.style('background-color',colors[index]);
      element.style("background-width", '0%');
      
  }

  //   let result = createButton("Result");
  //   result.mousePressed(resultEvent);
  //   result.hide();
  labelP = createP("학습데이터가 필요합니다!");
}

//  features.infer(video);

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
    if (err) {
      console.error(err);
    } else {
      labelP.html(result.label + " " + result.confidencesByLabel[result.label]);
      goClassify();
    }
  });
}

function resultEvent() {
  const logits = features.infer(video);
  if (knn.getNumLabels() > 0) {
    knn.classify(logits, gotResult);
  }
  // console.log(test.dataSync());
}

function draw() {
  image(video, 0, 0);
  if (knn.getNumLabels() > 0) {
    goClassify();
  }
}
