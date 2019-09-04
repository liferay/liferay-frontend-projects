/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const extractJS = require('../../src/format/extractJS');
const dedent = require('../../support/dedent');
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

	return blocks[0].contents;
}

describe('substituteTags()', () => {
	it('turns EL syntax (${}) into identifier placeholders', () => {
		const transformed = substituteTags('alert(${expr1}, ${expr2})');
		expect(transformed).toEqual(
			'alert(_EL_EXPRESSION_6, _EL_EXPRESSION_16)'
		);
	});

	it('leaves escaped EL syntax (${}) untouched', () => {
		const transformed = substituteTags('alert("\\${expr1}, \\${expr2}")');
		expect(transformed).toEqual('alert("\\${expr1}, \\${expr2}")');
	});

	it('turns EL syntax (#{}) into identifier placeholders', () => {
		const transformed = substituteTags('alert(#{expr1}, #{expr2})');
		expect(transformed).toEqual(
			'alert(_EL_EXPRESSION_6, _EL_EXPRESSION_16)'
		);
	});

	it('leaves escaped EL syntax (#{}) untouched', () => {
		const transformed = substituteTags('alert("\\#{expr1}, \\#{expr2}")');
		expect(transformed).toEqual('alert("\\#{expr1}, \\#{expr2}")');
	});

	it('turns JSP expressions (<%= ... %>) into identifier placeholders', () => {
		const transformed = substituteTags(dedent(3)`
			function create() {
				A.Node.create(
					'<div class="alert"><%= SomeUtil("abc") %></div>'
				);
			}
		`);

		expect(transformed).toEqual(dedent(3)`
			function create() {
				A.Node.create(
					'<div class="alert">_ECHO_SCRIPTLET_</div>'
				);
			}
		`);
	});

	it('turns JSP directives (<%@ ... %>) into identifier placeholders', () => {});

	it('turns JSP scriplets (<% ... %>) into comments', () => {
		// TODO deal with c:if etc, which would ideally produce `if` blocks etc
	});

	it('turns childless JSP tags into comments', async () => {
		// See the </liferay-portlet:renderURL> tag in this fixture, which is in
		// the middle of an object literal and produces no output.
		const source = await getScript('format/configuration.jsp');

		const transformed = substituteTags(source);

		expect(transformed).toBe(transformed);
	});

	test.todo('turn the above into an actual test');
});
