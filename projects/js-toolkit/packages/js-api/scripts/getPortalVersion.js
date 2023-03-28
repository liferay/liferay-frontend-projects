/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const capture = require('./capture');
const isPortalDir = require('./isPortalDir');

module.exports = async function getPortalVersion(portalTagOrDir) {
	if (isPortalDir(portalTagOrDir)) {
		return await capture('git rev-parse HEAD', {cwd: portalTagOrDir});
	}
	else {
		return portalTagOrDir;
	}
};
