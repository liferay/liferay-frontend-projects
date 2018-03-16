'use strict';

module.exports = function() {
	try {
		let chalk = require('gulp-util').colors;
		let updateNotifier = require('update-notifier');

		let notifier = updateNotifier({
			pkg: require('../package.json'),
			updateCheckInterval: 1000,
		});

		let update = notifier.update;

		if (update) {
			let message = [
				'You are running an old version of ' + chalk.cyan(update.name),
				'Run ' +
					chalk.cyan('npm update', update.name) +
					' to install newest version',
				'Current version: ' +
					chalk.green(update.current) +
					' Latest version: ' +
					chalk.green(update.latest),
			].join('\n');

			notifier.notify({
				message: message,
			});
		}
	} catch (err) {
		process.stdout.write(err);
	}
};
