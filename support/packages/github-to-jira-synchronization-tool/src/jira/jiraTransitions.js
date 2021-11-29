/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * Transition ids and fields needed for the Jira API
 */
const JIRA_TRANSITIONS = {
	close: {
		fields: {
			resolution: {
				name: 'Completed',
			},
		},
		transition: {
			id: 31,
		},
	},
	reopen: {
		transition: {
			id: 41,
		},
	},
	startProgress: {
		transition: {
			id: 51,
		},
	},
};

const JIRA_STATUS = {
	closed: 'Closed',
	inProgress: 'In Progress',
	onHold: 'On Hold',
	open: 'Open',
};

module.exports = {JIRA_STATUS, JIRA_TRANSITIONS};
