const CWD = process.cwd();

const getMergedConfig = require('../utils/get-merged-config');
const {spawn} = require('cross-spawn');
const which = require('npm-which')(CWD);

const LINT_PATHS = getMergedConfig('npmscripts').lint;

module.exports = function(fix) {
	const args = [...LINT_PATHS];

	if (fix) {
		args.push('-i');
	}

	spawn.sync(which.sync('csf'), args, {
		cwd: CWD,
		stdio: 'inherit'
	});
};
