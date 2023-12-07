var dots = [],
	mouse = {
		x: 0,
		y: 0
	};
let mainTimer = 0,
	defaultTimer = 20,
	reDot = 0,
	defaultSize = 10;

var Dot = function () {
	this.x = mouse.x;
	this.y = mouse.y;
	this.size = defaultSize;
	this.node = (function () {
		var n = document.createElement("div");
		n.className = "trail";
		// n.style.height = defaultSize + 'px';
		// n.style.width = defaultSize + 'px';
		n.style.zIndex = 1;
		document.body.appendChild(n);
		return n;
	}());
};

Dot.prototype.draw = function () {
	this.node.style.left = this.x + "px";
	this.node.style.top = this.y + "px";
};

for (var i = 0; i < 12; i++) {
	var d = new Dot();
	dots.push(d);
}

function draw() {
	mainTimer++;	
	if (mainTimer <= defaultTimer) {
		dots[reDot].x = mouse.x;
		dots[reDot].y = mouse.y;
		dots[reDot].size = defaultSize;
		reDot++;
		if(reDot >= dots.length){
			reDot = 0;
		}
		mainTimer = 0;
	}
	for (let i = 0; i < dots.length; i++) {
		dots[i].size -= .6;
		dots[i].node.style.height = dots[i].size + 'px';
		dots[i].node.style.width = dots[i].size + 'px';
		dots[i].draw();
	}	
}

addEventListener("mousemove", function (event) {
	mouse.x = event.pageX;
	mouse.y = event.pageY;
});

function animate() {
	draw();
	requestAnimationFrame(animate);
}
animate();
