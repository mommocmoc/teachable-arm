function setup(){
    var canvas = createCanvas(320,240);
    canvas.parent('video')
    video = createCapture(VIDEO);
    video.size(320,240);
    video.hide();

}

function draw(){
    image(video,0,0)
}