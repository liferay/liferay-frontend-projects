/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const prettier = require('prettier');

const formatJSP = require('../jsp/formatJSP');
const isJSP = require('../jsp/isJSP');
const {format} = require('../prettier');
const getMergedConfig = require('../utils/getMergedConfig');
const getPaths = require('../utils/getPaths');

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
		'--arrow-parens=': ignore,
		'--check': unsupported,
		'--config=': ignore,
		'--config-precedence=': ignore,
		'--cursor-offset=': ignore,
		'--end-of-line=': ignore,
		'--file-info=': ignore,
		'--find-config-path=': ignore,
		'--help': ignore,
		'--html-whitespace-sensitivity=': ignore,
		'--ignore-path=': ignore,
		'--insert-pragma': ignore,
		'--jsx-bracket-same-line': ignore,
		'--jsx-single-quote': ignore,
		'--list-different': unsupported,
		'--loglevel=': ignore,
		'--no-bracket-spacing': ignore,
		'--no-color': ignore,
		'--no-config': ignore,
		'--no-editorconfig': ignore,
		'--no-semi': ignore,
		'--parser=': ignore,
		'--plugin=': ignore,
		'--plugin-search-dir=': ignore,
		'--print-width=': ignore,
		'--prose-wrap=': ignore,
		'--quote-props=': ignore,
		'--range-end=': ignore,
		'--range-start': ignore,
		'--require-pragma': ignore,
		'--single-quote': ignore,
		'--stdin': set('stdin', true),
		'--stdin-filepath=': set('stdinFilepath'),
		'--support-info': () => {
			const info = prettier.getSupportInfo();

			write(JSON.stringify(info, null, 2));

			exit();
		},
		'--tab-width=': ignore,
		'--trailing-comma=': ignore,
		'--use-tabs': ignore,
		'--version': version,
		'--vue-indent-script-and-style': ignore,
		'--with-node-modules': ignore,
		'--write': set('write', true),
		'-c': unsupported,
		'-h': ignore,
		'-l': unsupported,
		'-v': version
	};

	for (i = 0; i < args.length; i++) {
		const arg = args[i];

		let handler;

		Object.entries(OPTS).find(([option, callback]) => {
			if (option.endsWith('=')) {
				if (arg === option.slice(0, -1)) {
					// eg. "--some-opt value"
					const value = args[++i];

					handler = callback.bind(null, value);
				} else if (arg.startsWith(option)) {
					// eg. "--some-opt=value"
					const value = arg.slice(option.length);

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
	const newline = message.endsWith('\n') ? '' : '\n';

	process.stdout.write(message + newline);
}
