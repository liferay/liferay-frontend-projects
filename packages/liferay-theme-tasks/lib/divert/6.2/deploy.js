'use strict';

let path = require('path');

let themeUtil = require('../../util');

function taskCssFiles({pathBuild, gulp}, fastDeploy) {
	let srcPath = path.join(pathBuild, 'css/*.css');

	let {storage} = gulp;

	let filePath = storage.get('changedFile').path;

	if (!themeUtil.isSassPartial(filePath)) {
		let fileName = path.basename(filePath);

		srcPath = path.join(pathBuild, 'css', fileName);
	}

	return fastDeploy(srcPath, pathBuild);
}

module.exports = {taskCssFiles};
