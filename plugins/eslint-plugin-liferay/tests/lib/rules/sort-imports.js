/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/sort-imports');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

// TODO: make sure destructuring is ordered too
// eg. https://github.com/mthadley/eslint-plugin-sort-destructure-keys
// eslint's sort-imports plug-in sorts destructuring patterns too
// https://github.com/eslint/eslint/blob/master/lib/rules/sort-imports.js
// i think these need to be separate rules
ruleTester.run('sort-imports', rule, {
	invalid: [
		{
			// Basic example.
			code: `
				import {g, z} from 'one';
				import x from './x';
				import {a} from 'other';
				import * as s from '../s';
			`,
			errors: [
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "other" << "../s" << "./x")',
					type: 'ImportDeclaration',
				},
			],
			output: `
				import {g, z} from 'one';
				import {a} from 'other';
				import * as s from '../s';
				import x from './x';
			`,
		},
		{
			// Example with trailing comments.
			code: `
				import {g, z} from 'one';
				import x from './x';
				import {a} from 'other'; // Comment will move with the import.
				import * as s from '../s';
			`,
			errors: [
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "other" << "../s" << "./x")',
					type: 'ImportDeclaration',
				},
			],
			output: `
				import {g, z} from 'one';
				import {a} from 'other'; // Comment will move with the import.
				import * as s from '../s';
				import x from './x';
			`,
		},
		{
			// Example with leading comments.
			code: `
				import {g, z} from 'one';
				import x from './x';
				import {a} from 'other';
				// Comment on "../s" stays with "../s".
				import * as s from '../s';
			`,
			errors: [
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "other" << "../s" << "./x")',
					type: 'ImportDeclaration',
				},
			],
			output: `
				import {g, z} from 'one';
				import {a} from 'other';
				// Comment on "../s" stays with "../s".
				import * as s from '../s';
				import x from './x';
			`,
		},
		{
			// Example showing that we don't move header comments.
			code: `
				/**
				 * © 2017 Liferay, Inc. <https://liferay.com>
				 *
				 * SPDX-License-Identifier: MIT
				 */
				import z from 'z';
				import a from 'a';
			`,
			errors: [
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "a" << "z")',
					type: 'ImportDeclaration',
				},
			],
			output: `
				/**
				 * © 2017 Liferay, Inc. <https://liferay.com>
				 *
				 * SPDX-License-Identifier: MIT
				 */
				import a from 'a';
				import z from 'z';
			`,
		},
		{
			// Example showing that we don't sort across boundaries.
			code: `
				import x from './x';
				import {a} from 'other';
				import 'a-side-effectful-import'; // Boundary here.
				import * as s from '../s';
				import {g, z} from 'one';
			`,
			errors: [
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "other" << "./x")',
					type: 'ImportDeclaration',
				},
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "one" << "../s")',
					type: 'ImportDeclaration',
				},
			],
			output: `
				import {a} from 'other';
				import x from './x';
				import 'a-side-effectful-import'; // Boundary here.
				import {g, z} from 'one';
				import * as s from '../s';
			`,
		},
		{
			// Basic example with `require` calls.
			code: `
				const {g, z} = require('one');
				const x = require('./x');
				const {a} = require('other');
				const s = require('../s');
			`,
			errors: [
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "other" << "../s" << "./x")',
					type: 'VariableDeclaration',
				},
			],
			output: `
				const {g, z} = require('one');
				const {a} = require('other');
				const s = require('../s');
				const x = require('./x');
			`,
		},
		{
			// Regression test: two imports from the same module were causing
			// duplication.
			code: `
				 import {Config} from 'metal-state';
				 import {debounce} from 'frontend-js-web';
				 import {PortletBase} from 'frontend-js-web';
				 import Soy from 'metal-soy';

				 import templates from './FragmentPreview.soy';
			`,
			errors: [
				{
					message:
						'imports must be sorted by module name ' +
						'(expected: "frontend-js-web" << "frontend-js-web" << "metal-soy" << "metal-state")',
					type: 'ImportDeclaration',
				},
			],
			output: `
				 import {PortletBase} from 'frontend-js-web';
				 import {debounce} from 'frontend-js-web';
				 import Soy from 'metal-soy';
				 import {Config} from 'metal-state';

				 import templates from './FragmentPreview.soy';
			`,
		},
	],

	valid: [
		{
			// Well-sorted imports.
			code: `
				import {g, z} from 'one';
				import {a} from 'other';
				import * as s from '../s';
				import x from './x';
			`,
		},
		{
			// Well-sorted requires.
			code: `
				const {g, z} = require('one');
				const {a} = require('other');
				const s = require('../s');
				const x = require('./x');
			`,
		},
		{
			// Proof that non-top-level requires are ignored.
			code: `
				const {g, z} = require('one');
				const {a} = require('other');

				// It's not good practice to intermix require calls and
				// other VariableDeclarations, but doing this to show
				// things like this aren't considered when ordering:
				const b = () => require('b');

				const s = require('../s');
				const x = require('./x');
			`,
		},
	],
});
