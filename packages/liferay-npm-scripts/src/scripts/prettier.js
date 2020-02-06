/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const prettier = require('prettier');

const isJSP = require('../jsp/isJSP');
const {format} = require('../prettier');
const formatJSP = require('../jsp/formatJSP');
const getMergedConfig = require('../utils/getMergedConfig');
const getPaths = require('../utils/getPaths');

const EXTENSIONS = ['.js', '.jsp', '.jspf', '.scss'];

const IGNORE_FILE = '.prettierignore';

/**
 * Exposes a version of our augumented Prettier suitable for use within editors
 * and editor plugins.
 */
module.exports = function(...args) {
	let i;

	let files = [];

	const ignore = () => {};

	const options = {};

	const set = function(key, value) {
		if (arguments.length === 2) {
			return () => {
				options[key] = value;
			};
		} else {
			return value => {
				options[key] = value;
			};
		}
	};

	const unsupported = () => {
		throw new Error(`Unsupported option ${args[i]}`);
	};

	const OPTS = {
		'-c': unsupported,
		'--check': unsupported,
		'-l': unsupported,
		'--list-different': unsupported,
		'--write': set('write', true),
		'--arrow-parens=': ignore,
		'--no-bracket-spacing': ignore,
		'--end-of-line=': ignore,
		'--html-whitespace-sensitivity=': ignore,
		'--jsx-bracket-same-line': ignore,
		'--jsx-single-quote': ignore,
		'--parser=': ignore,
		'--print-width=': ignore,
		'--prose-wrap=': ignore,
		'--quote-props=': ignore,
		'--no-semi': ignore,
		'--single-quote': ignore,
		'--tab-width=': ignore,
		'--trailing-comma=': ignore,
		'--use-tabs': ignore,
		'--vue-indent-script-and-style': ignore,
		'--config=': ignore,
		'--no-config': ignore,
		'--config-precedence=': ignore,
		'--no-editorconfig': ignore,
		'--find-config-path=': ignore,
		'--ignore-path=': ignore,
		'--plugin=': ignore,
		'--plugin-search-dir=': ignore,
		'--with-node-modules': ignore,
		'--cursor-offset=': ignore,
		'--range-end=': ignore,
		'--range-start': ignore,
		'--no-color': ignore,
		'--file-info=': ignore,
		'-h': ignore,
		'--help': ignore,
		'--insert-pragma': ignore,
		'--loglevel=': ignore,
		'--require-pragma': ignore,
		'--stdin': set('stdin', true),
		'--stdin-filepath=': set('stdinFilepath'),
		'--support-info': () => {
			const info = prettier.getSupportInfo();

			write(JSON.stringify(info, null, 2));

			exit();
		},
		'-v': version,
		'--version': version
	};

	for (i = 0; i < args.length; i++) {
		const arg = args[i];

		let handler;

		Object.entries(OPTS).find(([option, callback]) => {
			if (option.endsWith('=')) {
				if (arg === option.slice(0, -1)) {
					// eg. "--some-opt value"
					value = args[++i];

					handler = callback.bind(null, value);
				} else if (arg.startsWith(option)) {
					// eg. "--some-opt=value"
					value = arg.slice(option.length);

					handler = callback.bind(null, value);
				}
			} else if (arg === option) {
				// eg. "--flag"
				handler = callback;
			}

			return handler;
		});

		if (handler) {
			handler();
		} else if (arg.startsWith('-')) {
			// Unknown option, just ignore it.
		} else if (isGlob(arg)) {
			getPaths([arg], [], IGNORE_FILE).forEach(filepath => {
				files.push({
					contents: null,
					filepath
				});
			});
		} else {
			files.push({
				contents: null,
				filepath: arg
			});
		}
	}

	const config = getMergedConfig('prettier');

	if (options.stdin) {
		// When `--stdin` is in effect, Prettier ignores file arguments
		// and the `--write` option, requires --stdin-filepath, and
		// prints the output to stdout.
		if (!options.stdinFilepath) {
			throw new Error(`No --stdin-filepath provided`);
		}

		options.write = false;

		files = [
			{
				contents: fs.readFileSync(0, 'utf8'),
				filepath: options.stdinFilepath
			}
		];
	}

	if (!files.length) {
		throw new Error('No matching files');
	}

	files.forEach(({contents, filepath}) => {
		contents =
			contents === null ? fs.readFileSync(filepath, 'utf8') : contents;

		const prettierOptions = {
			...config,
			filepath
		};

		if (isJSP(filepath)) {
			contents = formatJSP(contents, prettierOptions);
		} else {
			contents = format(contents, prettierOptions);
		}

		if (options.write) {
			fs.writeFileSync(filepath, contents);
		} else {
			write(contents);
		}
	});
};

function exit() {
	process.exit(0);
}

function isGlob(pattern) {
	return pattern.startsWith('!') || pattern.includes('*');
}

function version() {
	write(prettier.version);

	exit();
}

function write(message) {
	const newline = message.endsWith('\n' ? '' : '\n');

	process.stdout.write(message + newline);
}
