/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');
const {addGithubIssueToBody} = require('../jira/github-jira-mapping');
const getOrCreateComment = require('../utils/getOrCreateComment');
const log = require('../utils/log');

module.exports = {
	canHandleEvent(name, payload) {
		return name === 'issue_comment' && payload.action === 'edited';
	},

	async handleEvent({comment, issue}) {
		const jiraClient = new JiraClient();

		const {comment: jiraComment, issueId} = await getOrCreateComment({
			comment,
			issue,
		});

		const commentBody = `
		 ${comment?.user?.login} commented

		 {quote}
		 	${comment.body}
		 {quote}
		`;

		log(`Editing comment ${jiraComment.id}`);

		return await jiraClient.updateComment({
			comment: addGithubIssueToBody(comment.html_url, commentBody),
			commentId: jiraComment.id,
			issueId,
		});
	},
};
