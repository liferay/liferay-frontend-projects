/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {Webhooks, createNodeMiddleware} = require('@octokit/webhooks');
const http = require('http');

class Server {
	constructor(secret, port) {
		this.port = port;
		this.webhooks = new Webhooks({secret});
	}

	start(events, onEvent) {
		http.createServer(createNodeMiddleware(this.webhooks)).listen(
			this.port
		);

		events.forEach((event) => {
			this.webhooks.on(event, onEvent);
		});
	}
}

module.exports = Server;
