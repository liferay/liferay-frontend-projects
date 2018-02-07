const globby = require('globby');
const {run, stripDebug} = require('./util');

run('webpack', 'src/loader/bootstrap.js', 'build/loader/loader-debug.js');

stripDebug('build/loader/loader-debug.js', 'build/loader/loader.js');

run('uglifyjs', '-o', 'build/loader/loader-min.js', 'build/loader/loader.js');

run(
	...['jsdoc', '-d', 'build/jsdoc']
		.concat(['README.md'])
		.concat(
			globby.sync([
				'src/loader/**/*.js',
				'!src/loader/bootstrap.js',
				'!src/**/__tests__/**/*',
			])
		)
);
