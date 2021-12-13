/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Server = require('./Server');
const {loadConfig} = require('./config/config');
const {PORT, SECRET} = require('./constants');
const log = require('./utils/log');

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
				log(
					`Handling event ${name} ${payload.action} for issue: ${payload.issue?.html_url}`
				);
				try {
					await eventHandler.handleEvent(payload);
				} catch (error) {
					log(
						`Error while processing ${name} ${payload.action} webhook: ${error.message}`
					);
				}
			}
		}
	});
}

module.exports = main;
