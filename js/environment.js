class Environment {

	init_agents() {
		for (let i = 0; i < 7; ++i) {
			let agent_pos = [getRandomInt(this.width + 1), getRandomInt(this.height + 1)];
			let agent_rot = Math.random() * 2 * Math.PI;
			let agent_color = this.agents_colors[i % this.agents_colors.length]
			this.agents.push([agent_pos, agent_rot, agent_color]);
		}
	}

	init_sources() {
		for (let i = 0; i < (this.width * this.height / 2 ** 17); ++i) {
			let min_radius = this.width / 9;
			let max_radius = this.width / 8;
			let source_radius = getRandomInt(max_radius - min_radius) + min_radius;
			let source_pos = [getRandomInt(this.width + 1 - source_radius * 2) + source_radius,
			getRandomInt(this.height + 1 - source_radius * 2) + source_radius];
			this.sources.push([source_pos, source_radius]);
		}
	}

	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.background_color = "rgba(5,20,30,1)"; // "#01324d";
		this.agents_colors = ["#fcc3ae", "#fce9ae", "#aefcb2", "#9df7fa", "#b1bcfc", "#ddb6fc", "#fcb6d3"];
		this.sources_color = "#40b6ff"; // #00c479
		this.sources = [];
		this.agents = [];
		this.friction = 0; // friction.
		this.agents_base_speed = 0;
		this.agents_width = (this.width + this.height) / 128
		this.agents_height = (this.width + this.height) / 64

		this.init_agents();
		this.init_sources();
	}

	draw() {
		const ctx = document.getElementById("canvas").getContext("2d");

		// Clear current cavas:
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.fillStyle = this.background_color;
		// ctx.globalAlpha = 0.7;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// ctx.globalAlpha = 1;

		// Update time:
		const new_time = new Date().getTime();
		let elapsed = (new_time - this.last_time) / 10;
		this.update(elapsed);
		this.last_time = new_time;

		this.sources.forEach(source => this.draw_source(ctx, source[0], source[1]));
		this.agents.forEach(agent => this.draw_agent(ctx, agent[0], agent[1], agent[2]));
	}

	draw_agent(ctx, agent_pos, agent_rot, agent_color) {
		// Compute corners' positions.
		let left_bound = -this.agents_width / 2;
		let right_bound = this.agents_width / 2;
		let top_bound = -this.agents_height / 2;
		let bottom_bound = this.agents_height / 2;

		let top_left_corner = add_pos(agent_pos, apply_rotation(left_bound, top_bound, agent_rot));
		let top_right_corner = add_pos(agent_pos, apply_rotation(right_bound, top_bound, agent_rot));
		let bottom_left_corner = add_pos(agent_pos, apply_rotation(left_bound, bottom_bound, agent_rot));
		let bottom_right_corner = add_pos(agent_pos, apply_rotation(right_bound, bottom_bound, agent_rot));

		// Draw:
		ctx.moveTo(agent_pos[0], agent_pos[1]);
		ctx.beginPath();
		ctx.lineTo(bottom_right_corner[0], bottom_right_corner[1]);
		ctx.lineTo(bottom_left_corner[0], bottom_left_corner[1]);
		ctx.lineTo(top_right_corner[0], top_right_corner[1]);
		ctx.lineTo(top_left_corner[0], top_left_corner[1]);
		ctx.closePath();
		ctx.fillStyle = agent_color;
		ctx.fill();
		// ctx.fillStyle = this.background_color;
	}

	draw_source(ctx, source_pos, source_radius) {
		let x = source_pos[0];
		let y = source_pos[1];
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, source_radius);
		gradient.addColorStop(0, 'rgba(85, 182, 255, 1)');
		gradient.addColorStop(.4, 'rgba(64, 182, 255, 0.4)');
		gradient.addColorStop(.6, 'rgba(64, 182, 255, 0.2)');
		gradient.addColorStop(.8, 'rgba(64, 182, 255, 0.05)');
		gradient.addColorStop(1, 'rgba(64, 182, 255, 0)');
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		ctx.fillStyle = gradient;
		ctx.moveTo(x, y);
		ctx.beginPath();
		ctx.arc(x, y, source_radius * 1.2, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	update(elapsed) {
		this.update_agents(elapsed);
		this.update_sources(elapsed);
	}

	update_agents(elapsed) {
		for (let i = 0; i < this.agents.length; ++i) {
			let agent_pos = this.agents[i][0];
			let agent_rot = this.agents[i][1];

			let left_side = add_pos(agent_pos, apply_rotation(-this.agents_width / 2, 0, agent_rot));
			let right_side = add_pos(agent_pos, apply_rotation(this.agents_width / 2, 0, agent_rot));

			let left_distance = 0;
			for (let j = 0; j < this.sources.length; ++j) {
				left_distance += 1 / (euclidean_distance(left_side, this.sources[j][0]));
			}

			let right_distance = 0;
			for (let j = 0; j < this.sources.length; ++j) {
				right_distance += 1 / (euclidean_distance(right_side, this.sources[j][0]));
			}

			console.assert(left_distance > 0);
			console.assert(right_distance > 0);

			// The force dictates the proportion of movement on each wheel.
			let factor = 65; // How much of the speed is dictated by the distance to light
			let delta_left = factor * left_distance;
			let delta_right = factor * right_distance;

			let theta = 1 * elapsed * (right_distance - left_distance) / this.agents_width;

			if (!isNaN(elapsed)) {
				let delta_x = elapsed * (this.agents_base_speed + (delta_left + delta_right) / 2);
				this.agents[i][0] = add_pos(agent_pos, apply_rotation(delta_x, 0, this.agents[i][1]));
				this.agents[i][0] = keep_inside(this.agents[i][0], this.width, this.height)
				this.agents[i][1] += theta; // Rotate agent
			}
		}
		this.agents_base_speed *= 1 - this.friction;
	}

	update_sources(elapsed) {
		for (let i = 0; i < this.sources.length; ++i) {
			let source_pos = this.sources[i][0];
			let source_radius = this.sources[i][1];
			let source_rot = (source_radius * 10) % (2 * Math.PI);
			let source_speed = 25 / source_radius

			if (!isNaN(elapsed)) {
				let delta_x = elapsed * source_speed;
				this.sources[i][0] = add_pos(source_pos, apply_rotation(delta_x, 0, source_rot));
				this.sources[i][0] = keep_inside(this.sources[i][0], this.width, this.height)
			}
		}
	}
}
