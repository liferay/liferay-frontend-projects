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
	});
});
