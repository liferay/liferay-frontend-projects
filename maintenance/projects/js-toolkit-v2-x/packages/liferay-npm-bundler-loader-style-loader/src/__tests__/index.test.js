/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import loader from '../index';

const TEST_CSS = '.Button { border: 1px solid red; }';

it('logs results correctly', () => {
	const context = {
		content: TEST_CSS,
		filePath: 'file.css',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	loader(context, {});

	expect(context.log.messages).toEqual([
		{
			level: 'info',
			source: 'style-loader',
			things: ['Generated JavaScript CSS module'],
		},
	]);
});

it('correctly generates JS module', () => {
	const context = {
		content: TEST_CSS,
		filePath: 'file.css',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	const result = loader(context, {});

	expect(result).toBeUndefined();

	expect(Object.keys(context.extraArtifacts)).toEqual(['file.css.js']);

	/* eslint-disable-next-line no-eval */
	expect(eval(context.extraArtifacts['file.css.js']).outerHTML).toEqual(
		`<style type="text/css">${TEST_CSS}</style>`
	);
});
