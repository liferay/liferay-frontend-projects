/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Jira = require('jira-client');

const {PASSWORD, PROJECT, USERNAME} = require('./constants');

class JiraClient {
	constructor() {
		this.client = new Jira({
			apiVersion: '2',
			host: 'issues.liferay.com',
			password: PASSWORD,
			protocol: 'https',
			strictSSL: true,
			username: USERNAME,
		});
	}

	createIssue({assignee, description, milestone, title, type = 'Task'}) {
		return this.client.addNewIssue({
			fields: {
				assignee: {
					name: assignee,
				},
				customfield_12821: milestone,
				description,
				issuetype: {
					name: type,
				},
				project: {
					key: PROJECT,
				},
				summary: title,
			},
		});
	}
}

module.exports = JiraClient;
