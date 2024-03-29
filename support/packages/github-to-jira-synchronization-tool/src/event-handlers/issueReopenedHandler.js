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
		return name === 'issues' && payload.action === 'reopened';
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await getOrCreateIssue(issue);

		const jiraStatusNames = jiraIssue.fields.status.name;

		log(`Transition issue ${jiraIssue.key} to open`);

		if (jiraStatusNames !== JIRA_STATUS.open) {
			return await jiraClient.transitionIssue({
				issueId: jiraIssue.key,
				transition: JIRA_TRANSITIONS.reopen,
			});
		}
	},
};
