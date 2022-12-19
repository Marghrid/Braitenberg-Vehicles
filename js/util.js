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
