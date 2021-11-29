/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {getUserMapping} = require('../config/config');
const JiraClient = require('../jira/JiraClient');
const {JIRA_STATUS, JIRA_TRANSITIONS} = require('../jira/jiraTransitions');

module.exports = {
	canHandleEvent(name, payload) {
		return (
			name === 'issues' &&
			(payload.action === 'assigned' || payload.action === 'unassigned')
		);
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await jiraClient.searchIssueWithGithubIssueId({
			fields: ['status'],
			githubIssueId: issue.html_url,
		});

		const [assignee = {}] = issue.assignees;

		await jiraClient.updateIssue({
			assignee: getUserMapping(assignee.login),
			issueId: jiraIssue.key,
		});

		const jiraStatusNames = jiraIssue.fields.status.name;

		if (assignee.login && jiraStatusNames !== JIRA_STATUS.inProgress) {
			return jiraClient.transitionIssue({
				issueId: jiraIssue.key,
				transition: JIRA_TRANSITIONS.startProgress,
			});
		}
		else if (
			jiraStatusNames !== JIRA_STATUS.open &&
			jiraStatusNames !== JIRA_STATUS.onHold
		) {
			return jiraClient.transitionIssue({
				issueId: jiraIssue.key,
				transition: JIRA_TRANSITIONS.reopen,
			});
		}
	},
};
