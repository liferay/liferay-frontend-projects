/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const prettier = require('../prettier');
const color = require('../utils/color');
const expandGlobs = require('../utils/expandGlobs');
const findRoot = require('../utils/findRoot');
const getMergedConfig = require('../utils/getMergedConfig');
const git = require('../utils/git');
const log = require('../utils/log');
const spawnSync = require('../utils/spawnSync');
const configureTypeScript = require('./configureTypeScript');
const getTypeScriptDependencyGraph = require('./getTypeScriptDependencyGraph');

/**
 * Runs the TypeScript compiler, `tsc`, in the current working directory.
 *
 * Currently in liferay-portal we use either webpack or Babel to do
 * code-generation; `tsc` is only doing type-checking and emitting type
 * definitions.
 *
 * Returns `true` on success, `false` if type-checking completed
 * successfully but the definitions were stale. In all other cases
 * throws an error.
 */
async function runTSC() {
	const graph = getTypeScriptDependencyGraph();

	const config = configureTypeScript(graph);

	spawnSync('tsc', ['--emitDeclarationOnly']);

	// Format the generated files, because: https://git.io/JYNZp

	await postProcess(config);

	// Check for stale (uncommitted) type artifacts.

	const output = git('status', '--porcelain', '--', 'types');

	if (output.length) {
		const root = findRoot() || '';

		const location = path.relative(root, path.join(process.cwd(), 'types'));

		log(
			`${color.YELLOW}${color.BOLD}`,
			'***************',
			'*** WARNING ***',
			'***************',
			'',
			'Out-of-date TypeScript build artifacts at:',
			'',
			`    ${location}`,
			'',
			'Please commit them.',
			'',
			output,
			color.RESET
		);

		return false;
	}

	return true;
}

/**
 * Removes stale definition files when the source file no longer exists.
 * For example, if you rename or remove a file, we need to make sure and
 * remove the old stale definitions.
 */
function removeStaleFile(filepath, baseDir) {
	const relativePath = filepath.replace(path.normalize(baseDir) + '/', '');

	// Remove .d.ts extension

	const sourceFileNoExt = path
		.join(process.cwd(), relativePath)
		.replace('.d.ts', '');

	const sourceFileTS = sourceFileNoExt + '.ts';
	const sourceFileTSX = sourceFileNoExt + '.tsx';

	if (!fs.existsSync(sourceFileTS) && !fs.existsSync(sourceFileTSX)) {
		// eslint-disable-next-line no-console
		console.log('Source file does not exist. Removing: ', filepath);

		fs.unlinkSync(filepath);

		return true;
	}

	return false;
}

async function postProcess({compilerOptions: {outDir: baseDir}}) {
	if (!fs.existsSync(baseDir)) {
		return;
	}

	const paths = expandGlobs(['**/*.d.ts'], [], {baseDir});

	if (!paths.length) {
		return;
	}

	const config = getMergedConfig('prettier');

	for (const filepath of paths) {
		try {
			const removed = removeStaleFile(filepath, baseDir);

			if (removed) {
				continue;
			}

			const source = fs.readFileSync(filepath, 'utf8');

			const prettierOptions = {
				...config,
				filepath,
			};

			const formatted = await prettier.format(source, prettierOptions);

			// Fix missing trailing space after license header.

			const fixed = formatted.replace(
				/^\/\*\*\n(?: \*[^\n]*\n)* \*\/\n[^\n]/,
				(match) => {
					return match.slice(0, -1) + '\n' + match.slice(-1);
				}
			);

			fs.writeFileSync(filepath, fixed);
		}
		catch {

			// Shouldn't happen, but could be a syntax error.

		}
	}
}

module.exports = runTSC;
