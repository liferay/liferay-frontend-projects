/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

describe('config.json', () => {
	it('is valid JSON', () => {
		const json = fs.readFileSync(
			path.join(__dirname, '..', 'config.json'),
			'utf8'
		);

		const parsed = JSON.parse(json);

		expect(parsed).toEqual(
			expect.objectContaining({
				'*': expect.any(Object),
				'/': expect.any(Object),
				config: expect.any(Object),
				exclude: expect.any(Object),
				output: expect.any(String),
				rules: expect.any(Array),
			})
		);
	});
});
