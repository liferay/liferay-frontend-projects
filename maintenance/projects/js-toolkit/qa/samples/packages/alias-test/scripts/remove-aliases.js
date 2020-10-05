const fs = require('fs');
const globby = require('globby');
const path = require('path');
const readJsonSync = require('read-json-sync');

const buildDirPath = path.join(__dirname, '..', 'build');

globby
	.sync('**/package.json', {
		absolute: true,
		cwd: buildDirPath,
	})
	.forEach((pkgJsonPath) => {
		const pkgJson = readJsonSync(pkgJsonPath);

		delete pkgJson.browser;

		fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '\t'));
	});
