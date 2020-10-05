/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import {loadSourceMap} from '../transform';

describe('loadSourceMap()', () => {
	it('works with //# annotation', () => {
		const sourceMap = loadSourceMap(
			path.join(
				__dirname,
				'__fixtures__',
				'sourcemaps',
				'sourceMapFile1.js.file'
			)
		);

		expect(sourceMap).toMatchSnapshot();
	});

	it('works with /*# annotation', () => {
		const sourceMap = loadSourceMap(
			path.join(
				__dirname,
				'__fixtures__',
				'sourcemaps',
				'sourceMapFile2.js.file'
			)
		);

		expect(sourceMap).toMatchSnapshot();
	});
});
