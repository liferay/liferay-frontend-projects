/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import isNodeCoreModule from '../isNodeCoreModule';

it('isNodeCoreModule() works', () => {
	expect(isNodeCoreModule('fs')).toBe(true);
	expect(isNodeCoreModule('path')).toBe(true);
	expect(isNodeCoreModule('process')).toBe(true);
	expect(isNodeCoreModule('http')).toBe(true);

	expect(isNodeCoreModule('./a-module')).toBe(false);
	expect(isNodeCoreModule('../a-module')).toBe(false);
	expect(isNodeCoreModule('/a-module')).toBe(false);
	expect(isNodeCoreModule('a-module')).toBe(false);
});
