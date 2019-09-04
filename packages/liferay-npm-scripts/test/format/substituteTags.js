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
		expect(transformed).toEqual('alert(ʾEL_0__ʿ, ʾEL_1__ʿ)');
	});

	it('leaves escaped EL syntax (${}) untouched', () => {
		const transformed = substituteTags('alert("\\${expr1}, \\${expr2}")');
		expect(transformed).toEqual('alert("\\${expr1}, \\${expr2}")');
	});

	it('turns EL syntax (#{}) into identifier placeholders', () => {
		const transformed = substituteTags('alert(#{expr1}, #{expr2})');
		expect(transformed).toEqual('alert(ʾEL_0__ʿ, ʾEL_1__ʿ)');
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
					'<div class="alert">ʾJSP_EXPR____________ʿ</div>'
				);
			}
		`);
	});

	it('turns JSP directives (<%@ ... %>) into identifier placeholders', () => {
		const transformed = substituteTags(dedent(3)`
			<%@ include file="/other.jsp" %>

			var count = 0;
		`);

		expect(transformed).toEqual(dedent(3)`
			ʾJSP_DIR_______________________ʿ

			var count = 0;
		`);
	});

	it('turns single-line JSP scriplets (<% ... %>) into comments', () => {
		const transformed = substituteTags(dedent(3)`
			<% FooThing myFoo = new FooThing(); %>

			var description = "<%= myFoo.body() %>";
		`);

		expect(transformed).toEqual(dedent(3)`
			/*                                  */

			var description = "ʾJSP_EXPR_________ʿ";
		`);

		// TODO deal with c:if etc, which would ideally produce `if` blocks etc
	});

	it('turns multi-line JSP scriplets (<% ... %>) into comments', () => {
		const transformed = substituteTags(dedent(3)`
			<%
			if (Liferay.isThing()) {
			%>

			var description = "<%= myFoo.body() %>";

			<%
			}
			%>
		`);

		// TODO: beware inserting multiline comments in places where they can't
		// legitimately go (for example, inside a string); although that might
		// be edge-casey enough that it doesn't matter in practice.
		expect(transformed).toEqual(dedent(3)`
			/*
			                        
			*/

			var description = "ʾJSP_EXPR_________ʿ";

			/*
			 
			*/
		`);

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
