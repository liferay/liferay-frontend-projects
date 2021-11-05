/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Server = require('./Server');
const {SECRET, PORT} = require('./constants');

const eventHandlers = [require('./event-handlers/issueCreatedHandler')];

function main() {
	const server = new Server(SECRET, PORT);

	server.start(['issues', 'issue_comment'], ({name, payload}) => {
		for (const eventHandler of eventHandlers) {
			if (eventHandler.canHandleEvent(name, payload)) {
				eventHandler.handleEvent(payload);
			}
		}
	});
}

module.exports = main;
