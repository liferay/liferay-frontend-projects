/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Server = require('./Server');
const {loadConfig} = require('./config/config');
const {PORT, SECRET} = require('./constants');

const eventHandlers = [
	require('./event-handlers/issueAssignedHandler'),
	require('./event-handlers/issueClosedHandler'),
	require('./event-handlers/issueCreatedHandler'),
	require('./event-handlers/issueEditedHandler'),
	require('./event-handlers/issueLabeledHandler'),
	require('./event-handlers/issueMilestonedHandler'),
	require('./event-handlers/issueReopenedHandler'),
	require('./event-handlers/issueCommentCreatedHandler'),
	require('./event-handlers/issueCommentEditedHandler'),
	require('./event-handlers/issueCommentDeletedHandler'),
];

async function main() {
	loadConfig();

	const server = new Server(SECRET, PORT);

	server.start(['issues', 'issue_comment'], async ({name, payload}) => {
		for (const eventHandler of eventHandlers) {
			if (eventHandler.canHandleEvent(name, payload)) {
				try {
					await eventHandler.handleEvent(payload);
				}
				catch (error) {
					console.error(
						`Error while processing ${name} ${payload.action} webhook\n\n${error.message}`
					);
				}
			}
		}
	});
}

module.exports = main;
