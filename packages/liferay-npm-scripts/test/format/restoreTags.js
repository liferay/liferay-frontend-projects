/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const dedent = require('../../support/dedent');
const extractJS = require('../../src/format/extractJS');
const getFixture = require('../../support/getFixture');
const restoreTags = require('../../src/format/restoreTags');
const substituteTags = require('../../src/format/substituteTags');

describe('restoreTags()', () => {
	fit('puts previously extracted tags back in their place (round-trip)', () => {
		const source = `
			text
			#{expr}
			more <%= getStuff() %> here

			<%
				/* comment */
			%>
		`;

		const [text, tags] = substituteTags(source);

		// Some fake formatting that moves and changes text.
		const formattedText = '\n\t\t\t// Prefix' + text.toUpperCase();

		const result = restoreTags(formattedText, tags);

		const expected = `
			// Prefix
			TEXT
			#{expr}
			MORE <%= getStuff() %> HERE

			<%
				/* comment */
			%>
		`;

		expect(result).toEqual(expected);
	});

	// TODO: throws error if tag count is wrong

	it('turns EL syntax (${}) into identifier placeholders', () => {
		const [transformed, tags] = substituteTags('alert(${expr1}, ${expr2})');

		expect(transformed).toEqual('alert(ʾEL_0__ʿ, ʾEL_1__ʿ)');

		expect(tags).toEqual(['${expr1}', '${expr2}']);
	});

	it('leaves escaped EL syntax (${}) untouched', () => {
		const [transformed, tags] = substituteTags(
			'alert("\\${expr1}, \\${expr2}")'
		);

		expect(transformed).toEqual('alert("\\${expr1}, \\${expr2}")');

		expect(tags).toEqual([]);
	});

	it('turns EL syntax (#{}) into identifier placeholders', () => {
		const [transformed, tags] = substituteTags('alert(#{expr1}, #{expr2})');

		expect(transformed).toEqual('alert(ʾEL_0__ʿ, ʾEL_1__ʿ)');

		expect(tags).toEqual(['#{expr1}', '#{expr2}']);
	});

	it('leaves escaped EL syntax (#{}) untouched', () => {
		const [transformed, tags] = substituteTags(
			'alert("\\#{expr1}, \\#{expr2}")'
		);

		expect(transformed).toEqual('alert("\\#{expr1}, \\#{expr2}")');

		expect(tags).toEqual([]);
	});

	it('turns JSP expressions (<%= ... %>) into identifier placeholders', () => {
		const [transformed, tags] = substituteTags(dedent(3)`
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

		expect(tags).toEqual(['<%= SomeUtil("abc") %>']);
	});

	it('turns JSP directives (<%@ ... %>) into identifier placeholders', () => {
		const [transformed, tags] = substituteTags(dedent(3)`
			<%@ include file="/other.jsp" %>

			var count = 0;
		`);

		expect(transformed).toEqual(dedent(3)`
			ʾJSP_DIR_______________________ʿ

			var count = 0;
		`);

		expect(tags).toEqual(['<%@ include file="/other.jsp" %>']);
	});

	it('turns single-line JSP scriplets (<% ... %>) into comments', () => {
		const [transformed, tags] = substituteTags(dedent(3)`
			<% FooThing myFoo = new FooThing(); %>

			var description = "<%= myFoo.body() %>";
		`);

		expect(transformed).toEqual(dedent(3)`
			/*                                  */

			var description = "ʾJSP_EXPR_________ʿ";
		`);

		expect(tags).toEqual([
			'<% FooThing myFoo = new FooThing(); %>',
			'<%= myFoo.body() %>'
		]);
		// TODO deal with c:if etc, which would ideally produce `if` blocks etc
	});

	it('turns multi-line JSP scriplets (<% ... %>) into comments', () => {
		const [transformed, tags] = substituteTags(dedent(3)`
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

		expect(tags).toEqual([
			dedent(3)`<%
			if (Liferay.isThing()) {
			%>`,
			'<%= myFoo.body() %>',
			dedent(3)`<%
			}
			%>`
		]);
		// TODO deal with c:if etc, which would ideally produce `if` blocks etc
	});
});
