/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import main from '../liferay-npm-bridge-generator';

describe('blinking light demo', () => {
	it('exists', () => {
		expect(typeof main).toBe('function');
	});
});
