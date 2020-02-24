/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/import-extensions');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

const message = 'unnecessary extension in import';

const type = 'Literal';

const errors = [
	{
		message,
		type,
	},
];

ruleTester.run('import-extensions', rule, {
	invalid: [
		{
			code: `import templates from './Something.soy.js';`,
			errors,
			output: `import templates from './Something.soy';`,
		},
		{
			code: `import {Util} from './Util.es.js';`,
			errors,
			output: `import {Util} from './Util.es';`,
		},
		{
			code: `import * as Billboard from './billboard.js';`,
			errors,
			output: `import * as Billboard from './billboard';`,
		},
		{
			code: `const templates = require('./Something.soy.js');`,
			errors,
			output: `const templates = require('./Something.soy');`,
		},
		{
			code: `const {Util} = require('./Util.es.js');`,
			errors,
			output: `const {Util} = require('./Util.es');`,
		},
		{
			code: `const Billboard = require('./billboard.js');`,
			errors,
			output: `const Billboard = require('./billboard');`,
		},
		{
			// Double quote delimiters are preserved.
			code: `const Billboard = require("./billboard.js");`,
			errors,
			output: `const Billboard = require("./billboard");`,
		},
		{
			// Backtick delimiters are preserved.
			code: `const Billboard = require(\`./billboard.js\`);`,
			errors: [
				{
					message,
					type: 'TemplateLiteral',
				},
			],
			output: `const Billboard = require(\`./billboard\`);`,
		},
	],

	valid: [
		{
			code: `import templates from './Something.soy';`,
		},
		{
			code: `import {Util} from './Util.es';`,
		},
		{
			// OK because "billboard.js" is the name of an NPM package:
			code: `import {Data} from 'billboard.js';`,
		},
		{
			code: `const templates = require('./Something.soy');`,
		},
		{
			code: `const {Util} = require('./Util.es');`,
		},
		{
			code: `const {Data} = require('billboard.js');`,
		},
		{
			// Note double quotes.
			code: `const {Data} = require("billboard.js");`,
		},
		{
			// Note backticks...
			code: `const {Data} = require(\`billboard.js\`);`,
		},
		{
			// ...but we don't look at backticks if they contain interpolation.
			code: `const {Data} = require(\`./\${something}.js\`);`,
		},
		{
			code: `const billboard = not_a_require('billboard.js');`,
		},
	],
});
