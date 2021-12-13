/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');
const {addGithubIssueToBody} = require('../jira/github-jira-mapping');
const getOrCreateIssue = require('../utils/getOrCreateIssue');
const log = require('../utils/log');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issue_comment' && payload.action === 'created';
	},

	async handleEvent({comment, issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await getOrCreateIssue(issue);

		const commentBody = `
		 ${issue?.user?.login} commented

		 {quote}
		 	${comment.body}
		 {quote}
		`;

		log(`Creating comment for issue ${jiraIssue.key}`);

		return await jiraClient.createComment({
			comment: addGithubIssueToBody(comment.html_url, commentBody),
			issueId: jiraIssue.key,
		});
	},
};
