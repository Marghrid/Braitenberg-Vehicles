class Environment {
	constructor(size) {
		this.size = size;
		this.agent_colour = "#fff3c7";
		this.background_color = "#01324d";
		this.source_color = "#40b6ff"; // #00c479
		this.sources = []
		this.agent_pos = [this.size / 2, this.size / 2];
		this.agent_rot = 0;
		this.slow_factor = 0.98;
		this.speed = 3;
	}

	draw() {
		const ctx = document.getElementById("canvas").getContext("2d");

		// Clear current cavas:
		ctx.clearRect(0, 0, this.size, this.size);
		ctx.fillStyle = this.background_color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Update time:
		const new_time = new Date().getTime();
		let elapsed = (new_time - this.last_time) / 10;
		this.update(elapsed);
		this.last_time = new_time;

		this.draw_source(ctx);
		this.draw_agent(ctx);

	}

	draw_agent(ctx) {

		// Compute corners' positions.
		let left_bound = -this.size / 128;
		let right_bound = this.size / 128;
		let top_bound = -this.size / 64;
		let bottom_bound = this.size / 64;

		let top_left_corner = add_pos(this.agent_pos, apply_rotation(left_bound, top_bound, this.agent_rot));
		let top_right_corner = add_pos(this.agent_pos, apply_rotation(right_bound, top_bound, this.agent_rot));
		let bottom_left_corner = add_pos(this.agent_pos, apply_rotation(left_bound, bottom_bound, this.agent_rot));
		let bottom_right_corner = add_pos(this.agent_pos, apply_rotation(right_bound, bottom_bound, this.agent_rot));

		// Draw:
		ctx.beginPath();
		ctx.moveTo(this.agent_pos[0], this.agent_pos[1]);
		ctx.lineTo(bottom_right_corner[0], bottom_right_corner[1]);
		ctx.lineTo(bottom_left_corner[0], bottom_left_corner[1]);
		ctx.lineTo(top_right_corner[0], top_right_corner[1]);
		ctx.lineTo(top_left_corner[0], top_left_corner[1]);
		ctx.fillStyle = this.agent_colour;
		ctx.fill();
		ctx.fillStyle = this.background_color;
	}

	draw_source(ctx) {
		let source_radius = 75

		let x = this.size / 2;
		let y = this.size / 2;

		let gradient = ctx.createRadialGradient(x, y, 0, x, y, source_radius);
		gradient.addColorStop(0, this.source_color);
		gradient.addColorStop(1, this.background_color);

		ctx.arc(x, y, source_radius, 0, 2 * Math.PI);

		ctx.fillStyle = gradient;
		ctx.fill();
	}

	update(elapsed) {
		if (!isNaN(elapsed)) {
			let delta_x = elapsed * this.speed
			this.agent_pos = add_pos(this.agent_pos, apply_rotation(delta_x, 0, this.agent_rot));
		}
		this.speed *= this.slow_factor;

	}

	visible(p, q) {
		for (let obs of this.obstacles) {
			if (intersect_polygon([p, q], obs).length > 0)
				return false;
			if (inside_polygon([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], obs))
				return false;
		}
		return true;
	}
}
