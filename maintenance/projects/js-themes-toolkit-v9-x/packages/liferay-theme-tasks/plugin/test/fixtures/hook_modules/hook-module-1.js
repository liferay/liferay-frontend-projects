/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

var {EventEmitter} = require('events');

module.exports = function(gulp) {
	gulp.hook('before:build', () => {
		var eventEmitter = new EventEmitter();

		// Simulates the end of an async gulp stream
		setTimeout(() => {
			eventEmitter.emit('end');
		}, 200);

		return eventEmitter;
	});
};
