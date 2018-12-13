const fs = require('fs');
const path = require('path');

const CWD = process.cwd();

function remove(dir, fileName) {
	const filePath = path.join(dir, 'TEMP-' + fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, fileName));
	}
}

function write(dir, fileName) {
	const filePath = path.join(dir, fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, 'TEMP-' + fileName));
	}
}

exports.remove = remove;
exports.write = write;
