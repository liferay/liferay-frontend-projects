/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const formatJSP = require('../../src/format/formatJSP');
const getFixture = require('../../support/getFixture');

describe('formatJSP()', () => {
	it('deals with interleaved JS control structures and JSP tags', () => {
		// eg. an `if()` that is conditionally added augmented with an `else()`
		// based on a tag.
		const source = `
			<p>Hi!</p>
			<script>
				if (richEditor.getEditor().getSession().getUndoManager().hasUndo()) {
					Liferay.fire('<portlet:namespace />saveTemplate');
				}
				<c:if test="<%= template == null %>">
					else {
						editorContentElement.val(STR_EMPTY);
					}
				</c:if>
			</script>
		`;

		// Note that Prettier keeps the `else()` in the right place due to
		// special casing in the notes in the tagReplacements() implementation.
		expect(formatJSP(source)).toBe(`
			<p>Hi!</p>
			<script>
				if (
					richEditor
						.getEditor()
						.getSession()
						.getUndoManager()
						.hasUndo()
				) {
					Liferay.fire('<portlet:namespace />saveTemplate');
				}
				<c:if test="<%= template == null %>">
					else {
						editorContentElement.val(STR_EMPTY);
					}
				</c:if>
			</script>
		`);
	});

	it('pads input so that Prettier syntax errors have accurate line numbers', () => {
		const source = `
			<p>Hi!</p>

			<p>Some content.</p>

			<p>Some more content.</p>

			<p>Even more content.</p>

			<script>
				if (success()) {
					Liferay.fire('success');
				} else
					alert('Error!');

					// Without padding, Prettier would report an error on the
					// following line as having happened at (8:1).
				}
			</script>
		`;

		expect(() => formatJSP(source)).toThrow(/Unexpected token \(17:1\)/);
	});

	describe('formatting entire fixtures', () => {
		test.each([
			'configuration.jsp',
			'edit_template_display.jspf',
			'page.jsp',
			'recaptcha.jsp',
			'roles.jsp',
			'view.jsp',
			'view_calendar_menus.jspf',
			'view_meeting.jsp'

			// Not including these (rejected by Prettier, see "known
			// limiations" below):
			// 'edit_content_redirect.jsp',
		])('%s matches snapshot', async fixture => {
			const source = await getFixture(path.join('format', fixture));

			expect(formatJSP(source)).toMatchSnapshot();
		});
	});

	describe('known limitations', () => {
		it('cannot deal with conditionals at the end of object literals', () => {
			// This one from "edit_content_redirect.jsp": note that without
			// trailing commas after the "redirect" and "refresh" properties,
			// Prettier will report a syntax error. We can't add commas to
			// either because that would break IE 11.
			const source = `
				<aui:script>
					Liferay.fire(
						'closeWindow',
						{
							id: '<portlet:namespace />editAsset',
							portletAjaxable: true,

							<c:choose>
								<c:when test="<%= redirect != null %>">
									redirect: '<%= HtmlUtil.escapeJS(redirect) %>'
								</c:when>
								<c:otherwise>
									refresh: '<%= portletDisplay.getId() %>'
								</c:otherwise>
							</c:choose>
						}
					);
				</aui:script>
			`;

			expect(() => formatJSP(source)).toThrow(
				/Unexpected token, expected ","/
			);
		});
	});
});
