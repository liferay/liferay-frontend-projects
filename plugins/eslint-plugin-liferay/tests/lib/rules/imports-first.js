/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/imports-first');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

ruleTester.run('imports-first', rule, {
	invalid: [
		{
			code: `
				const ok = require('ok');

				const NAME = 'thing';

				import x from './x';

				require('thing');

				const final = require('./final');
			`,
			errors: [
				{
					message: 'imports must come before other statements',
					type: 'ImportDeclaration',
				},
				{
					message: 'imports must come before other statements',
					type: 'ExpressionStatement',
				},
				{
					message: 'imports must come before other statements',
					type: 'VariableDeclaration',
				},
			],
		},
	],

	valid: [
		{
			code: `
				const z = require('z');

				import x from './x';

				const NAME = 'thing';

				function init() {
					// This require() is fine, because
					// it is not at the top-level.
					require('other')();
				}
			`,
		},
		{
			// Regression test: `MemberExpression` here made us fail to
			// recognize "gulp" as an import.
			//
			// https://github.com/liferay/eslint-config-liferay/issues/94
			code: `
				var del = require('del');
				var fs = require('fs-extra');
				var Gulp = require('gulp').Gulp;
				var os = require('os');
				var path = require('path');
			`,
		},
		{
			// Regression test: Immediate `CallExpression` here made us fail to
			// recognize "gulp-load-plugins" as an import.
			//
			// https://github.com/liferay/eslint-config-liferay/issues/94
			code: `
				const del = require('del');
				const fs = require('fs-extra');
				const _ = require('lodash');
				const path = require('path');
				const plugins = require('gulp-load-plugins')();
				const replace = require('gulp-replace-task');
				const through = require('through2');
				const PluginError = require('plugin-error');
			`,
		},
	],
});
