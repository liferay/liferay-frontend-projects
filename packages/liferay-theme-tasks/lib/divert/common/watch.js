'use strict';

const deployTask = 'deploy:gogo';

function taskWatch(
	options,
	startWatch,
	startWatchSocket,
	webBundleDir,
	connectParams
) {
	let gulp = options.gulp;
	let store = gulp.storage;
	let runSequence = require('run-sequence').use(gulp);

	options.watching = true;

	store.set('appServerPathPlugin', webBundleDir);

	runSequence(
		'build',
		'watch:clean',
		'watch:osgi:clean',
		'watch:setup',
		function(err) {
			if (err) {
				throw err;
			}

			let watchSocket = startWatchSocket();

			watchSocket
				.connect(connectParams)
				.then(function() {
					return watchSocket.deploy();
				})
				.then(function() {
					store.set('webBundleDir', 'watching');

					startWatch();
				});
		}
	);
}

module.exports = {
	deployTask,
	taskWatch,
};
