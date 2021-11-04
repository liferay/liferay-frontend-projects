/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Server = require('./Server');

const eventHandlers = [require('./event-handlers/issueCreatedHandler')];

function main() {
	const server = new Server(process.env.SECRET, process.env.PORT || 5000);

	server.start(['issues', 'issue_comment'], ({name, payload}) => {
		for (const eventHandler of eventHandlers) {
			if (eventHandler.canHandleEvent(name, payload)) {
				eventHandler.handleEvent(payload);
			}
		}
	});
}

module.exports = main;
