'use strict';

var chai = require('chai');
var chalk = require('gulp-util').colors;
var status = require('../../lib/status.js');

var assert = chai.assert;

describe('Status', function() {
	it('should return appropriate status message', function() {
		var statusMessage = status({
			baseTheme: {
				name: 'parent-theme',
				version: '1.2.3'
			}
		});

		assert(!/Themelets:/.test(statusMessage));
		assert(/Base theme:/.test(statusMessage));
		assert(/parent-theme v1\.2\.3/.test(statusMessage));

		statusMessage = status({
			baseTheme: 'unstyled',
			themeletDependencies: {
				'themelet-1': {
					name: 'themelet-1',
					version: '3.2.1'
				}
			}
		});

		assert(/Base theme:/.test(statusMessage));
		assert(/themelet-1 v3\.2\.1/.test(statusMessage));
		assert(/Themelets:/.test(statusMessage));
		assert(/unstyled/.test(statusMessage));

		statusMessage = status({});

		assert(!/Themelets:/.test(statusMessage));
		assert(/Base theme:/.test(statusMessage));
		assert(/no base theme specified/.test(statusMessage));
	});
});
