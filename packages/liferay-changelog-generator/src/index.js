/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

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

async function getPreviousReleasedVersion(before) {
	const describe = await git(
		'describe',
		'--abbrev=0',
		'--tags',
		`${before}~`
	);

	return describe.trim();
}

async function getChanges(from, to) {
	const range = from ? `${from}..${to}` : to;
	const changes = await git(
		'log',
		'--merges',
		range,
		'--pretty=format:%B',
		'-z'
	);

	if (changes.length) {
		return changes
			.split('\0')
			.map(message => {
				const [subject, description] = message.split(/\n+/);
				const metadata = subject.match(/Merge pull request #(\d+)/);
				const number = metadata ? metadata[1] : NaN;

				return description ? {description, number} : null;
			})
			.filter(Boolean);
	} else {
		warn(`No merges detected from ${from} to ${to}!`);

		return [];
	}
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

async function formatChanges(changes, remote) {
	return changes
		.map(({description, number}) => {
			const link = linkToPullRequest(number, remote);
			if (link) {
				return `-   ${escape(description)} (${link})`;
			} else {
				return `-   ${escape(description)}`;
			}
		})
		.join('\n');
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
	const lines = message.split('\n').map(line => line.trim());

	const width = lines.reduce((max, line) => {
		return Math.max(max, line.length);
	}, 0);

	const TEMPLATE = [
		[' _____', '_', '___  '],
		['(_)   ', ' ', '   ` '],
		['  |   ', '*', '   | '],
		['  |___', '_', '___| '],
		['  (_)_', '_', '____)']
	];

	let banner = '';

	TEMPLATE.forEach(([left, middle, right]) => {
		if (middle === '*') {
			lines.forEach(line => {
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

const NUMBER_PREFIX_REGEX = /^\d/;
const V_PREFIX_REGEX = /^v\d/;

/**
 * Make sure `version` starts with "v", if that's the convention in this
 * project, and vice versa: remove an unwanted prefix, if that is not the
 * convention.
 */
async function normalizeVersion(version, {force}) {
	const tags = (await git('tag', '-l')).trim().split('\n');

	// Calculate a "coefficient" that reflects the likelihood that this repo
	// uses a "v" prefix by convention.
	const coefficient = tags.reduce((current, tag) => {
		return current + (V_PREFIX_REGEX.test(tag) ? 1 : -1);
	}, 0);

	const hasPrefix = V_PREFIX_REGEX.test(version);
	const hasNumber = NUMBER_PREFIX_REGEX.test(version);

	if (coefficient > 0 && !hasPrefix) {
		if (force || !hasNumber) {
			warn(`Version "${version}" is missing expected "v" prefix`);
		} else {
			warn(
				`Adding expected "v" prefix to version "${version}"`,
				'use --force to disable this coercion'
			);

			return `v${version}`;
		}
	} else if (coefficient < 0 && hasPrefix) {
		if (force) {
			warn(`Version "${version}" has unexpected "v" prefix`);
		} else if (version.length > 1) {
			warn(
				`Removing unexpected "v" prefix from "${version}"`,
				'use --force to disable this coercion'
			);

			return version.slice(1);
		}
	}

	return version;
}

function parseArgs(args) {
	const options = {
		outfile: './CHANGELOG.md',
		to: 'HEAD',
		updateTags: true
	};

	let match;
	args.forEach(arg => {
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
	const day = date
		.getDate()
		.toString()
		.padStart(2, '0');

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

	const version = await normalizeVersion(options.version, options);

	const remote = await getRemote(options);
	let from = await getPreviousReleasedVersion(to);
	const date = await getDate(to);
	let contents = await generate({
		date,
		from,
		remote,
		to,
		version
	});

	let written = 0;
	if (options.regenerate) {
		while (from && from !== options.from) {
			let previousVersion = null;
			try {
				previousVersion = await getPreviousReleasedVersion(from);
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
				version: from
			});
			contents += '\n' + chunk;

			from = previousVersion;
		}

		await writeFileAsync(outfile, contents);
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
				'Did you mean to regenerate using the --regenerate switch?'
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
		await writeFileAsync(outfile, newContents);
		written = newContents.length;
	}

	info(`Wrote ${outfile} ${written} bytes ✨`);
}

module.exports = main;
