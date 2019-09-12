/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const lex = require('../../src/format/lex');
const getFixture = require('../../support/getFixture');

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
			'Failed to match JSP_COMMENT_START ->> JSP_COMMENT_END at: "<%-- unterminated"'
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

	it('lexes expressions', () => {
		expect(lex('<%= Target.method("foo") %>')).toEqual([
			{
				contents: '<%= Target.method("foo") %>',
				index: 0,
				name: 'JSP_EXPRESSION'
			}
		]);
	});

	it('lexes scriptlets', () => {
		const contents = `<%
			String backURL = PortalUtil.getCurrentURL(request);
		%>`;

		expect(lex(contents)).toEqual([
			{
				contents,
				index: 0,
				name: 'JSP_SCRIPTLET'
			}
		]);
	});

	it('lexes EL (Expression Language) expressions', () => {
		// TODO: provide more challenging examples here.

		// Immediate evaluation.
		expect(lex('${Foo.Bar}')).toEqual([
			{
				contents: '${Foo.Bar}',
				index: 0,
				name: 'EL_EXPRESSION'
			}
		]);

		// Deferred evaluation.
		expect(lex('#{Foo.Bar}')).toEqual([
			{
				contents: '#{Foo.Bar}',
				index: 0,
				name: 'EL_EXPRESSION'
			}
		]);
	});

	it('ignores EL expressions when ELEnabled is false', () => {
		expect(lex('#{Foo.Bar}', {ELEnabled: false})).toEqual([
			{
				contents: '#{',
				index: 0,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: 'Foo.Bar}',
				index: 2,
				name: 'TEMPLATE_TEXT'
			}
		]);
	});

	it('ignores EL expressions when configured with a directive', () => {
		expect(
			lex(`
			<%@ page isELIgnored="true" %>
			#{Foo}
		`)
		).toEqual([
			{
				contents: '\n\t\t\t',
				index: 0,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: '<%@ page isELIgnored="true" %>',
				index: 4,
				name: 'JSP_DIRECTIVE'
			},
			{
				contents: '\n\t\t\t',
				index: 34,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: '#{',
				index: 38,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: 'Foo}\n\t\t',
				index: 40,
				name: 'TEMPLATE_TEXT'
			}
		]);
	});

	it('processes EL expressions when configured with a directive', () => {
		expect(
			lex(`
			<%@ page isELIgnored="false" %>
			#{Foo}
		`)
		).toEqual([
			{
				contents: '\n\t\t\t',
				index: 0,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: '<%@ page isELIgnored="false" %>',
				index: 4,
				name: 'JSP_DIRECTIVE'
			},
			{
				contents: '\n\t\t\t',
				index: 35,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: '#{Foo}',
				index: 39,
				name: 'EL_EXPRESSION'
			},
			{
				contents: '\n\t\t',
				index: 45,
				name: 'TEMPLATE_TEXT'
			}
		]);
	});

	it('lexes the <portlet:namespace /> action', () => {
		// With whitespace.
		expect(lex('<portlet:namespace />')).toEqual([
			{
				contents: '<portlet:namespace />',
				index: 0,
				name: 'PORTLET_NAMESPACE'
			}
		]);

		// Without whitespace.
		expect(lex('<portlet:namespace/>')).toEqual([
			{
				contents: '<portlet:namespace/>',
				index: 0,
				name: 'PORTLET_NAMESPACE'
			}
		]);
	});

	it('lexes a custom action', () => {
		// Self-closing.
		expect(lex('<custom:tag with="stuff" />')).toEqual([
			{
				contents: '<custom:tag with="stuff" />',
				index: 0,
				name: 'CUSTOM_ACTION'
			}
		]);

		// Same without whitspace at end.
		expect(lex('<custom:tag with="stuff"/>')).toEqual([
			{
				contents: '<custom:tag with="stuff"/>',
				index: 0,
				name: 'CUSTOM_ACTION'
			}
		]);

		// A self-closing tag with an attribute that contains a JSP expression.
		expect(lex('<custom:tag with="<%= SomeVariable %>" />')).toEqual([
			{
				contents: '<custom:tag with="<%= SomeVariable %>" />',
				index: 0,
				name: 'CUSTOM_ACTION'
			}
		]);

		// An opening tag with an attribuhte that contains a JSP expression.
		expect(lex('<c:if test="<%= enableRSS %>">')).toEqual([
			{
				contents: '<c:if test="<%= enableRSS %>">',
				index: 0,
				name: 'CUSTOM_ACTION_START'
			}
		]);

		// Empty body.
		expect(lex('<custom:tag with="stuff"></custom:tag>')).toEqual([
			{
				contents: '<custom:tag with="stuff"></custom:tag>',
				index: 0,
				name: 'CUSTOM_ACTION'
			}
		]);

		// Tag with duplicate attributes.
		expect(() => lex('<custom:tag foo="a" bar="b" foo="c" />')).toThrow(
			'Attribute names must be unique (got: "foo", "bar", "foo") at: ' +
				'"<custom:tag foo=\\"a\\" ..."'
		);
	});

	// Disabled because I want to be able to lex document subsets, in
	// which case, we might not have enough contextual information to determine
	// tag validity.
	it.skip('rejects invalid tags', () => {
		// Invalid tag.
		expect(() => lex('<custom:tag with="stuff"></bad:tag>')).toThrow(
			/Failed to match .+ at: "><\/bad:tag>"/
		);
	});

	it('lexes non-JSP tags as template text', () => {
		expect(
			lex(`
			<ul class="abc">
				<li>xyz</li>
			</ul>
		`)
		).toEqual([
			{contents: '\n\t\t\t', index: 0, name: 'TEMPLATE_TEXT'},
			{contents: '<', index: 4, name: 'TEMPLATE_TEXT'},
			{
				contents: 'ul class="abc">\n\t\t\t\t',
				index: 5,
				name: 'TEMPLATE_TEXT'
			},
			{contents: '<', index: 25, name: 'TEMPLATE_TEXT'},
			{contents: 'li>xyz', index: 26, name: 'TEMPLATE_TEXT'},
			{contents: '<', index: 32, name: 'TEMPLATE_TEXT'},
			{contents: '/li>\n\t\t\t', index: 33, name: 'TEMPLATE_TEXT'},
			{contents: '<', index: 41, name: 'TEMPLATE_TEXT'},
			{contents: '/ul>\n\t\t', index: 42, name: 'TEMPLATE_TEXT'}
		]);
	});

	it('lexes template text', () => {
		expect(lex('Random text')).toEqual([
			{
				contents: 'Random text',
				index: 0,
				name: 'TEMPLATE_TEXT'
			}
		]);

		// Note that the spec starts a new token whenever it sees a delimiting
		// sequence like "<" or "${" etc, and "<" always ends up being a token
		// of its own.
		expect(lex('one < two')).toEqual([
			{
				contents: 'one ',
				index: 0,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: '<',
				index: 4,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: ' two',
				index: 5,
				name: 'TEMPLATE_TEXT'
			}
		]);
	});

	it('lexes a complex attributes', () => {
		// A non-JSP tag.
		expect(
			lex(`
				<div class="browse-image-controls <%= (fileEntryId != 0) ? "hide" : StringPool.BLANK %>">
		`)
		).toEqual([
			{
				contents: '\n\t\t\t\t',
				index: 0,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: '<',
				index: 5,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents: 'div class="browse-image-controls ',
				index: 6,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents:
					'<%= (fileEntryId != 0) ? "hide" : StringPool.BLANK %>',
				index: 39,
				name: 'JSP_EXPRESSION'
			},
			{
				contents: '">\n\t\t',
				index: 92,
				name: 'TEMPLATE_TEXT'
			}
		]);

		// Contrast that with this invalid example that was in the
		// page.jsp fixture. Quotes in JSP-tags must be escaped as
		// per Section 1.6 of the JSP 2.3 spec, "Quoting and Escape
		// Conventions".
		expect(() => {
			lex(`
				<aui:nav cssClass="\${currentTab == tab ? 'active' : ''} foo abc <%= "scriptletblock" %>"></aui:nav>
		`);
		}).toThrow(/Failed to match .+ at: "scriptletblock/);

		// Escaping the quotes leads to a successful tokenization.
		expect(
			lex(`
				<aui:nav cssClass="\${currentTab == tab ? 'active' : ''} foo abc <%= \\"scriptletblock\\" %>"></aui:nav>
			`)
		).toEqual([
			{
				contents: '\n\t\t\t\t',
				index: 0,
				name: 'TEMPLATE_TEXT'
			},
			{
				contents:
					'<aui:nav cssClass="${currentTab == tab ? \'active\' : \'\'} foo abc <%= \\"scriptletblock\\" %>"></aui:nav>',
				index: 5,
				name: 'CUSTOM_ACTION'
			},
			{
				contents: '\n\t\t\t',
				index: 106,
				name: 'TEMPLATE_TEXT'
			}
		]);
	});

	describe('lexing entire fixtures', () => {
		test.each([
			'configuration.jsp',
			'edit_template_display.jspf',
			'page.jsp',
			'view_calendar_menus.jspf'
		])('%s matches snapshot', async fixture => {
			const source = await getFixture(path.join('format', fixture));

			expect(lex(source)).toMatchSnapshot();
		});
	});
});
