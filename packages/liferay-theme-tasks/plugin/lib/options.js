'use strict';

var _ = require('lodash');
var minimist = require('minimist');
var path = require('path');

module.exports = function(options) {
	var argv = minimist(process.argv.slice(2));

	var CWD = process.cwd();

	var distName = path.basename(CWD);

	var pkg;

	try {
		pkg = require(path.join(CWD, 'package.json'));

		distName = pkg.name;
	}
	catch(e) {
	}

	distName = options.distName || distName;

	if (/\${/.test(distName) && pkg) {
		var distNameTemplate = _.template(distName);

		distName = distNameTemplate(pkg);
	}

	options.argv = argv;
	options.distName = distName;
	options.pathDist = options.pathDist || 'dist';
	options.rootDir = options.rootDir || 'docroot';
	options.storeConfig = _.assign({
		name: 'LiferayPlugin',
		path: 'liferay-plugin.json'
	}, options.storeConfig);

	return options;
};
