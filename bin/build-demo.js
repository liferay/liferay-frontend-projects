const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {copy, run} = require('./util');

if (!fs.existsSync('build/loader/loader-debug.js')) {
	run('npm', 'run', 'build');
}

copy('build/loader/loader-debug.js', 'build/demo/loader-debug.js');
copy('src/demo/index.html', 'build/demo/index.html');
copy('src/demo/config.js', 'build/demo/config.js');

fs.mkdirsSync(`build/demo/resolutions`);
globby.sync('src/demo/resolutions/*').forEach(file => {
	const filePath = file.substring('src/demo/resolutions/'.length);

	copy(
		`src/demo/resolutions/${filePath}`,
		`build/demo/resolutions/${filePath}`
	);
});

globby.sync('src/demo/modules/**/*.js').forEach(file => {
	console.log(file);
	const filePath = file.substring('src/demo/modules/'.length);
	const dirname = path.dirname(filePath);

	fs.mkdirsSync(`build/demo/modules/${dirname}`);

	copy(`src/demo/modules/${filePath}`, `build/demo/modules/${filePath}`);
});
