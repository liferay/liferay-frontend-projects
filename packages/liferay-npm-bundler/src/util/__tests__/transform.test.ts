/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {wrapModule} from '../transform';

describe('wrapModule', () => {
	const moduleName = 'a/module/name';

	it('wraps module without dependencies', async () => {
		const sourceCode = `
		console.log('Hello world');
		`;

		expect(await wrapModule(moduleName, sourceCode)).toMatchSnapshot();
	});

	it('wraps module with dependencies', async () => {
		const sourceCode = `
		var a = require('a/dependency');
		var another = require('another/dependency');

		console.log('Hello world');
		`;

		expect(await wrapModule(moduleName, sourceCode)).toMatchSnapshot();
	});
});
