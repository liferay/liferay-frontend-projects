'use strict';

module.exports = function() {
	try {
		var chalk = require('gulp-util').colors;
		var updateNotifier = require('update-notifier');

		var notifier = updateNotifier({
			pkg: require('../package.json'),
			updateCheckInterval: 1000
		});

		var update = notifier.update;

		if (update) {
			var message = [
				'You are running an old version of ' + chalk.cyan(update.name),
				'Run ' + chalk.cyan('npm update', update.name) + ' to install newest version',
				'Current version: ' + chalk.green(update.current) + ' Latest version: ' + chalk.green(update.latest)
			].join('\n');

			notifier.notify({
				message: message
			});
		}
	}
	catch (err) {
	}
};
