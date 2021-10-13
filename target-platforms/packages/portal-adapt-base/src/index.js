/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {clean, deploy} = require('@liferay/portal-base');

module.exports = {
	build: require('./build'),
	clean,
	deploy,
};
