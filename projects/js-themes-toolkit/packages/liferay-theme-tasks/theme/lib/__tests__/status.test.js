/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const status = require('../../lib/status.js');

it('status should return appropriate status message', () => {
	let statusMessage = status({
		baseTheme: {
			name: 'parent-theme',
			version: '1.2.3',
		},
	});

	expect(!/Themelets:/.test(statusMessage)).toBe(true);
	expect(/Base theme:/.test(statusMessage)).toBe(true);
	expect(/parent-theme v1\.2\.3/.test(statusMessage)).toBe(true);

	statusMessage = status({
		baseTheme: 'unstyled',
		themeletDependencies: {
			'themelet-1': {
				name: 'themelet-1',
				version: '3.2.1',
			},
		},
	});

	expect(/Base theme:/.test(statusMessage)).toBe(true);
	expect(/themelet-1 v3\.2\.1/.test(statusMessage)).toBe(true);
	expect(/Themelets:/.test(statusMessage)).toBe(true);
	expect(/unstyled/.test(statusMessage)).toBe(true);

	statusMessage = status({});

	expect(!/Themelets:/.test(statusMessage)).toBe(true);
	expect(/Base theme:/.test(statusMessage)).toBe(true);
	expect(/no base theme specified/.test(statusMessage)).toBe(true);
});
