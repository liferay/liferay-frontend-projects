/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

describe('blinking light demo', () => {
	it('exists', () => {
		expect(
			fs.existsSync(path.join(__dirname, '../../support/checkLinks.js'))
		).toBe(true);
	});
});
