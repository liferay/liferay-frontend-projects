/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const lex = require('../../src/format/lex');

describe('lex()', () => {
	it('lexes a comment', () => {
		expect(lex('<%-- my comment --%>')).toEqual([
			{
				contents: '<%-- my comment --%>',
				index: 0,
				name: 'JSP_COMMENT'
			}
		]);
	});

	it('lexes multiple comments', () => {
		expect(lex('<%-- one --%><%-- two --%>')).toEqual([
			{
				contents: '<%-- one --%>',
				index: 0,
				name: 'JSP_COMMENT'
			},
			{
				contents: '<%-- two --%>',
				index: 13,
				name: 'JSP_COMMENT'
			}
		]);
	});

	it('complains about unclosed comments', () => {
		expect(() => lex('<%-- unterminated')).toThrow(
			'Unexpected end-of-input trying to match JSP_COMMENT_END at: ""'
		);
	});

	it('lexes directives', () => {
		expect(lex('<%@ include file="double/quoted/file" %>')).toEqual([
			{
				contents: '<%@ include file="double/quoted/file" %>',
				index: 0,
				name: 'JSP_DIRECTIVE'
			}
		]);

		expect(lex("<%@ include file='single/quoted/file' %>")).toEqual([
			{
				contents: "<%@ include file='single/quoted/file' %>",
				index: 0,
				name: 'JSP_DIRECTIVE'
			}
		]);

		expect(lex('<%@ include file="\\"stuff\\\\¿here?&quot;" %>')).toEqual([
			{
				contents: '<%@ include file="\\"stuff\\\\¿here?&quot;" %>',
				index: 0,
				name: 'JSP_DIRECTIVE'
			}
		]);

		expect(lex('<%@ page language="en" %>')).toEqual([
			{
				contents: '<%@ page language="en" %>',
				index: 0,
				name: 'JSP_DIRECTIVE'
			}
		]);

		expect(lex('<%@ taglib prefix="foo" tagdir="bar" %>')).toEqual([
			{
				contents: '<%@ taglib prefix="foo" tagdir="bar" %>',
				index: 0,
				name: 'JSP_DIRECTIVE'
			}
		]);

		expect(lex('<%@ taglib prefix="foo" uri="bar" %>')).toEqual([
			{
				contents: '<%@ taglib prefix="foo" uri="bar" %>',
				index: 0,
				name: 'JSP_DIRECTIVE'
			}
		]);

		// Note it agnostic about attribute order.
		expect(lex('<%@ taglib uri="bar" prefix="foo" %>')).toEqual([
			{
				contents: '<%@ taglib uri="bar" prefix="foo" %>',
				index: 0,
				name: 'JSP_DIRECTIVE'
			}
		]);

		// But it requires all attributes to be present.
		expect(() => lex('<%@ taglib prefix="foo">')).toThrow(
			'Failed to match "taglib" allOf:(SPACE "prefix" EQ ATTRIBUTE_VALUE, SPACE "tagdir" EQ ATTRIBUTE_VALUE | SPACE "uri" EQ ATTRIBUTE_VALUE) at: "taglib prefix=\\"foo\\">"'
		);
	});

	it('lexes declarations', () => {
		const contents = `<%!
			private static Log _log = LogFactoryUtil.getLog("foo");
		%>`;

		expect(lex(contents)).toEqual([
			{
				contents,
				index: 0,
				name: 'JSP_DECLARATION'
			}
		]);
	});
});
