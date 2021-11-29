/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * Obtain jira milestone id from the github milestone
 */
module.exports = function getJiraMilestoneId(milestoneTitle) {
	const regex = /^(LPS-\d+)|(IFI-\d+)/;

	const [, lps, ifi] = milestoneTitle.match(regex) || [];

	return lps || ifi;
};
