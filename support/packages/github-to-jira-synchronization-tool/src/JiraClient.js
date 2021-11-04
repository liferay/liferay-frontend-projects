/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Jira = require('jira-client');

const PROJECT = process.env.PROJECT || 'IFI';

class JiraClient {
	constructor() {
		this.client = new Jira({
			apiVersion: '2',
			host: 'issues.liferay.com',
			password: process.env.PASSWORD,
			protocol: 'https',
			strictSSL: true,
			username: process.env.USER,
		});
	}

	createIssue({description, title, type = 'Task'}) {
		return this.client.addNewIssue({
			fields: {
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
