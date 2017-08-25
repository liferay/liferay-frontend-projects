import fs from 'fs';
import path from 'path';

/**
 * Create a full folder path with parents if necessary.
 * @param {String} dir a path to a directory to be created
 * @return {void}
 */
export function mkdirp(dir) {
	const info = path.parse(dir);

	if (info.dir != '') {
		mkdirp(info.dir);
	}

	try {
		fs.mkdirSync(dir);
	} catch (err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
}
