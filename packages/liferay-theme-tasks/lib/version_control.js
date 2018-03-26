'use strict';

module.exports = function() {
	try {
		let colors = require('ansi-colors');
		let updateNotifier = require('update-notifier');

		let notifier = updateNotifier({
			pkg: require('../package.json'),
			updateCheckInterval: 1000,
		});

		let update = notifier.update;

		if (update) {
			let message = [
				'You are running an old version of ' + colors.cyan(update.name),
				'Run ' +
					colors.cyan('npm update', update.name) +
					' to install newest version',
				'Current version: ' +
					colors.green(update.current) +
					' Latest version: ' +
					colors.green(update.latest),
			].join('\n');

			notifier.notify({
				message: message,
			});
		}
	} catch (err) {
		process.stdout.write(err);
	}
};
