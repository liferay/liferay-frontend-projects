/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');

/**
 * Checks if the milestone is a valid Jira Epic
 */
module.exports = async function isValidMilestone(milestoneId) {
	if (!milestoneId) {
		return false;
	}

	const jiraClient = new JiraClient();

	try {
		const issue = await jiraClient.getIssue({
			fields: ['issuetype'],
			issueId: milestoneId,
		});

		if (issue?.fields?.issuetype?.name === 'Epic') {
			return true;
		}
	}
	catch (error) {
		return false;
	}

	return false;
};
