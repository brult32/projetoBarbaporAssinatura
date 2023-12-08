var dots = [],
	mouse = {
		x: 0,
		y: 0
	};
let mainTimer = 0,
	defaultTimer = 1,
	reDot = 0,
	defaultSize = 12;
// let color = ['#1E90FF', '#45A6FF', '#6CBCFF', '#92D3FF', '#B9E9FF', '#E0FFFF'];
// let color = ['#E0FFFF', '#B9E9FF', '#92D3FF', '#6CBCFF', '#45A6FF', '#1E90FF'];
let color = ['#2F99FF', '#53AEFD', '#70BEFE', '#9DD9FE', '#B0E2FD', '#D0F5FE'];

class Dot {
	constructor() {
		this.x = mouse.x;
		this.y = mouse.y;
		this.size = defaultSize;
		this.node = (function () {
			var n = document.createElement("div");
			n.className = "trail";
			// n.style.height = defaultSize + 'px';
			// n.style.width = defaultSize + 'px';
			n.style.borderRadius = '10px';
			n.style.zIndex = 1;
			document.body.appendChild(n);
			return n;
		} ());
	}
	draw() {
		this.node.style.left = this.x + "px";
		this.node.style.top = this.y + "px";
	}
}

for (var i = 0; i < 24; i++) {
	var d = new Dot();
	dots.push(d);
}

function draw() {
	mainTimer++;
	if (mainTimer >= defaultTimer) {
		dots[reDot].x = mouse.x;
		dots[reDot].y = mouse.y + 4;
		dots[reDot].size = defaultSize;
		reDot++;
		if(reDot >= dots.length){
			reDot = 0;
		}
		mainTimer = 0;
	}
	for (let i = 0; i < dots.length; i++) {
		dots[i].size -= .6;
		dots[i].node.style.background = color[Math.floor(dots[i].size/2)];
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
