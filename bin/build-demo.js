const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {copy, run} = require('./util');

if (!fs.existsSync('build/loader/loader-debug.js')) {
	run('npm', 'run', 'build');
}

copy('build/loader/loader-debug.js', 'build/demo/loader-debug.js');
copy('src/demo/index.html', 'build/demo/index.html');
copy('src/demo/modules2', 'build/demo/modules2');
copy('src/demo/modules3', 'build/demo/modules3');
copy('src/demo/packages', 'build/demo/packages');

globby.sync('src/demo/modules/**/*.js').forEach(file => {
	const filePath = file.substring('src/demo/modules/'.length);
	const dirname = path.dirname(filePath);

	fs.mkdirsSync(`build/demo/modules/${dirname}`);
	run(
		'babel',
		`src/demo/modules/${filePath}`,
		'--out-file',
		`build/demo/modules/${filePath}`
	);
});

fs.mkdirsSync(`build/demo/config`);
run(
	'liferay-cfgen',
	'-b',
	'src/demo/config/config-base.js',
	'-m',
	'src/demo/modules/bower.json',
	'-o',
	'build/demo/config/config.js',
	'-r',
	'build/demo/modules',
	'build/demo/modules'
);
