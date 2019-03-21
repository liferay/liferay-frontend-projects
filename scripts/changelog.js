#!/usr/bin/env node

/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Crude and unsophisticated script for generating or updating CHANGELOG.md
 * based on Git history.
 *
 * In the name of simplicity, it assumes that you are using a recent
 * version of Node (ie. it uses modern JS with no transpilation), and it has no
 * external dependencies other than `git`.
 *
 * The generated changelog is based on the merge commits produced by GitHub,
 * which means that the quality of the changelog depends on the quality of the
 * pull request titles. Additionally, if you create merge commits by hand rather
 * than using GitHub, or if you push changes without creating merges, the
 * results may be suboptimal.
 *
 * Operates in two modes:
 *
 * - Invoked as `changelog.js --version=x.y.z`: will update the existing
 *   CHANGELOG.md in preparation for the "x.y.z" release by looking at changes
 *   made since the previous release and prepending them to the top.
 * - Invoked as `changelog.js --regenerate --version=x.y.z`: will regenerate
 *   and overwrite the existing CHANGELOG.md, in preparation for the "x.y.z"
 *   release.
 *
 * The idea is that is you ever want to make edits by hand you can, and the way
 * you preserve them over time is by running `git add --patch` to selectively
 * apply newly generated changes while keeping previous manual edits intact.
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
function log(message) {
	process.stderr.write(`${message}\n`);
}

/**
 * Log a line to stderr, using green formatting.
 */
function info(message) {
	log(`${GREEN}${message}${RESET}`);
}

/**
 * Log a line to stderr, using error formatting.
 */
function error(message) {
	log(`${RED}error: ${message}${RESET}`);
}

/**
 * Log a line to stderr, using warning formatting.
 */
function warn(message) {
	log(`${YELLOW}warning: ${message}${RESET}`);
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
					`command: ${invocation}\n` +
						`stdout: ${stdout}\n` +
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
	const timestamp = (await git(
		'log',
		-'1',
		commitish,
		'--pretty=format:%at'
	)).trim();

	return new Date(+timestamp * 1000);
}

async function getPreviousReleasedVersion(before) {
	const describe = await git('describe', '--abbrev=0', `${before}~`);
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
		const match = lines[i].match(/\bgithub.com\/liferay\/(\S+)(?:\.git)?/i);
		if (match) {
			return `https://github.com/liferay/${match[1]}`;
		}
	}

	warn(
		[
			'Unable to determine remote repository URL!',
			'Please specify one with --remote-url=REPOSITORY_URL',
		].join('\n')
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
				return `- ${escape(description)} (${link})`;
			} else {
				return `- ${escape(description)}`;
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
		['  (_)_', '_', '____)'],
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
	[
		'',
		`${relative(__filename)} [option...]`,
		'',
		'Options:',
		'  --from=FROM                  [default: previous tag]',
		'  --to=TO                      [default: HEAD]',
		'  --help',
		'  --outfile=FILE               [default: ./CHANGELOG.md]',
		'  --remote-url=REPOSITORY_URL  [default: inferred]',
		'  --regenerate                 [optional: replace entire changelog]',
		'  --version=VERSION            [required: version being released]',
	].forEach(log);
}

function option(name) {
	if (name.endsWith('=')) {
		return new RegExp(`^(?:--{1,2})${name}(.+)`);
	} else {
		return new RegExp(`^(?:--{0,2})${name}$`);
	}
}

function parseArgs(args) {
	const options = {
		outfile: './CHANGELOG.md',
		to: 'HEAD',
	};

	let match;
	args.forEach(arg => {
		match = arg.match(option('help'));
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

async function generate({from, to, date, remote, version}) {
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
	const {outfile, to, version} = options;

	printBanner(`
		changelog.js
		============

		Reporting
		for duty!
	`);

	const remote = await getRemote(options);
	let from = await getPreviousReleasedVersion(to);
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
				version: from,
			});
			contents += '\n' + chunk;

			from = previousVersion;
		}

		await writeFileAsync(outfile, contents);
		written = contents.length;
	} else {
		let previousContents = '';
		try {
			previousContents = (await readFileAsync(outfile)).toString();
		} catch (error) {
			warn(`Cannot read previous file ${outfile}; will create anew.`);
		}

		if (previousContents.indexOf(`[${version}]`) !== -1) {
			warn(
				[
					`${outfile} already contains a reference to ${version}.`,
					'Did you mean to regenerate using the --regenerate switch?',
				].join('\n')
			);
		}

		const newContents = [contents, previousContents]
			.filter(Boolean)
			.join('\n');
		await writeFileAsync(outfile, newContents);
		written = newContents.length;
	}

	info(`Wrote ${outfile} ${written} bytes ✨`);
}

main(...process.argv).catch(error => {
	log(error);
	process.exit(1);
});
