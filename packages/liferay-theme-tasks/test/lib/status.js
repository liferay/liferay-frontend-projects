'use strict';

let test = require('ava');

let status = require('../../lib/status.js');

test('status should return appropriate status message', function(t) {
	let statusMessage = status({
		baseTheme: {
			name: 'parent-theme',
			version: '1.2.3',
		},
	});

	t.true(!/Themelets:/.test(statusMessage));
	t.true(/Base theme:/.test(statusMessage));
	t.true(/parent-theme v1\.2\.3/.test(statusMessage));

	statusMessage = status({
		baseTheme: 'unstyled',
		themeletDependencies: {
			'themelet-1': {
				name: 'themelet-1',
				version: '3.2.1',
			},
		},
	});

	t.true(/Base theme:/.test(statusMessage));
	t.true(/themelet-1 v3\.2\.1/.test(statusMessage));
	t.true(/Themelets:/.test(statusMessage));
	t.true(/unstyled/.test(statusMessage));

	statusMessage = status({});

	t.true(!/Themelets:/.test(statusMessage));
	t.true(/Base theme:/.test(statusMessage));
	t.true(/no base theme specified/.test(statusMessage));
});
