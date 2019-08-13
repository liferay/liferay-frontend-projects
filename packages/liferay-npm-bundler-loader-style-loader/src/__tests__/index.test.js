/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import loader from '../index';

it('logs results correctly', () => {
	const context = {
		content: '.Button { border: 1px solid red; }',
		filePath: 'file.css',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	loader(context, {});

	expect(context.log.messages).toMatchSnapshot();
});

it('correctly generates JS module', () => {
	const context = {
		content: '.Button { border: 1px solid red; }',
		filePath: 'file.css',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	const result = loader(context, {});

	expect(result).toBeUndefined();
	expect(Object.keys(context.extraArtifacts)).toEqual(['file.css.js']);
	expect(context.extraArtifacts['file.css.js']).toMatchSnapshot();
});
