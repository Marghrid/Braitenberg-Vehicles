function draw() {
	env.draw();
	window.requestAnimationFrame(draw);
}
function apply_rotation(x, y, angle) {
	return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
}
function add_pos(pos1, pos2) {
	return [pos1[0] + pos2[0], pos1[1] + pos2[1]];
}

function get_random_int(max) {
	return Math.floor(Math.random() * max);
}

function euclidean_distance(p, q) {
	let a = p[0] - q[0];
	let b = p[1] - q[1];
	return Math.sqrt(a * a + b * b);
}

function keep_inside(pos, width, height) {
	return [(width + pos[0]) % width, (height + pos[1]) % height]
}