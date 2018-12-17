const fs = require('fs');
const path = require('path');

const CWD = process.cwd();

/**
 * Removes TEMP- portion of the file name
 * @param {string} dir Directory where to find the file
 * @param {string} fileName Name of the file
 */
function removeFromTemp(dir, fileName) {
	const filePath = path.join(dir, 'TEMP-' + fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, fileName));
	}
}

/**
 * Renames file as TEMP-{fileName}
 * @param {string} dir Directory where to find the file
 * @param {string} fileName Name of the file
 */
function moveToTemp(dir, fileName) {
	const filePath = path.join(dir, fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, 'TEMP-' + fileName));
	}
}

exports.removeFromTemp = removeFromTemp;
exports.moveToTemp = moveToTemp;
