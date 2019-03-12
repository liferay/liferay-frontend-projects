const path = require('path');

const CWD = process.cwd();
const PATH = path.resolve(`${__dirname}/../../node_modules/.bin`);

const {spawn,} = require('cross-spawn');

/**
 * Wrapper function for spawning a synchronous process.
 * @param {string} command Path to bin file
 * @param {Array=} args=[] List of string arguments
 * @param {Object=} options={} Options to pass to spawn.sync
 */
module.exports = function(command, args = [], options = {}) {
	const env = process.env;

	env.PATH = `${PATH}:${env.PATH}`;

	spawn.sync(command, args, {
		cwd: CWD,
		env,
		stdio: 'inherit',
		...options,
	});
};
