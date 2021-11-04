/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../JiraClient');

const issueCreatedHandler = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'opened';
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		return jiraClient.createIssue({
			description: issue.body,
			title: issue.title,
		});
	},
};

module.exports = issueCreatedHandler;
