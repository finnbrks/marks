let analyserNode;

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


let theta;

let myHue = 90; // starting hue
let twig = 3;	// starting branch thickness

let drawFlag = true;
let clearFlag = false;
let bugFlag = false;

let resizeBigFlag =  false;
let resizeSmallFlag =  false;

let gridCanvas;

let myMain;


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


function setup() {

	getMedia({
    audio: true,
    video: false,
	});
	
	myMain = select('main');

	// 1. select element
	let mySection = select('div#p5');

	// 2. create canvas	- values should tie with CSS
	gridCanvas = createCanvas(myMain.width, myMain.height);

	// 3. stick canvas inside selected element
	mySection.child(gridCanvas);

	// set colour mode to Hue Saturation Brightness
	colorMode(HSB,360,100,100,1);

	background(0,0,100,0);
	stroke(myHue,100,100,0.2);
	strokeWeight(3);
	
	//console.log("sm " + mySection.height + " | " + myMain.height + "||" +  + mySection.width + " | " + myMain.width);

	frameRate(8);

} // end setup


function draw() {  

	//force canvas to container width after resize - could be simpler
 	if (resizeBigFlag) { 
		let mySection = select('div#p5');
		gridCanvas = resizeCanvas(mySection.width, 400);
		background(0,0,100,0);	
		resizeBigFlag = false;
		resizeSmallFlag = false;
 	}

	if (clearFlag) {
		drawFlag = false;
		fill(0,0,100);
		noStroke();
		rect(0,0,width,height);
		clearFlag = false;
	}

	if (drawFlag) { drawTree(); }

} // end draw


function drawTree() {
	// fade out background
	fill(0,0,100,0.01);
	noStroke();
	rect(0,0,width,height);

	// set colour
	myColour();
	
	let vol = getLevel();
	
	let a;

	a = map(vol, 0,0.4, 0,90);
	
	// variable for how tall a tree
	let tall;

	// map mic to tree trunk height
	tall = int(map(vol, 0.05,0 ,-300,0));

	// Convert it to radians
	theta = radians(a);

	// Start the tree from the bottom of the screen
	let rw = int(random( 20, width-20));

	// position start line
	translate(rw,height);
	// Draw a line using tall variable
	line(0,0,0,tall);
	// Move to the end of that line
	translate(0,tall);
	// Start the recursive branching!
	branch(abs(tall));

} // end drawTree


function branch(h) {
	// Each branch will be 2/3rds (ish) the size of the previous one
	h *= map(random(1), 0, 1, 0.5, 0.8); // INTRODUCE RANDOMNESS

	if (h > 4) {
		push();

		let theta_2 = map(random(1), 0, 1, 0.7*theta, 2*theta);
		rotate(theta_2);	// Rotate by theta // INTRODUCE RANDOMNESS
		line(0, 0, 0, -h);	// Draw the branch
		translate(0, -h);	// Move to the end of the branch
		branch(h);			// Ok, now call myself to draw two new branches!!
		pop();				// Whenever we get back here, we "pop" in order to restore the previous matrix state

		// Repeat the same thing, only branch off to the "left" this time!
		push();
		let theta_3 = map(random(1), 0, 1, 0.7*theta, 2*theta);
		rotate(-theta_3); // INTRODUCE RANDOMNESS
		line(0, 0, 0, -h);
		translate(0, -h);
		branch(h);
		pop();

	} // end if > 4

} // end branch


function myColour() {

	// randomise & increment hue value
	let r = random(-19,20);
	myHue = myHue + r;

	// myHue = myHue + map(mouseX,0,width,0,359);

	// reset colour
	if (myHue < 0 ) { myHue = 359 - myHue; }
	if (myHue > 359) { myHue = myHue - 359; }
	stroke(myHue,100,100,0.2);

	myTwig(r);

} // end myColour


function myTwig(cr) {

	// adjust branch thickness with mouseY
	let fat = int(map(mouseY,0,height,1,10));

	// reuse myColor random r value to set stroke weight
	twig = abs(cr/2);
	if (twig < 1 ) { twig = twig + 1; }
	if (twig > 10 ) { twig = twig - 1; }
	strokeWeight(twig*fat); // make multiple value a variable
} // end myTwig


function keyPressed() {

	if (key == 'b') {
		if (bugFlag) { bugFlag = false; } else { bugFlag = true; }
	}

	if (key == 'c') {
		if (clearFlag == true) { clearFlag = false; } else { clearFlag = true; }
	}

	if (key == 'd') {
		if (drawFlag == true) { drawFlag = false; } else { drawFlag = true; }
	}

	if (key == 's') {
		saveFrame("recursive_tree_" + frameCount + ".png");
	}

} // end keyPressed
