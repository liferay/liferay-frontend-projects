/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-js-toolkit-core/lib/plugin-logger';

import loader from '../index';

it('logs results correctly', () => {
	const context = {
		content: '$color: red; .Button { border: 1px solid $color; }',
		filePath: 'file.scss',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	loader(context, {});

	// This test returns '(from project)' because of yarn hoisting, which makes
	// the loader think that it is retrieving sass from a project (as opposed to
	// itself).
	expect(context.log.messages).toEqual([
		{
			level: 'info',
			source: 'sass-loader',
			things: ['Processed file with sass v1.24.0 (from project)'],
		},
	]);
});

it('correctly generates CSS', () => {
	const context = {
		content: '$color: red; .Button { border: 1px solid $color; }',
		filePath: 'file.scss',
		log: new PluginLogger(),
		extraArtifacts: {},
	};

	const result = loader(context, {});

	expect(result).toEqual(`.Button {
  border: 1px solid red;
}`);

	expect(Object.keys(context.extraArtifacts)).toEqual([]);
});
