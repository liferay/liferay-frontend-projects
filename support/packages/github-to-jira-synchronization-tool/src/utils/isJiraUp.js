/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const JiraClient = require('../jira/JiraClient');

module.exports = async function isJiraUp() {
	const jiraClient = new JiraClient();

	try {

		// Checking an arbitrary issue

		await jiraClient.getIssue({issueId: 'IFI-2759'});

		return true;
	}
	catch (_error) {
		return false;
	}
};
