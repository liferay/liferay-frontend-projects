/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {negate, prefix} from '../globs';

it('negate works', () => {
	const globs = ['**/*', '!index.js'];

	expect(negate(globs)).toEqual(['!**/*', 'index.js']);
});

it('prefix works', () => {
	const globs = ['**/*', '!index.js'];

	expect(prefix('dir/', globs)).toEqual(['dir/**/*', '!dir/index.js']);
});
