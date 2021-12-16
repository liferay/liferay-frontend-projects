/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');
const {addGithubIssueToBody} = require('../jira/github-jira-mapping');
const getOrCreateIssue = require('./getOrCreateIssue');

module.exports = async function getOrCreateComment({comment, issue}) {
	const jiraClient = new JiraClient();

	const jiraIssue = await getOrCreateIssue(issue);

	const jiraComment = await jiraClient.searchCommentWithGithubCommentId({
		githubCommentId: comment.html_url,
		issueId: jiraIssue.key,
	});

	if (jiraComment) {
		return {comment: jiraComment, issueId: jiraIssue.key};
	}

	const commentBody = `
		 ${comment?.user?.login} commented

		 {quote}
		 	${comment.body}
		 {quote}
		`;

	const newJiraComment = await jiraClient.createComment({
		comment: addGithubIssueToBody(comment.html_url, commentBody),
		issueId: jiraIssue.key,
	});

	return {
		comment: newJiraComment,
		issueId: jiraIssue.key,
	};
};
