/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');
const {addGithubIssueToBody} = require('../jira/github-jira-mapping');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issue_comment' && payload.action === 'edited';
	},

	async handleEvent({comment, issue}) {
		const jiraClient = new JiraClient();

		const {
			comment: jiraComment,
			issueId,
		} = await jiraClient.searchCommentWithGithubCommentId({
			githubCommentId: comment.html_url,
			githubIssueId: issue.html_url,
		});

		return await jiraClient.updateComment({
			comment: addGithubIssueToBody(comment.html_url, comment.body),
			commentId: jiraComment.id,
			issueId,
		});
	},
};
