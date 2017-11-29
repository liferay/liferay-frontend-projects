'use strict';

let path = require('path');

let {isSassPartial} = require('../common/util_helpers');

function getCssSrcPath(srcPath, config) {
	let changedFile = config.changedFile;

	let changed = changedFile && changedFile.type === 'changed';

	let argv = require('minimist')(process.argv.slice(2));
	let fullDeploy = argv.full || argv.f;

	let fastDeploy = !fullDeploy && config.deployed;

	if (changed && fastDeploy) {
		let filePath = changedFile.path;

		let fileDirname = path.dirname(filePath);
		let fileName = path.basename(filePath, '.css');

		if (path.basename(fileDirname) !== 'css' || isSassPartial(fileName)) {
			return srcPath;
		}

		srcPath = path.join(srcPath, '..', fileName + '.scss');
	}

	return srcPath;
}

let depModuleName = 'liferay-theme-deps-6.2';

module.exports = {getCssSrcPath, depModuleName};
