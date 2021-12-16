/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');
const {JIRA_STATUS, JIRA_TRANSITIONS} = require('../jira/jiraTransitions');
const getOrCreateIssue = require('../utils/getOrCreateIssue');
const log = require('../utils/log');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'closed';
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await getOrCreateIssue(issue);

		const jiraStatusNames = jiraIssue.fields.status.name;

		log(`Transitioning issue ${jiraIssue.key} to close`);

		if (jiraStatusNames !== JIRA_STATUS.closed) {
			return await jiraClient.transitionIssue({
				issueId: jiraIssue.key,
				transition: JIRA_TRANSITIONS.close,
			});
		}
	},
};
