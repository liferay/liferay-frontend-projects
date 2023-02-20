/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const ALIASES = {
	ci: ['format:check', 'lint', 'test'],
};

const SUBCOMMANDS = {
	build,
	format,
	'format:check': formatCheck,
	help,
	lint,
	'lint:fix': lintFix,
	publish,
	test,
};

const FORMAT_GLOBS = ['"**/*.{js,json,md,ts,yml}"', '"**/.*.{js,ts,yml}"'];

const LINT_GLOBS = ['"**/*.{js,ts}"', '"**/.*.{js,ts}"'];

function build(...args) {
	if (args.length) {
		print.warn(
			`ignoring additional arguments to \`build\`: ${args.join(' ')}`
		);
	}

	npm('--prefix', getRoot(), 'workspaces', 'run', 'build');
}

function format(...args) {
	if (args.length) {
		print.warn(
			`ignoring additional arguments to \`format\`: ${args.join(' ')}`
		);
	}

	npm(
		'--prefix',
		getRoot(),
		'exec',
		'liferay-npm-scripts',
		'prettier',
		'--write',
		...FORMAT_GLOBS
	);
}

function formatCheck(...args) {
	if (args.length) {
		print.warn(
			`ignoring additional arguments to \`format:check\`: ${args.join(
				' '
			)}`
		);
	}

	npm(
		'--prefix',
		getRoot(),
		'exec',
		'liferay-npm-scripts',
		'prettier',
		'--list-different',
		...FORMAT_GLOBS
	);
}

/**
 * Npm may set the `cwd` to the top-level, but we can detect
 * subdirectory runs via `INIT_CWD`.
 */
function getLocal() {
	return process.env.INIT_CWD || process.cwd();
}

function getRoot() {
	let cwd = process.cwd();

	while (true) {
		const pkg = path.join(cwd, 'package.json');

		try {
			const json = JSON.parse(fs.readFileSync(pkg, 'utf8'));

			if (Array.isArray(json.workspaces)) {
				return cwd;
			}
		}
		catch {

			// Keep looking.

		}

		const next = path.dirname(cwd);

		if (next === cwd) {
			break;
		}

		cwd = next;
	}

	return process.cwd();
}

function help() {
	print('Usage: liferay-workspace-scripts SUBCOMMAND... [ARG...]\n');

	print('  Subcommands:\n');

	Object.keys(SUBCOMMANDS)
		.sort()
		.forEach((subcommand) => {
			print(`       liferay-workspace-scripts ${subcommand}`);
		});

	print();

	print('  Aliases:\n');

	Object.keys(ALIASES)
		.sort()
		.forEach((alias) => {
			print(
				`       ${alias} (shorthand for: "${ALIASES[alias].join(' ')}")`
			);
		});

	print();
}

function lint(...args) {
	if (args.length) {
		print.warn(
			`ignoring additional arguments to \`lint\`: ${args.join(' ')}`
		);
	}

	npm('--prefix', getRoot(), 'exec', 'eslint', ...LINT_GLOBS);
}

function lintFix(...args) {
	if (args.length) {
		print.warn(
			`ignoring additional arguments to \`lint:fix\`: ${args.join(' ')}`
		);
	}

	npm('--prefix', getRoot(), 'exec', 'eslint', '--fix', ...LINT_GLOBS);
}

async function main() {
	const {args, subcommands} = parseArgs(process.argv.slice(2));

	if (!subcommands.length) {
		help();

		process.exit(1);
	}

	const failed = [];

	for (const subcommand of subcommands) {
		try {
			await SUBCOMMANDS[subcommand](...args);
		}
		catch (error) {
			failed.push(subcommand);

			print.error(error);
		}
	}

	if (failed.length) {
		print.error(
			`Failed jobs: ${failed.length} (of ${subcommands.length}):\n\n` +
				failed.map((subcommand) => `    ${subcommand}\n`)
		);

		process.exit(1);
	}
}

function npx(...args) {
	print(`Running: npx ${args.join(' ')}`);

	const {error, signal, status} = child_process.spawnSync('npx', args, {
		shell: true,
		stdio: 'inherit',
	});

	if (status !== 0) {
		throw new Error(
			`npx ${args.join(
				' '
			)} exited with status: ${status}, error: ${error}, signal: ${signal}`
		);
	}
}
function parseArgs(args) {
	const subcommands = [];

	while (args.length) {
		if (args[0] in ALIASES) {
			args.unshift(...ALIASES[args.shift()]);
		}
		else if (args[0] in SUBCOMMANDS) {
			subcommands.push(args.shift());
		}
		else {
			break;
		}
	}

	return {
		args,
		subcommands,
	};
}

function print(line = '') {
	process.stderr.write(`${line}\n`);
}
print.error = (line) => print(`error: ${line}`);

print.warn = (line) => print(`warning: ${line}`);

function publish() {
	const local = getLocal();

	const root = getRoot();

	if (local === root) {
		throw new Error('Cannot publish from root level');
	}

	npx('liferay-js-publish');
}

function test(...args) {
	const local = getLocal();

	const root = getRoot();

	if (local !== root) {
		npm(
			'--prefix',
			getRoot(),
			'exec',
			'jest',
			'--passWithNoTests',
			path.basename(local),
			...args
		);
	}
	else {
		npm(
			'--prefix',
			getRoot(),
			'exec',
			'jest',
			'--passWithNoTests',
			...args
		);
	}
}

function npm(...args) {
	print(`Running: npm ${args.join(' ')}`);

	const {error, signal, status} = child_process.spawnSync('npm', args, {
		shell: true,
		stdio: 'inherit',
	});

	if (status !== 0) {
		throw new Error(
			`npm ${args.join(
				' '
			)} exited with status: ${status}, error: ${error}, signal: ${signal}`
		);
	}
}

module.exports = main;
