const lintScript = require('./lint');

/**
 * Main function for formatting files
 */
module.exports = function() {
	lintScript(true);
};
