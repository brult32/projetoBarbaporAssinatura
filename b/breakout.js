var canvas = document.getElementById("myCanvas"),
	ctx = canvas.getContext("2d");
//GAME
var player = {score: 0, lives: 3},
	clearStage = 0,
	isStarted = false;
	isPaused = true,
	startBlink = {isBlinking: true, rate: 32, counter: 0},
	debug = {outline: false, dbug: false};
	debugArray = [];
var keyPressed = {right: false, left: false, up: false, down: false, fire: false};
//BALL
const defaultBallSpeed = 2;
var mainBall = {speedX: defaultBallSpeed, speedY: -defaultBallSpeed, x: 0, y: 0, radius: 10};
//BULLETS
const defaultBulletSpeed = 10;
var playerBullet = {radius: 4, delay: 0, interval: 4};
var bulletGroup = [];
//POWER BULLETS
var pUpDrops = {blinkRate: 16, speedY: 3, radius: 6};
var pUpGroup = [];
//POWERS
const powerTimeOut = 300, speedPowerFactor = 2;
var powerTimer = {bigPaddle: 0, moveY: 0, shot: 0, crush: 0, speed: 0};
var isPower = {bigPaddle: false, moveY: false, shot: false, crush: false, speed: false};
// PADDLE
const defaultPaddleWidth = 75, defaultPaddleY = canvas.height - 30;
var playerPaddle = { height: 10, width: defaultPaddleWidth, speed: 7, x: (canvas.width - defaultPaddleWidth) / 2, y: defaultPaddleY};
// ENEMY PADDLE
var isEnemyPaddle = true;
const enemyChangeSideCounter = 30;
var enemyPaddle = { height: 10, width: defaultPaddleWidth, speed: 4, x: (canvas.width - defaultPaddleWidth) / 2, y: 260 , changeSide: 0};
//BRICKS
const brickGrid = {rows: 12, columns: 7};
var brickData = {width: 75, height: 20, padding: 10, offsetTop: 30, offsetLeft: 30};
var bricks = [];
//SCENARIOS
var brickLayout = [
	1, 0, 0, 1, 0, 0, 1,
	0, 1, 1, 2, 1, 1, 0,
	10, 1, 1, 0, 1, 1, 10,
	3, 5, 1, 0, 1, 5, 3,
	0, 1, 4, 0, 4, 1, 0,
	3, 0, 1, 2, 1, 0, 3,
	1, 1, 5, 3, 4, 6, 1,
	0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0];
//COLORS&IMAGES
var colors = {text: "#000000", debug: '#0DFF00', ball: '#00ff00', bullet: '#ff0000',
	powerPaddle: '#ffffff', powerShot: '#ffaa00', crushBall: '#ff6600', speedBall: '#00ff33', moveY: '#ff0066',
	paddle: '#0000ff', brick: '#00ccff', unbrick: '#000000'};
var	brickColor = [colors.brick, colors.powerPaddle, colors.powerShot, colors.crushBall, colors.speedBall,
		colors.moveY, colors.brick, colors.brick, colors.brick, colors.unbrick];
// var brickColor = ['#449900','#ff9933','#22c9ff', '#9966ff', '#ff33ff'];
var imageBG = createImage('baymax.jpg'),
	ballSprite = [createImage('ball.png'), createImage('goldenball.png'), createImage('speedball.png'), createImage('sgball.png')],
	powerSprite = createImage('power.png'),
	bulletSprite = createImage('bullet.png'),
	brickSprite = createImage('brick.png'),
	paddleSprite = [createImage('paddle.png'), createImage('paddleshot.png'), createImage('paddlefly.png'), createImage('paddleshotfly.png')];
	enemyPadSprite = createImage('enemypaddle.png');
function createImage(source){
	let img = new Image();
	img.src = source;
	return img;
}
// image.classList.add("baymaximg");

// HANDLERS
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
function keyDownHandler(e) {
	if (e.key == "Right" || e.key == "ArrowRight") {
		keyPressed.right = true;
	}
	else if (e.key == "Left" || e.key == "ArrowLeft") {
		keyPressed.left = true;
	}
	if (e.key == "Up" || e.key == "ArrowUp") {
		keyPressed.up = true;
	}
	else if (e.key == "Down" || e.key == "ArrowDown") {
		keyPressed.down = true;
	}
	if (e.key == "Shift" || e.key == "0") {
		keyPressed.fire = true;
	}
	if (e.key == "Enter" || e.key == "s") {
		isPaused = false;
		isStarted = true;
	}
	if (e.key == "Esc" || e.key == "p") {
		isPaused = true;
	}
	if (e.key == "o" || e.key == "p") {
		debug.outline = !debug.outline;
	}
	if (e.key == "w") {
		document.location.reload();
	}
}
function keyUpHandler(e) {
	if (e.key == "Right" || e.key == "ArrowRight") {
		keyPressed.right = false;
	}
	else if (e.key == "Left" || e.key == "ArrowLeft") {
		keyPressed.left = false;
	}
	if (e.key == "Up" || e.key == "ArrowUp") {
		keyPressed.up = false;
	}
	else if (e.key == "Down" || e.key == "ArrowDown") {
		keyPressed.down = false;
	}
	if (e.key == "Shift" || e.key == "0") {
		keyPressed.fire = false;
	}
}
function mouseMoveHandler(e) {
	const relativeX = e.clientX - canvas.offsetLeft;
	if (relativeX > 0 && relativeX < canvas.width) {
		playerPaddle.x = relativeX - playerPaddle.width / 2;
	}
	if (isPower.moveY){
		const relativeY = e.clientY;
		playerPaddle.y = relativeY - playerPaddle.height / 2;
	}
}
function mouseDownHandler(e) {
	keyPressed.fire = true;
}
function mouseUpHandler(e) {
	keyPressed.fire = false;
}
// METHODS
function createBricks() {
	if (debug.dbug) {
		isPower.shot = true;
	}
	let brickId = 0;
	for (var row = 0; row < brickGrid.rows; row++) {
		bricks[row] = [];
		for (var col = 0; col < brickGrid.columns; col++) {
			bricks[row][col] = { x: 0, y: 0, status: brickLayout[brickId] }; //color: colors.brick
			bricks[row][col].x = (col * (brickData.width + brickData.padding)) + brickData.offsetLeft;
			bricks[row][col].y = (row * (brickData.height + brickData.padding)) + brickData.offsetTop;
			// bricks[row][col].color = getColor(bricks[row][col].status);
			brickId += 1;
			if (bricks[row][col].status > 0 && bricks[row][col].status < 10) {
				clearStage++;
			}
		}
	}
}

function updateScore() {
	player.score++;
	clearStage--;
	if (clearStage === 0) { //score === brickRowCount * brickColumnCount
		// alert("YOU WIN, CONGRATULATIONS!");
		isPaused = true;
		isStarted = false;
		bulletGroup = [];
		pUpGroup = [];
		bricks = [];
		losePowers();
		createBricks();
		// clearInterval(interval); // Needed for Chrome to end game
	}
}

function gameOver() {
	player.lives--;
	if (!player.lives) { // alert("GAME OVER");
		document.location.reload();
		// clearInterval(interval); // Needed for Chrome to end game
	} else {
		mainBall.x = playerPaddle.x + playerPaddle.width / 2;
		mainBall.y = canvas.height - 30;
		mainBall.speedX = defaultBallSpeed;
		mainBall.speedY = -defaultBallSpeed;
		if (debug.dbug) {
			playerPaddle.x = (canvas.width - playerPaddle.width) / 2;
		}
		losePowers();
		bulletGroup = [];
		pUpGroup = [];
		isPaused = true;
		isStarted = false;
	}
}

function losePowers(){	
	isPower.bigPaddle = false;
	resetPlayerWidth();
	if (!debug.dbug) {
		isPower.shot = false;
	}
	isPower.crush = false;
	isPower.speed = false;
	isPower.moveY = false;
	resetPlayerY();
}
function resetPlayerWidth(){
	playerPaddle.width = defaultPaddleWidth;
}
function resetPlayerY(){
	playerPaddle.y = defaultPaddleY;
}

function isBallTouching(object, objData){
	return mainBall.x + mainBall.radius > object.x && mainBall.x - mainBall.radius < object.x + objData.width && mainBall.y + mainBall.radius > object.y && mainBall.y - mainBall.radius < object.y + objData.height;
}

function getBallProximity(ball, object, range){
	if(isPower.speed){
		range *= 2;
	}
	return (Math.abs(ball - object) <= range);
}

function collisionDetected(brik) {
	if (brik.status < 10) {
		if (brik.status > 1) {
			// debugText('PowerUp Created');
			pUpGroup.push({ x: brik.x + brickData.width / 2, y: brik.y + brickData.height / 2, blink: 0, type: brik.status, color: brickColor[brik.status-1]}); //color: getColor(brik.color)
		}
		brik.status = 0;
		updateScore();
	}
}

function paddleHitBall(){
	if(isBallTouching(playerPaddle, playerPaddle)){
		if (getBallProximity(mainBall.x + mainBall.radius, playerPaddle.x, 3) || getBallProximity(mainBall.x - mainBall.radius, playerPaddle.x + playerPaddle.width, 3)) {
			debugText('hit Enemy X');
			mainBall.speedX = -mainBall.speedX;
			enemyFollowBall();
		}
		if (getBallProximity(mainBall.y + mainBall.radius, playerPaddle.y, 2) || getBallProximity(mainBall.y - mainBall.radius, playerPaddle.y + playerPaddle.height, 2)) {
			debugText('hit Enemy Y');
			mainBall.speedY = -mainBall.speedY;
			enemyFollowBall();
		}
	}
}

function enemyFollowBall(){
	debugText('ENEMY follow');
	if (Math.random() > 0.5){
		debugText(mainBall.x + 'follow' + enemyPaddle.x);
		if ((mainBall.x < enemyPaddle.x && enemyPaddle.speed > 0) ||
		(mainBall.x > enemyPaddle.x && enemyPaddle.speed < 0)){
			enemyPaddle.changeSide = -10;
			enemyPaddle.speed = -enemyPaddle.speed;
		}
	}
}

function changeEnemySide(){
	enemyPaddle.changeSide += 1;
	if (enemyPaddle.changeSide > enemyChangeSideCounter){
		enemyPaddle.changeSide = 0;
		// debugText('ENEMY random change');
		return Math.random() > 0.95;
	}
	return false;
}
// LOGIC
function brickCollision() {
	for (brickrow of bricks){ // for (let row = 0; row < brickGrid.rows; row++) {
		for (b of brickrow){ // for (let col = 0; col < brickGrid.columns; col++) {
			if (b.status > 0) {
				if (isBallTouching(b, brickData)){
					// debugText('touch brick');
					if (!isPower.crush || b.status == 10) {
						// debugText('not crush');
						if (getBallProximity(mainBall.x + mainBall.radius, b.x, 3) || getBallProximity(mainBall.x - mainBall.radius, b.x + brickData.width, 3)) {
							debugText('hit X');
							mainBall.speedX = -mainBall.speedX;
						}
						if (getBallProximity(mainBall.y + mainBall.radius, b.y, 2) || getBallProximity(mainBall.y - mainBall.radius, b.y + brickData.height, 2)) {
							debugText('hit Y');
							mainBall.speedY = -mainBall.speedY;
						}
					}
					collisionDetected(b);
					debugText('Ball on Brick: ' + b.x + ' ' + b.y);
				}
				//Bullet on brick detector
				for (bullet in bulletGroup) { //for (let bullet = 0; bullet < bulletGroup.length; bullet++) {
					if (bulletGroup[bullet].x > b.x && bulletGroup[bullet].x < b.x + brickData.width && bulletGroup[bullet].y > b.y && bulletGroup[bullet].y < b.y + brickData.height) {
						bulletGroup.splice(bullet, 1);
						collisionDetected(b);
						debugText('Bullet on Brick');
					}
				}
			}
		}
	}
}

function powerLogic() {
	for (pupC in pUpGroup){
		if (pUpGroup[pupC].x > playerPaddle.x && pUpGroup[pupC].x < playerPaddle.x + playerPaddle.width && pUpGroup[pupC].y > playerPaddle.y && pUpGroup[pupC].y < playerPaddle.y + playerPaddle.height) {
			switch (pUpGroup[pupC].type) {
				case 2:
					playerPaddle.x -= playerPaddle.width / 2;
					playerPaddle.width = playerPaddle.width * 2;
					isPower.bigPaddle = true;
					powerTimer.bigPaddle = 0;
					debugText('POWER Speed Start');
					break;
				case 3:
					isPower.shot = true;
					powerTimer.shot = 0;
					debugText('POWER Shoot Start');
					break;
				case 4:
					isPower.crush = true;
					powerTimer.crush = 0;
					debugText('POWER Crush Start');
					break;
				case 5:
					isPower.speed = true;
					powerTimer.speed = 0;
					mainBall.speedX *= speedPowerFactor;
					mainBall.speedY *= speedPowerFactor;
					debugText('POWER Speed Start');
					break;
				case 6:
					isPower.moveY = true;
					powerTimer.moveY = 0;
					debugText('POWER moveY Start');
					break;
			}
			pUpGroup.splice(pupC, 1);
		}
	}
	checkPowerTimer('bigPaddle', 1);
	checkPowerTimer('shot', 1);
	checkPowerTimer('crush', 2);
	checkPowerTimer('speed', 2);
	checkPowerTimer('moveY', 3);
}
function checkPowerTimer(name, factor){
	if (isPower[name]){
		powerTimer[name]++;
		if (powerTimer[name] > powerTimeOut * factor){
			isPower[name] = false;
			debugText('POWER ' + name + ' End');
			switch (name) {
				case 'bigPaddle':
					resetPlayerWidth();
					break;
				case 'speed':
					mainBall.speedX /= speedPowerFactor;
					mainBall.speedY /= speedPowerFactor;
					break;
				case 'moveY':
					resetPlayerY();
					break;
				default:
					// debugText('switch to the end');
					break;
			}
		}
	}
}

function bulletLogic() {
	if (keyPressed.fire && isPower.shot) {
		playerBullet.delay++;
		if (playerBullet.delay >= playerBullet.interval) {
			debugText('BULLET fired')
			playerBullet.delay = 0;
			bulletGroup.push({ x: playerPaddle.x + playerPaddle.width / 2, y: playerPaddle.y, type: 0 });
		}
	}
}

function ballLogic() {
	if (mainBall.x + (mainBall.radius * 2) > canvas.width - mainBall.radius || mainBall.x - mainBall.radius < 0) {
		mainBall.speedX = -mainBall.speedX;
	}
	if (mainBall.y + mainBall.speedY < mainBall.radius) {
		mainBall.speedY = -mainBall.speedY;
	} else if(mainBall.y > canvas.height){
		gameOver();
	}
	paddleHitBall();

	mainBall.x += mainBall.speedX;
	mainBall.y += mainBall.speedY;
	// mainBall.x += isPower.speed ? mainBall.speedX * speedPowerFactor : mainBall.speedX;
	// mainBall.y += isPower.speed ? mainBall.speedY * speedPowerFactor : mainBall.speedY;
}


function enemyPaddleLogic() {
	if (enemyPaddle.x < 0 || enemyPaddle.x + enemyPaddle.width >= canvas.width || changeEnemySide()){
		enemyPaddle.speed = -enemyPaddle.speed;
		// debugText('ENEMY change side');
	}
	enemyPaddle.x += enemyPaddle.speed;
	if (isBallTouching(enemyPaddle, enemyPaddle)){
		if (getBallProximity(mainBall.x + mainBall.radius, enemyPaddle.x, 3) || getBallProximity(mainBall.x - mainBall.radius, enemyPaddle.x + enemyPaddle.width, 3)) {
			debugText('hit Enemy X');
			mainBall.speedX = -mainBall.speedX;
		}
		if (getBallProximity(mainBall.y + mainBall.radius, enemyPaddle.y, 2) || getBallProximity(mainBall.y - mainBall.radius, enemyPaddle.y + enemyPaddle.height, 2)) {
			debugText('hit enemy Y');
			mainBall.speedY = -mainBall.speedY;
		}
	}
}

function checkControls(){
	if (keyPressed.right && playerPaddle.x < canvas.width - playerPaddle.width / 4) {
		playerPaddle.x += playerPaddle.speed;
	} else if (keyPressed.left && playerPaddle.x > 0 - playerPaddle.width / 4 * 3) {
		playerPaddle.x -= playerPaddle.speed;
	}
	if(isPower.moveY){
		if (keyPressed.up && playerPaddle.y > 0) {
			playerPaddle.y -= playerPaddle.speed;
		} else if (keyPressed.down && playerPaddle.y + playerPaddle.height < canvas.height){
			playerPaddle.y += playerPaddle.speed;
		}
	}
}
// DRAW
function drawBullet() {
	for (bullet in bulletGroup) {
		bulletGroup[bullet].y -= defaultBulletSpeed;
		if (bulletGroup[bullet].y < 0) {
			bulletGroup.splice(bullet, 1);
		} else {
			ctx.drawImage(bulletSprite, bulletGroup[bullet].x - playerBullet.radius, bulletGroup[bullet].y - playerBullet.radius, playerBullet.radius * 2, playerBullet.radius);
			if (debug.outline) {
				drawCircle(bulletGroup[bullet].x, bulletGroup[bullet].y, playerBullet.radius, 0, Math.PI * 2, colors.bullet);
			}
		}
	}
}

function drawPowerUp() {
	for (pupC in pUpGroup){
		pUpGroup[pupC].y += pUpDrops.speedY;
			pUpGroup[pupC].blink++;
			if (pUpGroup[pupC].blink <= pUpDrops.blinkRate / 2) {
				ctx.drawImage(powerSprite, pUpGroup[pupC].x - pUpDrops.radius, pUpGroup[pupC].y - pUpDrops.radius, pUpDrops.radius * 2, pUpDrops.radius * 2);
				if (debug.outline) {
					drawCircle(pUpGroup[pupC].x, pUpGroup[pupC].y, pUpDrops.radius, 0, Math.PI * 2, brickColor[pUpGroup[pupC].color]); //pUpGroup[pupC].color
				}
			} else if (pUpGroup[pupC].blink > pUpDrops.blinkRate / 2) {
				pUpGroup[pupC].blink = 0;
			}
			if (pUpGroup[pupC].y > canvas.height) {
				pUpGroup.splice(pupC, 1);
			}
	}
}

function drawBall() {
	if (!isStarted) { //isPaused
		mainBall.x = playerPaddle.x + playerPaddle.width / 2;
		mainBall.y = playerPaddle.y - mainBall.radius - 3;
	}
	let bSprite = 0;
	if (isPower.crush) {bSprite += 1;}
	if (isPower.speed) {bSprite += 2;}
	ctx.drawImage(ballSprite[bSprite], mainBall.x - mainBall.radius, mainBall.y - mainBall.radius, mainBall.radius * 2, mainBall.radius * 2);
	if (debug.outline) {
		drawCircle(mainBall.x, mainBall.y, mainBall.radius, 0, Math.PI * 2, colors.ball);
	}
}

function drawPaddle() {
	let bSprite = 0;	
	if (isPower.shot) {bSprite += 1;}
	if (isPower.moveY) {bSprite += 2;}
	ctx.drawImage(paddleSprite[bSprite], playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height); //isPower.shot ? 1 : 0
	if (debug.outline) {
		drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, colors.paddle, false);
	}
}

function drawEnemyPaddle() {
	if (isEnemyPaddle) {
		ctx.drawImage(enemyPadSprite, enemyPaddle.x, enemyPaddle.y, enemyPaddle.width, enemyPaddle.height);
		if (debug.outline) {
			drawRect(enemyPaddle.x, enemyPaddle.y, enemyPaddle.width, enemyPaddle.height, colors.paddle, false);
		}
	}
}

function drawBricks() {
	for (brickrow of bricks){
		for (b of brickrow){
			if (b.status > 0 || b.status == -1) {
				drawRect(b.x, b.y, brickData.width, brickData.height, brickColor[b.status - 1], true); //'yellowgreen' b.color
				ctx.drawImage(brickSprite, b.x, b.y, brickData.width, brickData.height);
			}
		}
	}
}

function drawHUD() {
	drawText(`Score: ${player.score}`, 8, 20, '16px', colors.text); //Score
	drawText(`Lives: ${player.lives}`, canvas.width - 65, 20, '16px', colors.text); //Lives
	if (isPaused && startBlink.isBlinking) {
		drawText('"Press Enter"', canvas.width / 2 - 130, 280, '48px', "#FF0000"); //Lives
	}
	startBlink.counter++;
	if (startBlink.counter > startBlink.rate) {
		startBlink.counter = 0;
		startBlink.isBlinking = !startBlink.isBlinking;
	}
}

function drawCircle(x, y, r, start, end, color) {
	ctx.beginPath();
	ctx.arc(x, y, r, start, end);
	// ctx.fillStyle = color;
	// ctx.fill();
	drawStroke(color);
	ctx.closePath();
}
function drawRect(x, y, w, h, color, fill) {
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	if (fill) {
		ctx.fillStyle = color;
		ctx.fill();
	}
	drawStroke(color);
	ctx.closePath();
}
function drawStroke(color) {
	ctx.strokeStyle = color;
	ctx.stroke();
}
function drawText(text, x, y, size, color) {
	ctx.font = size + " Arial";
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}
function drawGrid() {
	if(debug.outline){
		drawRect(mainBall.x, mainBall.y, 0.2, mainBall.radius, colors.text, true);
		drawRect(mainBall.x, mainBall.y, mainBall.radius, 0.2, colors.text, true);
		drawRect(mainBall.x - mainBall.radius, mainBall.y, mainBall.radius, 0.2, colors.debug, true);
		drawRect(mainBall.x, mainBall.y - mainBall.radius, 0.2, mainBall.radius, colors.debug, true);
		drawRect(playerPaddle.x, 0, 0.2, canvas.height, colors.bullet, true);
		drawRect(playerPaddle.x + playerPaddle.width, 0, 0.2, canvas.height, colors.bullet, true);
		drawRect(0, playerPaddle.y, canvas.width, 0.2, colors.bullet, true);
		drawRect(0, playerPaddle.y + playerPaddle.height, canvas.width, 0.2, colors.bullet, true);
	}	
}

// MAIN
createBricks();
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//Game Logic
	if (!isPaused) {
		brickCollision();
		bulletLogic();
		powerLogic();
		ballLogic();
	}
	enemyPaddleLogic();
	checkControls();
	//Draw
	ctx.globalAlpha = 0.6;
	ctx.drawImage(imageBG, 0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	drawBullet();
	drawPowerUp();
	drawBall();
	drawPaddle();
	drawEnemyPaddle();
	drawBricks();
	drawHUD();
	drawGrid();
	//TIMING
	requestAnimationFrame(draw);
}
draw();

function debugText(text){
	debugArray.push(text);
	if(debugArray.length > 20){
		debugArray.shift();
	}
	document.getElementById('debug').innerHTML = debugArray.join('<br>');
}