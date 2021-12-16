/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {getUserMapping} = require('../config/config');
const JiraClient = require('../jira/JiraClient');
const {JIRA_STATUS, JIRA_TRANSITIONS} = require('../jira/jiraTransitions');
const getOrCreateIssue = require('../utils/getOrCreateIssue');
const log = require('../utils/log');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issues' && payload.action === 'assigned';
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await getOrCreateIssue(issue);

		const [assignee = {}] = issue.assignees;

		log(
			`Assigning issue ${jiraIssue.key} to ${getUserMapping(
				assignee.login
			)}`
		);

		try {
			await jiraClient.updateIssue({
				assignee: getUserMapping(assignee.login),
				issueId: jiraIssue.key,
			});
		}
		catch (_error) {
			log(`Cannot assign issue to${getUserMapping(assignee.login)}`);
		}

		const jiraStatusName = jiraIssue.fields.status.name;

		log(`Transitioning issue ${jiraIssue.key} to in-progress`);

		if (jiraStatusName === JIRA_STATUS.inProgress) {
			return;
		}

		if (jiraStatusName === JIRA_STATUS.closed) {
			await jiraClient.transitionIssue({
				issueId: jiraIssue.key,
				transition: JIRA_TRANSITIONS.reopen,
			});

			// Let jira process the previous transition before doing the next one

			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		return jiraClient.transitionIssue({
			issueId: jiraIssue.key,
			transition: JIRA_TRANSITIONS.startProgress,
		});
	},
};
