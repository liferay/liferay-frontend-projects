const {spawnSync} = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const copy = (input, output) =>
	fs.copySync(input, output, {
		filter: filePath => {
			if (path.basename(filePath).indexOf('.') == 0) return false;
			return true;
		},
	});

const run = (binary, ...args) =>
	spawnSync(binary, args, {
		stdio: 'inherit',
	});

module.exports = {copy, run};
