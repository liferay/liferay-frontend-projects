/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');
const rule = require('../../../lib/rules/no-explicit-extend');

const ruleTester = new RuleTester();

const filename = '/data/liferay-portal/modules/apps/a/b/.eslintrc.js';

ruleTester.run('no-explicit-extend', rule, {
	invalid: [
		{
			// As a naked string.
			code: `
				module.exports = {
					extends: 'liferay/portal'
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {};
			`,
		},
		{
			// As a naked string before other configuration.
			code: `
				module.exports = {
					extends: 'liferay/portal',
					rules: []
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {
					rules: []
				};
			`,
		},
		{
			// As a naked string in the middle of other configuration.
			code: `
				module.exports = {
					preset: 'fancy',
					extends: 'liferay/portal',
					rules: []
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {
					preset: 'fancy',
					rules: []
				};
			`,
		},
		{
			// As a naked string after other configuration.
			code: `
				module.exports = {
					debug: true,
					extends: 'liferay/portal'
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {
					debug: true
				};
			`,
		},
		{
			// At the beginning, on one line.
			code: `
				module.exports = {
					extends: ['liferay/portal', 'liferay/react']
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {
					extends: ['liferay/react']
				};
			`,
		},
		{
			// In the middle, on one line.
			code: `
				module.exports = {
					extends: ['special', 'liferay/portal', 'liferay/react']
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {
					extends: ['special', 'liferay/react']
				};
			`,
		},
		{
			// At the end, on one line.
			code: `
				module.exports = {
					extends: ['liferay/react', 'liferay/portal']
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {
					extends: ['liferay/react']
				};
			`,
		},
		{
			// Alone.
			code: `
				module.exports = {
					extends: ['liferay/portal']
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {};
			`,
		},
		{
			// Alone with a trailing comma.
			code: `
				module.exports = {
					extends: ['liferay/portal'],
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {};
			`,
		},
		{
			// Alone with a trailing comma across multiple lines.
			code: `
				module.exports = {
					extends: [
						'liferay/portal',
					],
				};
			`,
			errors: [
				{
					messageId: 'noExplicitExtend',
					type: 'Literal',
				},
			],
			filename,
			output: `
				module.exports = {};
			`,
		},
	],

	valid: [
		{
			code: `
				module.exports = {
					extends: ['liferay/react']
				};
			`,
			filename,
		},
		{
			code: `
				module.exports = {
					extends: 'liferay/react'
				};
			`,
			filename,
		},
		{
			code: `
				module.exports = {
					extends: []
				};
			`,
			filename,
		},
		{
			// Would be invalid, but not in an .eslintrc.js file.
			code: `
				module.exports = {
					extends: 'liferay/portal'
				};
			`,
			filename: '/tmp/not-an-eslintrc.js',
		},
	],
});
