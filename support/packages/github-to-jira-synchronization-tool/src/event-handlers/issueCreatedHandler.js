/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'opened';
	},

	handleEvent({issue}) {
		const jiraClient = new JiraClient();

		return jiraClient.createIssue({
			description: issue.body,
			githubIssueId: issue.html_url,
			title: issue.title,
		});
	},
};
