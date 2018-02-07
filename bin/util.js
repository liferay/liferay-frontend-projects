const {spawnSync} = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const originalStripDebug = require('strip-debug');

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

const stripDebug = (inputFile, outputFile) => {
	const source = fs.readFileSync(inputFile).toString();
	const result = originalStripDebug(source).toString();
	fs.writeFileSync(outputFile, result);
};

module.exports = {copy, run, stripDebug};
