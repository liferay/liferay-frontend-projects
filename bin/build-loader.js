const globby = require('globby');
const {run} = require('./util');

run('webpack', '--env.flavor=debug');
run('webpack', '--env.flavor=prod');
run('webpack', '--env.flavor=min');

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
