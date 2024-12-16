/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

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
	//
	// We use a loose match here because the actual version obtained may
	// vary depend on environment (eg. in local environment, it will
	// usually pick up node-sass from the monorepo root, but in CI it
	// will pick up sass from the local node_modules folder, because in
	// CI when running the js-toolkit v2 tests we only set up the local
	// folder.

	expect(context.log.messages).toEqual([
		{
			level: 'info',
			source: 'sass-loader',
			things: [
				expect.stringMatching(
					/Processed file with \S+ v\S+ \(from project\)/
				),
			],
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

	// Here again we do a loose match (whitespace-agnostic) to account for
	// differences between node-sass and sass.

	expect(result.trim().replace(/\s+/g, ' ')).toEqual(
		`.Button { border: 1px solid red; }`
	);

	expect(Object.keys(context.extraArtifacts)).toEqual([]);
});
