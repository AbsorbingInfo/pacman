const canvas = document.getElementsByTagName('canvas')[0];
canvas.width = innerWidth;
canvas.height = innerHeight;
const c = canvas.getContext('2d');

class Boundary {
	static width = 40;
	static height = 40;
	constructor({ position }) {
		this.position = position;
		this.width = 40;
		this.height = 40;
	}
	draw() {
		c.fillStyle = 'deeppink';
		c.fillRect(this.position.x, this.position.y, this.width, this.height);
	}
}
class Player {
	static radius = 15;
	constructor({ position, velocity }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = 15;
	}
	draw() {
		c.beginPath();
		c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
		c.fillStyle = 'yellow';
		c.fill();
		c.closePath();
	}
	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

const layout = [
	[1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1],
];

const player = new Player({
	position: {
		x: Boundary.width + Boundary.width / 2,
		y: Boundary.height + Boundary.height / 2,
	},
	velocity: {
		x: 0,
		y: 0,
	},
});

const keys = {
	w: {
		pressed: false,
	},
	a: {
		pressed: false,
	},
	s: {
		pressed: false,
	},
	d: {
		pressed: false,
	},
};
let lastPressedKey = '';
const boundaryBlocks = [];
layout.forEach((row, rowIdx) => {
	row.forEach((column, columnIdx) => {
		if (column === 0) return;
		const boundaryBlock = new Boundary({
			position: {
				x: columnIdx * Boundary.width,
				y: rowIdx * Boundary.height,
			},
		});
		boundaryBlocks.push(boundaryBlock);
	});
});

function isColliding(circle, boundaryBlock) {
	return (
		circle.position.x + circle.radius + circle.velocity.x >=
			boundaryBlock.position.x &&
		circle.position.x - circle.radius + circle.velocity.x <=
			boundaryBlock.position.x + boundaryBlock.width &&
		circle.position.y + circle.radius + circle.velocity.y >=
			boundaryBlock.position.y &&
		circle.position.y - circle.radius + circle.velocity.y <=
			boundaryBlock.position.y + boundaryBlock.height
	);
}

function animate() {
	requestAnimationFrame(animate);
	c.clearRect(0, 0, canvas.width, canvas.height);
	if (keys.w.pressed && lastPressedKey === 'w') {
		for (let i = 0; i < boundaryBlocks.length; i++) {
			const boundaryBlock = boundaryBlocks[i];
			if (
				isColliding(
					{
						...player,
						velocity: {
							x: 0,
							y: -5,
						},
					},
					boundaryBlock,
				)
			) {
				player.velocity.y = 0;
				break;
			} else {
				player.velocity.y = -5;
			}
		}
	} else if (keys.a.pressed && lastPressedKey === 'a') {
		for (let i = 0; i < boundaryBlocks.length; i++) {
			const boundaryBlock = boundaryBlocks[i];
			if (
				isColliding(
					{
						...player,
						velocity: {
							x: -5,
							y: 0,
						},
					},
					boundaryBlock,
				)
			) {
				player.velocity.x = 0;
				break;
			} else {
				player.velocity.x = -5;
			}
		}
	} else if (keys.s.pressed && lastPressedKey === 's') {
		for (let i = 0; i < boundaryBlocks.length; i++) {
			const boundaryBlock = boundaryBlocks[i];
			if (
				isColliding(
					{
						...player,
						velocity: {
							x: 0,
							y: 5,
						},
					},
					boundaryBlock,
				)
			) {
				player.velocity.y = 0;
				break;
			} else {
				player.velocity.y = 5;
			}
		}
	} else if (keys.d.pressed && lastPressedKey === 'd') {
		for (let i = 0; i < boundaryBlocks.length; i++) {
			const boundaryBlock = boundaryBlocks[i];
			if (
				isColliding(
					{
						...player,
						velocity: {
							x: 5,
							y: 0,
						},
					},
					boundaryBlock,
				)
			) {
				player.velocity.x = 0;
				break;
			} else {
				player.velocity.x = 5;
			}
		}
	}

	boundaryBlocks.forEach((block) => {
		block.draw();
		// collusion detection
		if (isColliding(player, block)) {
			player.velocity.x = 0;
			player.velocity.y = 0;
		}
	});
	player.update();
}

animate();

addEventListener('keydown', ({ key }) => {
	switch (key) {
		case 'w':
			keys.w.pressed = true;
			lastPressedKey = 'w';
			break;
		case 'a':
			keys.a.pressed = true;
			lastPressedKey = 'a';
			break;
		case 's':
			keys.s.pressed = true;
			lastPressedKey = 's';
			break;
		case 'd':
			keys.d.pressed = true;
			lastPressedKey = 'd';
			break;
	}
});

addEventListener('keyup', ({ key }) => {
	switch (key) {
		case 'w':
			keys.w.pressed = false;
			break;
		case 'a':
			keys.a.pressed = false;
			break;
		case 's':
			keys.s.pressed = false;
			break;
		case 'd':
			keys.d.pressed = false;
			break;
	}
});
