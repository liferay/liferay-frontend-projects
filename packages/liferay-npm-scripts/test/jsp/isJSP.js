/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const isJSP = require('../../src/jsp/isJSP');

describe('isJSP()', () => {
	it('recognizes ".jsp" files', () => {
		expect(isJSP('folder/file.jsp')).toBe(true);
		expect(isJSP('folder/file.JSP')).toBe(true);
	});

	it('recognizes ".jspf" files', () => {
		expect(isJSP('folder/file.jspf')).toBe(true);
		expect(isJSP('folder/file.JSPF')).toBe(true);
	});

	it('rejects ".java" files', () => {
		expect(isJSP('folder/file.java')).toBe(false);
	});

	it('rejects ".js" files', () => {
		expect(isJSP('folder/file.js')).toBe(false);
	});
});
