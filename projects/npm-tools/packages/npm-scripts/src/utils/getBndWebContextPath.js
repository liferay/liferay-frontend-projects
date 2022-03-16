/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

function getBndWebContextPath() {
	const bndFile = path.resolve('bnd.bnd');

	if (fs.existsSync(bndFile)) {
		const bnd = fs.readFileSync(bndFile, 'utf8');

		const lines = bnd.split('\n');

		const webContextPathLine = lines.find((line) =>
			line.startsWith('Web-ContextPath:')
		);

		if (webContextPathLine !== undefined) {
			return webContextPathLine.substring(16).trim();
		}
	}

	return undefined;
}

module.exports = getBndWebContextPath;
