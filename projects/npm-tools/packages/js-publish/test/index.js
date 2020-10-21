/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {isPrereleaseVersion} = require('../src');

describe('isPrereleaseVersion()', () => {
	it('returns true when there is a hyphen in the version number', () => {
		expect(isPrereleaseVersion({version: '1.0.0-pre.0'})).toBe(true);
	});

	it('returns false when there is no hyphen in the version number', () => {
		expect(isPrereleaseVersion({version: '1.0.0'})).toBe(false);
	});
});
