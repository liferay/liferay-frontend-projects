'use strict';

const deployTask = 'deploy';

function taskWatch(
	options,
	startWatch,
	startWatchSocket,
	webBundleDir,
	connectParams
) {
	options.watching = true;

	startWatch();
}

module.exports = {
	deployTask,
	taskWatch,
};
