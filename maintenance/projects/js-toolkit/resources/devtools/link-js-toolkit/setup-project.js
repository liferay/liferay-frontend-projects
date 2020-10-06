const path = require('path');

const {toolkitProjectNames, yarn} = require('./util');

const prjsDir = path.join(__dirname, '..', '..', '..', 'packages');

module.exports = function () {
	toolkitProjectNames.forEach((projectName) => {
		process.chdir(path.join(prjsDir, projectName));
		yarn('link');
	});
};
