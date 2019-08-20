/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import loader from '../index';

const TEST_JSON_OBJECT = {
	name: 'backslash-inserter',
	version: '1.0.0',
	description: 'A module that inserts \\ characters in files.',
	main: 'index.js',
	devDependencies: {
		'babel-cli': '^6.24.1',
		'babel-preset-es2015': '^6.24.1',
	},
	dependencies: {
		'is-array': '1.0.0',
	},
};

it('logs results correctly', () => {
	const context = {
		content: JSON.stringify(TEST_JSON_OBJECT, null, 2),
		filePath: 'package.json',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	loader(context, {});

	expect(context.log.messages).toEqual([
		{
			level: 'info',
			source: 'json-loader',
			things: ['Generated JavaScript JSON module'],
		},
	]);
});

it('correctly generates JS module', () => {
	const context = {
		content: JSON.stringify(TEST_JSON_OBJECT, null, 2),
		filePath: 'package.json',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	const result = loader(context, {});

	expect(result).toBeUndefined();

	expect(Object.keys(context.extraArtifacts)).toEqual(['package.json.js']);
	expect(eval(context.extraArtifacts['package.json.js'])).toEqual(
		TEST_JSON_OBJECT
	);
});
