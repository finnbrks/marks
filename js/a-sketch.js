let analyserNode;

let reFlag;

async function getMedia(constraints) {
  try {
    let stream = null;
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    /* use the stream */
    const audioContext = new AudioContext();
    const microphone = audioContext.createMediaStreamSource(
      stream
    );
    analyserNode = audioContext.createAnalyser();
    microphone.connect(analyserNode);
  } catch (err) {
    /* handle the error */
  }
}

function getLevel() {
  if (!analyserNode) {
    return 0;
  }
  const pcmData = new Float32Array(analyserNode.fftSize);
  analyserNode.getFloatTimeDomainData(pcmData);
  let sumSquares = 0.0;
  for (const amplitude of pcmData) {
    sumSquares += amplitude * amplitude;
  }
  return Math.sqrt(sumSquares / pcmData.length);
}

windowResized = function() {

	if ( windowWidth < 1200) {
	
		let mySection = select('div#p5');
		
		myMain = select('main');
		
		gridCanvas = resizeCanvas(myMain.width, myMain.height);
		resizeSmallFlag  =  true;
	}
	
	if (windowWidth => 1200 && resizeSmallFlag ) { resizeBigFlag = true; }
	
	// [Log] sm 498 | 598|| 1224 | 1200 (sketch.js, line 91)
	
} // end resize

let fft;
let mic;

function setup() {
	reFlag = true;
	// set color mode to hue saturation brightness
	// for easier colour manipulation
  	colorMode(HSB,360,100,100,1);

  getMedia({
    audio: true,
    video: false,
  });
  
  //createCanvas(windowWidth, windowHeight);
  // quick hack
  createCanvas(600, 600);

  
  
  
  angleMode(DEGREES);
  
  mic = new p5.AudioIn();
  mic.start();
  
  fft = new p5.FFT();
  fft.setInput(mic);
  fft.analyze();
  
  noFill();
    strokeWeight(3);

}


function draw() {
  background(0); // HSB black
  stroke(0,0,100); // HSB white
  
  // move to middle of canvas
  translate(width/2,height/2);
  
  fft.analyze();
  amp = fft.getEnergy(20,200);
  
  //console.log("a " + amp);

  let wave = fft.waveform();
  
  // repeat loop that creates circle waveform shape
  // fron fft data
  for (var t = -1; t <=1; t+=2) {
  
	beginShape();
  	for(let i=0; i<=180; i+=0.5){
    	let index = floor(map(i,0,180,0,wave.length - 1));
    //              value from fft  low  high  new low   new high
  		let r = map(wave[index],    -1,  1,    50,       450);
    
    // use r + some geomertry to make circle
    	let x = r * sin(i)* t;
    	let y = r * cos(i);
    	vertex(x,y); // point on circle
  	}
  	endShape();
}
  
}

function touchStarted() {

  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  reFlag = true;
}
