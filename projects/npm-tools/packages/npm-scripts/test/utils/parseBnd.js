/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const parseBnd = require('../../src/utils/parseBnd');
const getFixturePath = require('../../support/getFixturePath');

describe('parseBnd()', () => {
	const bndPath = getFixturePath('utils/parseBnd/bnd.bnd');

	it('correctly parses a bnd.bnd file', () => {
		const entries = parseBnd(bndPath);

		expect(Object.keys(entries)).toHaveLength(9);

		expect(entries['Bundle-Name']).toBe('Liferay Frontend JS Web');
		expect(entries['Provide-Capability']).toBe(
			'osgi.extender; ' +
				'		osgi.extender="liferay.js"; ' +
				'		version:Version="${Bundle-Version}"'
		);
		expect(entries['Web-ContextPath']).toBe('/frontend-js-web');
	});
});
