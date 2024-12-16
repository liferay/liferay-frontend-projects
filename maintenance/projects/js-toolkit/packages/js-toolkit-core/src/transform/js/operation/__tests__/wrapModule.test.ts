/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {generate} from 'escodegen';

import wrapModule from '../wrapModule';

describe('wrapModule', () => {
	it('wraps module without dependencies', async () => {
		const code = `
			console.log('Hello world');
		`;

		const wrapped = await wrapModule('a/module/name')({
			code,
		});

		expect(generate(wrapped.ast)).toBe(
			[
				`Liferay.Loader.define('a/module/name', [`,
				`    'module',`,
				`    'require'`,
				`], function (module, require) {`,
				`    console.log('Hello world');`,
				`});`,
			].join('\n')
		);
	});

	it('wraps module with dependencies', async () => {
		const code = `
			var a = require('a/dependency');
			var another = require('another/dependency');

			console.log('Hello world');
		`;

		const wrapped = await wrapModule('a/module/name')({
			code,
		});

		expect(generate(wrapped.ast)).toBe(
			[
				`Liferay.Loader.define('a/module/name', [`,
				`    'module',`,
				`    'require',`,
				`    'a/dependency',`,
				`    'another/dependency'`,
				`], function (module, require) {`,
				`    var a = require('a/dependency');`,
				`    var another = require('another/dependency');`,
				`    console.log('Hello world');`,
				`});`,
			].join('\n')
		);
	});
});
