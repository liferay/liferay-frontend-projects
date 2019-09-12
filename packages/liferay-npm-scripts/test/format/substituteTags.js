/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const substituteTags = require('../../src/format/substituteTags');
const dedent = require('../../support/dedent');
const getFixture = require('../../support/getFixture');

describe('substituteTags()', () => {
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

	it('turns JSP directives (<%@ ... %>) into comments', () => {
		const [transformed, tags] = substituteTags(dedent(3)`
			<%@ include file="/other.jsp" %>

			var count = 0;
		`);

		expect(transformed).toEqual(dedent(3)`
			/*╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳*/

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
			/*╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳*/

			var description = "ʾJSP_EXPR_________ʿ";
		`);

		expect(tags).toEqual([
			'<% FooThing myFoo = new FooThing(); %>',
			'<%= myFoo.body() %>'
		]);
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
			╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳
			*/

			var description = "ʾJSP_EXPR_________ʿ";

			/*
			╳
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
	});

	it('turns <portlet:namespace /> tags into identifiers', () => {
		const [transformed, tags] = substituteTags(dedent(3)`
			var calendarList = window.<portlet:namespace />calendarLists[calendarResourceId];
		`);

		expect(transformed).toEqual(dedent(3)`
			var calendarList = window.ʾPORTLET_NAMESPACE__ʿcalendarLists[calendarResourceId];
		`);

		expect(tags).toEqual(['<portlet:namespace />']);
	});

	it('turns JSP tags into comments and conditionals', () => {
		const [transformed, tags] = substituteTags(dedent(3)`
			// A self-closing tag.
			<some:tag attr="1" />

			// A multiline self-closing tag.
			<other:tag
				multiline="true"
				self-closing="true"
			/>

			// A tag with children.
			<this:tag>
				alert('done');
			</this:tag>

			// A tag with children that has a JSP expression in an attribute.
			<c:if test="<%= enableRSS %>">
				var a = true;
			</c:if>

			// A multiline tag with children.
			<multi:line
				opening="1"
			>
				var x = 1;
			</multi:line>

			// A multiline tag that has no non-whitespace template text.
			<a:tag>
				<a:param thing="1" />
				<a:other thing="2" />
			</a:tag>
		`);

		expect(transformed).toEqual(dedent(3)`
			// A self-closing tag.
			/*╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳*/

			// A multiline self-closing tag.
			/*╳╳╳╳╳╳╳╳
				╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳
				╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳
			*/

			// A tag with children.
			//ʃʃʃʃʃʃʃʃ
				alert('done');
			/*ʅʅʅʅʅʅʅ*/

			// A tag with children that has a JSP expression in an attribute.
			//ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ
				var a = true;
			/*ʅʅʅ*/

			// A multiline tag with children.
			/*ʃʃʃʃʃʃʃʃ
				ʃʃʃʃʃʃʃʃʃʃʃ
			*/
				var x = 1;
			/*ʅʅʅʅʅʅʅʅʅ*/

			// A multiline tag that has no non-whitespace template text.
			/*╳╳╳╳╳
				╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳
				╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳╳
			╳╳╳╳╳╳*/
		`);

		expect(tags).toEqual([
			'<some:tag attr="1" />',
			'<other:tag\n' +
				'\tmultiline="true"\n' +
				'\tself-closing="true"\n' +
				'/>',
			'<this:tag>',
			'</this:tag>',
			'<c:if test="<%= enableRSS %>">',
			'</c:if>',
			'<multi:line\n' + '\topening="1"\n' + '>',
			'</multi:line>',
			'<a:tag>\n' +
				'\t<a:param thing="1" />\n' +
				'\t<a:other thing="2" />\n' +
				'</a:tag>'
		]);
	});

	it('turns JSP tags into multiline comments if followed on same line ', () => {
		// Possibly rare(?) example from liferay-portal, and can be seen in our
		// fixtures too:
		let [transformed, tags] = substituteTags(dedent(3)`
			<c:if test="<%= a %>">*</c:if>
		`);

		expect(transformed).toEqual(dedent(3)`
			/*ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ*/*/*ʅʅʅ*/
		`);

		expect(tags).toEqual(['<c:if test="<%= a %>">', '</c:if>']);

		// We shouldn't have anything like this in liferay-portal, but
		// just in case...
		[transformed, tags] = substituteTags(dedent(3)`
			<c:if test="<%= a %>"><c:if test="<%= b %>">
				alert('hi');
			</c:if></c:if>
		`);

		expect(transformed).toEqual(dedent(3)`
			/*ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ*///ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ
				alert('hi');
			/*ʅʅʅ*//*ʅʅʅ*/
		`);

		expect(tags).toEqual([
			'<c:if test="<%= a %>">',
			'<c:if test="<%= b %>">',
			'</c:if>',
			'</c:if>'
		]);
	});

	describe('substituting tags in entire fixtures', () => {
		test.each([
			'configuration.jsp',
			'edit_content_redirect.jsp',
			'edit_template_display.jspf',
			'page.jsp',
			'recaptcha.jsp',
			'roles.jsp',
			'view.jsp',
			'view_calendar_menus.jspf',
			'view_meeting.jsp'
		])('%s matches snapshot', async fixture => {
			const source = await getFixture(path.join('format', fixture));

			expect(substituteTags(source)).toMatchSnapshot();
		});
	});
});
