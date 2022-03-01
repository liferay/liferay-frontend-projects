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
		this.responseHead = {
			'Content-Type': 'application/json',
		};

		this.handleStatusRequest = (req, res) => {
			if (req.url === '/status' && req.method === 'GET') {
				res.writeHead(200, this.responseHead);
				res.write('The server is running!');
				res.end();
			}
			else {
				res.writeHead(404, this.responseHead);
				res.end(JSON.stringify({message: 'Route not found'}));
			}
		};

		this.middleware = createNodeMiddleware(this.webhooks, {
			onUnhandledRequest: (req, res) =>
				this.handleStatusRequest(req, res),
		});
	}

	start(events, onEvent) {
		http.createServer(this.middleware).listen(this.port);

		events.forEach((event) => {
			this.webhooks.on(event, onEvent);
		});
	}
}

module.exports = Server;
