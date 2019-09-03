/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const extractJS = require('../../src/format/extractJS');
const substituteTags = require('../../src/format/substituteTags');
const getFixture = require('../../support/getFixture');

async function getScript(fixture) {
	const contents = await getFixture(fixture);

	const blocks = extractJS(contents.toString());

	const length = blocks.length;

	if (length !== 1) {
		throw new Error(
			`Expected exactly one code block in ${fixture} but got ${length}`
		);
	}

	return blocks[0];
}

describe('substituteTags()', () => {
	it('turns Expression Language syntax (${}) into identifier placeholders', () => {});

	it('turns childless JSP tags into comments', async () => {
		// See the </liferay-portlet:renderURL> tag in this fixture, which is in
		// the middle of an object literal and produces no output.
		const source = await getScript('format/configuration.jsp');

		const transformed = substituteTags(source);

		expect(transformed).toBe(transformed);
	});

	test.todo('turn the above into an actual test');
});
