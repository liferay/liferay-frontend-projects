/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';

/**
 * Log a line to stderr.
 */
function log(...args) {
	process.stderr.write(`${args.join('\n')}\n`);
}

/**
 * Log a line to stderr, using green formatting.
 */
function info(...args) {
	log(`${GREEN}${args.join('\n')}${RESET}`);
}

/**
 * Log a line to stderr, using error formatting.
 */
function error(...args) {
	log(`${RED}error: ${args.join('\n')}${RESET}`);
}

/**
 * Log a line to stderr, using warning formatting.
 */
function warn(...args) {
	log(`${YELLOW}warning: ${args.join('\n')}${RESET}`);
}

/**
 * Run `command` and return its stdout (via a Promise).
 */
function run(command, ...args) {
	return new Promise((resolve, reject) => {
		child_process.execFile(command, args, (err, stdout, stderr) => {
			if (err) {
				const invocation = `${command} ${args.join(' ')}`;
				log(
					`command: ${invocation}`,
					`stdout: ${stdout}`,
					`stderr: ${stderr}`
				);
				reject(new Error(`Command: "${invocation}" failed: ${err}`));
			} else {
				resolve(stdout);
			}
		});
	});
}

/**
 * Convenience wrapper for running a Git command and returning its output (via a
 * Promise).
 */
function git(...args) {
	return run('git', ...args);
}

/**
 * Return the date corresponding to the supplied `commitish`.
 */
async function getDate(commitish) {
	const timestamp = (
		await git('log', -'1', commitish, '--pretty=format:%at')
	).trim();

	return new Date(+timestamp * 1000);
}

async function getPreviousReleasedVersion(before, tagPattern) {
	const describe = await git(
		'describe',
		'--abbrev=0',
		'--tags',
		`--match=${tagPattern}`,
		`${before}~`
	);

	return describe.trim();
}

async function getChanges(from, to) {
	const range = from ? `${from}..${to}` : to;

	const log = await git(
		'log',
		'--merges',
		range,
		'--numstat',
		'-m',
		'--first-parent',
		'--relative',
		'--pretty=format:%x00%H%x00%B%x00'
	);

	const changes = new Map();

	const COMMIT = new RegExp(
		'\0' + // Delimiter.
		'([^\0]*)' + // Commit hash.
		'\0' + // Delimiter.
		'([^\0]*)' + // Commit message.
		'\0' + // Delimiter.
		'(\\n(?:-|\\d+)\\s+(?:-|\\d+)\\s+[^\\n]+)*' + // Optional file stat info.
			'\\n\\n?',
		'g'
	);

	while (true) {
		const match = COMMIT.exec(log);

		if (match) {
			const [, hash, message, info] = match;

			if (info) {
				const [subject, description] = message.split(/\n+/);
				const metadata = subject.match(/Merge pull request #(\d+)/);
				const number = metadata ? metadata[1] : NaN;

				if (description) {
					changes.set(hash, {
						description: description.trim(),
						number,
					});
				}
			}
		} else {
			break;
		}
	}

	if (!changes.size) {
		warn(`No merges detected in range ${range}`);
	}

	return Array.from(changes.values());
}

/**
 * Returns the URL of the remote repository, or `null` if it cannot be
 * determined.
 */
async function getRemote(options) {
	if (options.remote) {
		return options.remote;
	}

	const remotes = await git('remote', '-v');
	const lines = remotes.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(
			/\bgithub\.com[/:]liferay\/(\S+?)(?:\.git)?\s/i
		);
		if (match) {
			return `https://github.com/liferay/${match[1]}`;
		}
	}

	warn(
		'Unable to determine remote repository URL!',
		'Please specify one with --remote-url=REPOSITORY_URL'
	);

	return null;
}

/**
 * Escape `string` suitable for embedding in a Markdown document.
 */
function escape(string) {
	// At the moment, not escaping some special Markdown characters (such as *,
	// backticks etc) as they may prove useful.

	return string
		.replace(/_/g, '\\_')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function linkToComparison(from, to, remote) {
	if (remote && from) {
		return `[Full changelog](${remote}/compare/${from}...${to})`;
	} else {
		return null;
	}
}

function linkToPullRequest(number, remote) {
	if (isNaN(number)) {
		return null;
	} else if (remote) {
		const url = `${remote}/pull/${number}`;

		return `[\\#${number}](${url})`;
	} else {
		return `#${number}`;
	}
}

function linkToVersion(version, remote) {
	if (remote) {
		return `[${version}](${remote}/tree/${version})`;
	} else {
		return version;
	}
}

/**
 * Conventional commit types, and equivalent human-readable labels, in the order
 * that we wish them to appear in the changelog.
 *
 * @see https://www.conventionalcommits.org/en/v1.0.0/
 */
const types = {
	/* eslint-disable sort-keys */

	// Not a Conventional Commits type; we repeat breaking changes separately to
	// maximize their visibility:

	breaking: ':boom: Breaking changes',

	feat: ':new: Features',
	fix: ':wrench: Bug fixes',
	perf: ':racing_car: Peformance',
	docs: ':book: Documentation',
	chore: ':house: Chores',
	refactor: ':woman_juggling: Refactoring',
	style: ':nail_care: Style',
	test: ':eyeglasses: Tests',
	revert: ':leftwards_arrow_with_hook: Reverts',

	// Not a Conventional Commits type; this is our catch-all:

	misc: ':package: Miscellaneous',

	/* eslint-enable sort-keys */
};

/**
 * Aliases mapping common mistakes to legit Conventional Commits types.
 */
const aliases = {
	bug: 'fix',
	doc: 'docs',
	feature: 'feat',
};

const TYPE_REGEXP = /^\s*(\w+)(\([^)]+\))?(!)?:\s+.+/;

const BREAKING_TRAILER_REGEXP = /^BREAKING[ -]CHANGE:/m;

async function formatChanges(changes, remote) {
	const sections = new Map(Object.keys(types).map((type) => [type, []]));

	changes.forEach(({description, number}) => {
		const match = description.match(TYPE_REGEXP);

		const type = aliases[match && match[1]] || (match && match[1]);

		const section = sections.get(type) || sections.get('misc');

		const link = linkToPullRequest(number, remote);

		const entry = link
			? `-   ${escape(description)} (${link})`
			: `-   ${escape(description)}`;

		section.push(entry);

		const breaking =
			(match && match[3]) || BREAKING_TRAILER_REGEXP.test(description);

		if (breaking) {
			sections.get('breaking').push(entry);
		}
	});

	return Array.from(sections.entries())
		.map(([type, entries]) => {
			if (entries.length) {
				return `### ${types[type]}\n` + '\n' + entries.join('\n');
			}
		})
		.filter(Boolean)
		.join('\n\n');
}

/**
 * Prints `message` in a silly banner like this:
 *  ____________________
 * (_)                  `
 *   |                  |
 *   |   changelog.js   |
 *   |   ============   |
 *   |                  |
 *   |   Reporting      |
 *   |   for duty!      |
 *   |                  |
 *   |__________________|
 *   (_)_________________)
 *
 */
function printBanner(message) {
	const lines = message.split('\n').map((line) => line.trim());

	const width = lines.reduce((max, line) => {
		return Math.max(max, line.length);
	}, 0);

	const TEMPLATE = [
		[' _____', '_', '___  '],
		['(_)   ', ' ', '   ` '],
		['  |   ', '*', '   | '],
		['  |___', '_', '___| '],
		['  (_)_', '_', '____)'],
	];

	let banner = '';

	TEMPLATE.forEach(([left, middle, right]) => {
		if (middle === '*') {
			lines.forEach((line) => {
				banner +=
					left +
					line +
					' '.repeat(width - line.length) +
					right +
					'\n';
			});
		} else {
			banner += left + middle.repeat(width) + right + '\n';
		}
	});

	log(banner);
}

function relative(filePath) {
	return path.relative('.', filePath);
}

function printUsage() {
	log(
		'',
		`${relative(__filename)} [option...]`,
		'',
		'Options:',
		'  --force|-f                   [optional: disable safety checks]',
		'  --from=FROM                  [default: previous tag]',
		'  --to=TO                      [default: HEAD]',
		'  --help|-h',
		'  --no-update-tags             [optional: disable tag prefetching]',
		'  --outfile=FILE               [default: ./CHANGELOG.md]',
		'  --remote-url=REPOSITORY_URL  [default: inferred]',
		'  --regenerate                 [optional: replace entire changelog]',
		'  --version=VERSION            [required: version being released]'
	);
}

function option(name) {
	if (name.endsWith('=')) {
		return new RegExp(`^(?:--{1,2})${name}(.+)`);
	} else {
		return new RegExp(`^(?:--{0,2})(?:${name})$`);
	}
}

const V_PREFIX_REGEX = /^v\d/;

//  Regex to take a version number and extract:
//
//  1. Package name prefix (if present).
//  2. "v" (if present).
//  3. Valid semver version.
//
//  Examples
//
//      package-name/v1.2.3-alpha.1+build.10
//      =>  name: "package-name/"
//          v: "v"
//          semver version: "1.2.3-alpha.1+build.10"
//
//      package-name/1.2.3-alpha.1+build.10
//      =>  name: "package-name/"
//          v: undefined
//          semver version: "1.2.3-alpha.1+build.10"
//
//      v1.2.3-alpha.1+build.10
//      =>  name: "",
//          v: "v"
//          semver version: "1.2.3-alpha.1+build.10"
//
//      1.2.3-alpha.1+build.10
//      =>  name: "",
//          v: undefined,
//          semver version: "1.2.3-alpha.1+build.10"
//
// If semver version is not valid, behavior is undefined. :troll:
//
// See: https://semver.org/
//

const VERSION_REGEX = /^(.*?)(\bv)?(\d+\.\d+\.\d+(?:-[0-9a-z-]+(?:\.[0-9a-z-]+)*)?(?:\+[0-9a-z-]+(?:\.[0-9a-z-]+)*)?)$/i;

/**
 * Make sure `version` starts with the appropriate prefix:
 *
 * - "some-tag-prefix/v" read from a `.yarnrc` file (if present); or:
 * - "v", if that's the convention in the current project; or vice versa:
 * - not "v" (ie. remove an unwanted prefix), if that is not the
 *   convention.
 */
async function normalizeVersion(version, {force}, versionTagPrefix) {
	let prefix = '';

	if (versionTagPrefix) {
		// We know the desired prefix (from the .yarnrc).

		prefix = versionTagPrefix;
	} else {
		// Try to guess the right prefix ("v" or nothing) based on existing
		// tags.

		const tags = (await git('tag', '-l')).trim().split('\n');

		// Calculate a "coefficient" that reflects the likelihood that
		// this repo uses a "v" prefix by convention.

		const coefficient = tags.reduce((current, tag) => {
			return current + (V_PREFIX_REGEX.test(tag) ? 1 : -1);
		}, 0);

		if (coefficient > 0) {
			prefix = 'v';
		}
	}

	const match = version.match(VERSION_REGEX);

	if (!match) {
		if (force) {
			warn(`Version "${version}" does not match expected pattern`);

			return version;
		} else {
			warn(
				`Version "${version}" does not match expected pattern`,
				'run again with --force to proceed anyway'
			);

			throw new Error('Unexpected version format');
		}
	}

	const name = match[1];
	const v = match[2] || '';
	const semver = match[3];

	if (prefix) {
		if (prefix !== name + v) {
			if (force) {
				warn(
					`Version "${version}" is missing expected "${prefix}" prefix`
				);
			} else {
				warn(
					`Replacing unexpected "${name}${v}" prefix with expected "${prefix}" prefix in version "${version}"`,
					'use --force to disable this coercion'
				);

				return `${prefix}${semver}`;
			}
		}
	} else {
		if (name || v) {
			if (force) {
				warn(
					`Version "${version}" has unexpected "${name}${v}" prefix`
				);
			} else {
				warn(
					`Removing unexpected "${name}${v}" prefix from "${version}"`,
					'use --force to disable this coercion'
				);

				return semver;
			}
		}
	}

	return version;
}

function parseArgs(args) {
	const options = {
		dryRun: false,
		outfile: './CHANGELOG.md',
		to: 'HEAD',
		updateTags: true,
	};

	let match;
	args.forEach((arg) => {
		match = arg.match(option('dry-run|d'));
		if (match) {
			options.dryRun = true;

			return;
		}

		match = arg.match(option('force|f'));
		if (match) {
			options.force = true;

			return;
		}

		match = arg.match(option('help|h'));
		if (match) {
			printUsage();
			process.exit();
		}

		match = arg.match(option('outfile='));
		if (match) {
			options.outfile = match[1];

			return;
		}

		match = arg.match(option('from='));
		if (match) {
			options.from = match[1];

			return;
		}

		match = arg.match(option('(no-)?update-tags'));
		if (match) {
			options.updateTags = !match[1];

			return;
		}

		match = arg.match(option('remote-url='));
		if (match) {
			options.remote = match[1];

			return;
		}

		match = arg.match(option('regenerate'));
		if (match) {
			options.regenerate = true;

			return;
		}

		match = arg.match(option('to='));
		if (match) {
			options.to = match[1];

			return;
		}

		match = arg.match(option('version='));
		if (match) {
			options.version = match[1];

			return;
		}

		error(`Unrecognized argument ${arg}; see --help for available options`);

		return null;
	});

	if (!options.version) {
		error('Missing required option: --version; see --help for usage');

		return null;
	}

	return options;
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
}

async function generate({date, from, remote, to, version}) {
	const changes = await getChanges(from, to);

	const header = `## ${linkToVersion(version, remote)} (${formatDate(date)})`;

	const comparisonLink = linkToComparison(from, version, remote);

	const changeList = await formatChanges(changes, remote);

	return (
		[header, comparisonLink, changeList].filter(Boolean).join('\n\n') + '\n'
	);
}

/**
 * Returns a tag prefix that can be used to construct or find a version tag.
 *
 * -   If we're being run from a "packages/$PACKAGE" subdirectory in a
 *     monorepo and a ".yarnrc" file exists, we return its "version-tag-prefix".
 *
 *     For example, given a prefix of "my-package/v", then we can find matching
 *     tags using `git-describe`--match='my-package/v*'".
 *
 * -   If we can't get a "version-tag-prefix", or if we're being run from the repo
 *     root, we use a fallback prefix of "".
 *
 *     With the fallback prefix of "", we can find matching tags using
 *     `git-describe --match='*'`.
 *
 * It none of the above apply (eg. because we're not being run from the repo
 * root), an error is thrown.
 */
async function getVersionTagPrefix() {
	const root = (await git('rev-parse', '--show-toplevel')).trim();

	const cwd = process.cwd();

	const basename = path.basename(cwd);

	const project = path.join(root, 'packages', basename);

	let prefix;

	if (cwd === project) {
		try {
			const contents = await readFileAsync(
				path.join(cwd, '.yarnrc'),
				'utf8'
			);

			contents.split(/\r\n|\r|\n/).find((line) => {
				const match = line.match(/^\s*version-tag-prefix\s+"([^"]+)"/);

				if (match) {
					prefix = match[1];

					return true;
				}
			});
		} catch (_error) {
			// No readable .yarnrc.
		}
	} else if (cwd !== root) {
		throw new Error(
			`Expected to run from repo root (${path.relative(
				cwd,
				root
			)}) or "packages/*" but was run from ${cwd}`
		);
	}

	return prefix || '';
}

async function main(_node, _script, ...args) {
	const options = parseArgs(args);
	if (!options) {
		process.exit(1);
	}
	const {outfile, to, updateTags} = options;

	printBanner(`
		changelog.js
		============

		Reporting
		for duty!
	`);

	if (updateTags) {
		try {
			info('Fetching remote tags: run with --no-update-tags to skip');
			await git('remote', 'update');
		} catch (err) {
			warn('Failed to update tags: run with --no-update-tags to skip');
		}
	}

	const versionTagPrefix = await getVersionTagPrefix();

	const tagPattern = `${versionTagPrefix}*`;

	const version = await normalizeVersion(
		options.version,
		options,
		versionTagPrefix
	);

	const remote = await getRemote(options);
	let from = await getPreviousReleasedVersion(to, tagPattern);
	const date = await getDate(to);
	let contents = await generate({
		date,
		from,
		remote,
		to,
		version,
	});

	let written = 0;
	if (options.regenerate) {
		while (from && from !== options.from) {
			let previousVersion = null;
			try {
				previousVersion = await getPreviousReleasedVersion(
					from,
					tagPattern
				);
			} catch (err) {
				// This will be the last chunk we generate.

				info('No more tags found (this is not an error) 🦄');
			}

			const date = await getDate(from);
			const chunk = await generate({
				date,
				from: previousVersion,
				remote,
				to: from,
				version: from,
			});
			contents += '\n' + chunk;

			from = previousVersion;
		}

		if (options.dryRun) {
			process.stdout.write(contents + '\n');
		} else {
			await writeFileAsync(outfile, contents);
		}
		written = contents.length;
	} else {
		let previousContents = '';
		try {
			previousContents = await readFileAsync(outfile, 'utf8');
		} catch (error) {
			warn(`Cannot read previous file ${outfile}; will create anew.`);
		}

		if (previousContents.indexOf(`[${version}]`) !== -1) {
			const message = [
				`${outfile} already contains a reference to ${version}.`,
				'Did you mean to regenerate using the --regenerate switch?',
			];
			if (options.force) {
				warn(...message);
			} else {
				error(
					...message,
					'Alternatively, proceed anyway by using the --force switch.'
				);
				process.exit(1);
			}
		}

		const newContents = [contents, previousContents]
			.filter(Boolean)
			.join('\n');

		if (options.dryRun) {
			process.stdout.write(contents + '\n');
		} else {
			await writeFileAsync(outfile, newContents);
		}

		written = newContents.length;
	}

	if (options.dryRun) {
		info(`[--dry-run] Would write ${outfile} ${written} bytes ✨`);
	} else {
		info(`Wrote ${outfile} ${written} bytes ✨`);
	}
}

module.exports = main;
