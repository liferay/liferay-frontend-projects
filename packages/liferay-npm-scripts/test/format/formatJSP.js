/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const formatJSP = require('../../src/format/formatJSP');
const getFixture = require('../../support/getFixture');

describe('formatJSP()', () => {
	it('passes the blinking light test (configuration.jsp)', async () => {
		const source = await getFixture('format/configuration.jsp');

		expect(formatJSP(source)).toMatchSnapshot();
	});

	// Skipping this one due to what looks like (but isn't) invalid syntax.
	// Need to do a fallback for this kind of thing, I think.
	it.skip('passes the blinking light test (edit_template_display.jspf)', async () => {
		const source = await getFixture('format/edit_template_display.jspf');

		/*

		if (richEditor.getEditor().getSession().getUndoManager().hasUndo()) {
			Liferay.fire('<portlet:namespace />saveTemplate');
		}
		<c:if test="<%= template == null %>">
			else {
				editorContentElement.val(STR_EMPTY);
			}
		</c:if>

		*/

		expect(formatJSP(source)).toMatchSnapshot();
	});

	it('passes the blinking light test (page.jsp)', async () => {
		const source = await getFixture('format/page.jsp');

		expect(formatJSP(source)).toMatchSnapshot();
	});

	// Similar problem with <portlet:renderURL>...
	// No non-whitespace children, so should be a comment and not an `if()`.
	it.skip('passes the blinking light test (view_calendar_menus.jspf)', async () => {
		const source = await getFixture('format/view_calendar_menus.jspf');

		expect(formatJSP(source)).toMatchSnapshot();
	});
});
