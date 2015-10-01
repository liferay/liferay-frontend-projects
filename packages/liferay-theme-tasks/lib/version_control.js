'use strict';

var chalk = require('gulp-util').colors;
var updateNotifier = require('update-notifier');

module.exports = function() {
	var notifier = updateNotifier({
			pkg: require('../package.json'),
			updateCheckInterval: 1000
	});

	var update = notifier.update;

	if (update) {
		var seperator = chalk.yellow(new Array(65).join('-'));

		console.log(seperator);
		console.log(' You are running an old version of %s', chalk.cyan(update.name));
		console.log(' Run %s to install newest version', chalk.cyan('npm update', update.name));
		console.log(' Current version: %s Latest version: %s', chalk.green(update.current), chalk.green(update.latest));
		console.log(seperator);
	}
};