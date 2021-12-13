/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');
const {addGithubIssueToBody} = require('../jira/github-jira-mapping');
const log = require('../utils/log');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issue_comment' && payload.action === 'deleted';
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

		log(`Deleting comment ${jiraComment.id}`);

		return await jiraClient.deleteComment({
			comment: addGithubIssueToBody(comment.html_url, comment.body),
			commentId: jiraComment.id,
			issueId,
		});
	},
};
