/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Server = require('./Server');
const {loadConfig} = require('./config/config');
const {PORT, SECRET} = require('./constants');
const JiraRetryHandler = require('./jira/JiraRetryHandler');
const log = require('./utils/log');
const runSequentially = require('./utils/runSequentially');

const jiraRetryHandler = new JiraRetryHandler();

const eventHandlers = [
	require('./event-handlers/issueAssignedHandler'),
	require('./event-handlers/issueClosedHandler'),
	require('./event-handlers/issueCreatedHandler'),
	require('./event-handlers/issueEditedHandler'),
	require('./event-handlers/issueLabeledHandler'),
	require('./event-handlers/issueMilestonedHandler'),
	require('./event-handlers/issueReopenedHandler'),
	require('./event-handlers/issueUnassignedHandler'),
	require('./event-handlers/issueCommentCreatedHandler'),
	require('./event-handlers/issueCommentEditedHandler'),
	require('./event-handlers/issueCommentDeletedHandler'),
];

async function main() {
	loadConfig();

	const server = new Server(SECRET, PORT);

	server.start(['issues', 'issue_comment'], async ({name, payload}) => {

		// Don't handle comments in pull requests

		if (name === 'issue_comment' && payload.issue?.pull_request) {
			return;
		}

		handleWebhook(name, payload);
	});

	jiraRetryHandler.start((name, payload) => handleWebhook(name, payload));
}

function handleWebhook(name, payload) {
	for (const eventHandler of eventHandlers) {
		if (eventHandler.canHandleEvent(name, payload)) {
			runSequentially(async () => {
				log(
					`Handling event ${name} ${payload.action} for issue: ${payload.issue?.html_url}`
				);
				try {
					await eventHandler.handleEvent(payload);
				}
				catch (error) {
					if (jiraRetryHandler.shouldRetry(error)) {
						await jiraRetryHandler.addPendingWebhook(name, payload);
					}

					log(
						`Error while processing ${name} ${payload.action} webhook: ${error.message}`
					);
				}
			});
		}
	}
}

module.exports = main;
