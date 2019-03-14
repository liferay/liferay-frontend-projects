var EventEmitter = require('events').EventEmitter;

module.exports = function(gulp) {
	gulp.hook('before:build', function() {
		var eventEmitter = new EventEmitter;

		// Simulates the end of an async gulp stream
		setTimeout(function() {
			eventEmitter.emit('end');
		}, 200);

		return eventEmitter;
	});
};
