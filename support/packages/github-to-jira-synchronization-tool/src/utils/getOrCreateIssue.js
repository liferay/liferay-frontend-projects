/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');

module.exports = async function getOrCreateIssue(issue) {
	const jiraClient = new JiraClient();

	const jiraIssue = await jiraClient.searchIssueWithGithubIssueId({
		githubIssueId: issue.html_url,
	});

	if (jiraIssue) {
		return jiraIssue;
	}

	const a = await jiraClient.createIssue({
		description: issue.body || '',
		githubIssueId: issue.html_url,
		title: issue.title,
	});

	return a;
};
