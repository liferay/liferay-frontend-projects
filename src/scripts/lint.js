const CWD = process.cwd();

const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawnSync');
const which = require('npm-which')(CWD);

const LINT_PATHS = getMergedConfig('npmscripts').lint;

/**
 * Main function for linting and formatting files
 * @param {boolean} fix Specify if the linter should auto-fix the files
 */
module.exports = function(fix) {
	const args = [...LINT_PATHS,];

	if (fix) {
		args.push('-i');
	}

	spawnSync(which.sync('csf'), args);
};
