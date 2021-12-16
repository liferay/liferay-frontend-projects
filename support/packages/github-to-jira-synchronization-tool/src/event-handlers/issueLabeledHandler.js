/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {getDefaultLabelMapping, getLabelMapping} = require('../config/config');
const JiraClient = require('../jira/JiraClient');
const getOrCreateIssue = require('../utils/getOrCreateIssue');
const log = require('../utils/log');

module.exports = {
	canHandleEvent(name, payload) {
		return (
			name === 'issues' &&
			(payload.action === 'labeled' || payload.action === 'unlabeled')
		);
	},

	async handleEvent({issue}) {
		const jiraClient = new JiraClient();

		const jiraIssue = await getOrCreateIssue(issue);

		let type = getDefaultLabelMapping();

		for (const label of issue.labels ?? []) {
			if (getLabelMapping(label.name)) {
				type = getLabelMapping(label.name);

				break;
			}
		}

		log(`Updating jira issue ${jiraIssue?.key} to type ${type}`);

		if (jiraIssue.fields?.issueType !== type) {
			return jiraClient.updateIssue({
				issueId: jiraIssue.key,
				type: type || getDefaultLabelMapping(),
			});
		}
	},
};
