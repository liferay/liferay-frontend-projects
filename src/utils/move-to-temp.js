const fs = require('fs');
const path = require('path');

const CWD = process.cwd();

function removeFromTemp(dir, fileName) {
	const filePath = path.join(dir, 'TEMP-' + fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, fileName));
	}
}

function moveToTemp(dir, fileName) {
	const filePath = path.join(dir, fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, 'TEMP-' + fileName));
	}
}

exports.removeFromTemp = removeFromTemp;
exports.moveToTemp = moveToTemp;
