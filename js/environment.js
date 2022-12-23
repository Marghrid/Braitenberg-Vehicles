class Environment {

	init_agents() {
		for (let i = 0; i < 5; ++i) {
			let agent_pos = [getRandomInt(this.size + 1), getRandomInt(this.size + 1)];
			// let agent_pos = [this.size / 2, this.size / 2];
			let agent_rot = Math.random() * 2 * Math.PI;
			// let agent_rot = 0;
			this.agents.push([agent_pos, agent_rot]);
		}
	}

	init_sources() { }

	constructor(size) {
		this.size = size;
		this.background_color = "#01324d";
		this.agents_color = "#fff3c7";
		this.sources_color = "#40b6ff"; // #00c479
		this.sources = []
		this.agents = []
		this.slow_factor = 0.98;
		this.agents_base_speed = 3;

		this.init_agents()
		this.init_sources()

		console.log(this.agents)
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
		this.agents.forEach(agent => this.draw_agent(ctx, agent[0], agent[1]))
	}

	draw_agent(ctx, agent_pos, agent_rot) {

		// Compute corners' positions.
		let left_bound = -this.size / 128;
		let right_bound = this.size / 128;
		let top_bound = -this.size / 64;
		let bottom_bound = this.size / 64;

		let top_left_corner = add_pos(agent_pos, apply_rotation(left_bound, top_bound, agent_rot));
		let top_right_corner = add_pos(agent_pos, apply_rotation(right_bound, top_bound, agent_rot));
		let bottom_left_corner = add_pos(agent_pos, apply_rotation(left_bound, bottom_bound, agent_rot));
		let bottom_right_corner = add_pos(agent_pos, apply_rotation(right_bound, bottom_bound, agent_rot));

		console.log(top_left_corner, top_right_corner, bottom_left_corner, bottom_right_corner)


		// Draw:
		ctx.moveTo(agent_pos[0], agent_pos[1]);
		ctx.beginPath();
		ctx.lineTo(bottom_right_corner[0], bottom_right_corner[1]);
		ctx.lineTo(bottom_left_corner[0], bottom_left_corner[1]);
		ctx.lineTo(top_right_corner[0], top_right_corner[1]);
		ctx.lineTo(top_left_corner[0], top_left_corner[1]);
		ctx.fillStyle = this.agents_color;
		ctx.fill();
		// ctx.fillStyle = this.background_color;
	}

	draw_source(ctx) {
		let source_radius = 75

		let x = this.size / 2;
		let y = this.size / 2;

		let gradient = ctx.createRadialGradient(x, y, 0, x, y, source_radius);
		gradient.addColorStop(0, this.sources_color);
		gradient.addColorStop(1, this.background_color);

		ctx.moveTo(x, y);
		ctx.arc(x, y, source_radius, 0, 2 * Math.PI);

		ctx.fillStyle = gradient;
		ctx.fill();
	}

	update(elapsed) {
		this.update_agents(elapsed);
	}

	update_agents(elapsed) {
		// console.log()
		for (let i = 0; i < this.agents.length; ++i) {
			let agent_pos = this.agents[i][0];
			let agent_rot = this.agents[i][1];
			if (!isNaN(elapsed)) {
				let delta_x = elapsed * this.agents_base_speed;
				this.agents[i][0] = add_pos(agent_pos, apply_rotation(delta_x, 0, agent_rot));
			}
		}
		this.agents_base_speed *= this.slow_factor;
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
