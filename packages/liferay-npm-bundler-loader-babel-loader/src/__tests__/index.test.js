/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import loader from '../index';

let savedDir;

beforeEach(() => {
	savedDir = process.cwd();

	process.chdir(path.join(__dirname, '..', '..'));
});

afterEach(() => {
	process.chdir(savedDir);
});

it('logs results correctly', () => {
	const context = {
		content: 'var x = 1;',
		filePath: 'file.js',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	loader(context, {});

	expect(context.log.messages).toMatchSnapshot();
});

it('correctly transpiles JS code', () => {
	const context = {
		content: 'const x = 1;',
		filePath: 'file.js',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	const result = loader(context, {presets: ['es2015']});

	expect(result).toMatchSnapshot();
	expect(context.extraArtifacts).toMatchSnapshot();
});
