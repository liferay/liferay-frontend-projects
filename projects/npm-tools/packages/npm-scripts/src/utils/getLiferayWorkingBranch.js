/**
 * SPDX-FileCopyrightText: © 2023 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = function getLiferayWorkingBranch() {
	return process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME || 'master';
};
