import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';
import readJsonSync from 'read-json-sync';
import yargs from 'yargs';

const argv = yargs
	// Input folder where source modules live
	.option('input', {
		alias: 'i',
		default: 'classes/META-INF/resources/node_modules',
	})
	// Output folder where bridge modules must be placed
	.option('output', {
		alias: 'o',
		default: 'classes/META-INF/resources/bridge',
	})
	// The glob expression to filter source modules
	.option('file-globs', {
		alias: 'g',
		default: '**/lib/**/*.js',
	})
	// A mapper to convert source file paths to destination file paths
	.option('dest-file-mapper', {
		alias: 'f',
		default: '(.*)\\$(.*)@.*/lib/(.*):$2/src/$3',
	})
	// A mapper to convert source file paths to source module names
	.option('src-mod-name-mapper', {
		alias: 's',
		default: '(.*)@[^/]*(.*)\\.js$:$1$2',
	})
	// A mapper to convert destination file paths to destination module names
	.option('dest-mod-name-mapper', {
		alias: 'd',
		default: '(.*)\\.js$:bridge/$1',
	})
	// Whether or not to explain what's going on
	.option('verbose', {
		alias: 'v',
		default: false,
	}).argv;

// Template used to generate bridges
const template = `Liferay.Loader.define('{PKG_NAME}@{PKG_VERSION}/{DEST_MOD}', ['module', '{SRC_MOD}'], function (module, src) {
  module.exports = src;
});
`;

/**
 * Main entry point
 * @return {void}
 */
export default function main() {
	const input = argv.input;
	const output = argv.output;
	const fileGlobs = argv.fileGlobs.split(',');
	const destFileMapper = parseMapperArg(argv.destFileMapper);
	const srcModNameMapper = parseMapperArg(argv.srcModNameMapper);
	const destModNameMapper = parseMapperArg(argv.destModNameMapper);
	const pkgJson = readJsonSync('./package.json');

	globby
		.sync(fileGlobs, {
			cwd: input,
		})
		.forEach(srcFile => {
			const destFile = srcFile.replace(...destFileMapper);
			const srcMod = srcFile.replace(...srcModNameMapper);
			const destMod = destFile.replace(...destModNameMapper);
			const absDestFile = path.join(output, destFile);

			let contents = template;

			contents = contents.replace('{PKG_NAME}', pkgJson.name);
			contents = contents.replace('{PKG_VERSION}', pkgJson.version);
			contents = contents.replace('{SRC_MOD}', srcMod);
			contents = contents.replace('{DEST_MOD}', destMod);

			fs.mkdirsSync(path.dirname(absDestFile));
			fs.writeFileSync(absDestFile, contents);

			log(srcFile, '->', destFile);
		});
}

/**
 * Parse a mapper type argument and return it as a two items array.
 * @param  {String} mapperArg a RegExp and replace value expression separated by a colon
 * @return {Array} an array with two items: the RegExp and the replace value
 */
function parseMapperArg(mapperArg) {
	const mapper = mapperArg.split(':');
	mapper[0] = new RegExp(mapper[0]);
	return mapper;
}

/**
 * Log a message if verbose argument is active.
 * @param  {Array} args arguments given to the function
 * @return {void}
 */
function log(...args) {
	if (argv.verbose) {
		console.log(...args);
	}
}
