/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');
const getOrCreateIssue = require('../utils/getOrCreateIssue');
const log = require('../utils/log');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'edited';
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await getOrCreateIssue(issue);

		log(`Updating jira issue ${jiraIssue.key}`);

		const options = {
			description: issue.body || '',
			title: issue.title,
		};

		return jiraClient.updateIssue({issueId: jiraIssue.key, ...options});
	},
};
