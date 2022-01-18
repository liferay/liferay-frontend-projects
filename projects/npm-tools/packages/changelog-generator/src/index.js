/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const {cleanup, error, info, log, prompt, warn} = require('./console');
const git = require('./git');
const matchOption = require('./matchOption');
const printBanner = require('./printBanner');
const readYarnrc = require('./readYarnrc');
const yarn = require('./yarn');

const PLACEHOLDER_VERSION = '0.0.0-placeholder.0';

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

function formatDate(date) {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
}

/**
 * Conventional commit types, and equivalent human-readable labels, in the order
 * that we wish them to appear in the changelog.
 *
 * @see https://www.conventionalcommits.org/en/v1.0.0/
 */
const TYPES = {
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

function formatSections(sections) {
	return Array.from(sections.entries())
		.map(([type, entries]) => {
			if (entries.length) {
				return `### ${TYPES[type]}\n` + '\n' + entries.join('\n');
			}
		})
		.filter(Boolean)
		.join('\n\n');
}

async function generate({date, from, remote, to, version}) {
	const changes = await getChanges(from, to);

	const header = `## ${linkToVersion(version, remote)} (${formatDate(date)})`;

	const comparisonLink = linkToComparison(from, version, remote);

	const sections = parseChanges(changes, remote);

	const changeList = formatSections(sections);

	const contents =
		[header, comparisonLink, changeList].filter(Boolean).join('\n\n') +
		'\n';

	const breaking = !!sections.get('breaking').length;

	return [contents, breaking];
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
		}
		else {
			break;
		}
	}

	if (!changes.size) {
		warn(`No merges detected in range ${range}`);
	}

	return Array.from(changes.values());
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
 * If any of these special words are passed as a `version`, we'll try to derive
 * the actual version number automatically.
 */
const DERIVED_VERSIONS = new Set([
	'major',
	'minor',
	'patch',
	'premajor',
	'preminor',
	'prepatch',
	'prerelease',
]);

/**
 * Returns the next version number based on the provided options.
 *
 * This will either be an explicitly provided version number (via
 * the `--version`) switch, or a derived one based on the `--major`,
 * `--minor` (etc) options. Note that derived version numbers require
 * a well-formed `version` property in the package.json file in the
 * current working directory.
 */
async function getVersion(options) {
	if (DERIVED_VERSIONS.has(options.version)) {
		let currentVersion;

		try {
			const packageJson = JSON.parse(
				fs.readFileSync('package.json', 'utf8')
			);

			currentVersion = packageJson.version;

			if (!currentVersion && fs.existsSync('lerna.json')) {
				const lernaJson = JSON.parse(
					fs.readFileSync('lerna.json', 'utf8')
				);

				currentVersion = lernaJson.version;
			}
		}
		catch (_error) {

			// Ignore

		}

		currentVersion = currentVersion || '';

		let [, major, minor, patch, preid, prerelease] =
			currentVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:-(\w+)\.(\d+))?$/) ||
			[];

		if (major === undefined) {
			throw new Error(
				'Unable to extract version from "package.json"; ' +
					'please pass --version explicitly'
			);
		}

		// Precedence: --preid option > .yarnrc setting > previous id > default.

		if (options.preid) {
			preid = options.preid;
		}
		else {
			const settings = await readYarnrc();

			preid = settings.get('--version.preid') || preid || 'pre';
		}

		const prefix = await getVersionTagPrefix();

		switch (options.version) {
			case 'premajor':
				major++;
				minor = 0;
				patch = 0;
				prerelease = 0;
				break;

			case 'major':
				if (
					prerelease === undefined ||
					minor !== '0' ||
					patch !== '0'
				) {
					major++;
				}
				minor = 0;
				patch = 0;
				prerelease = undefined;
				break;

			case 'preminor':
				minor++;
				patch = 0;
				prerelease = 0;
				break;

			case 'minor':
				if (prerelease === undefined || patch !== '0') {
					minor++;
				}
				patch = 0;
				prerelease = undefined;
				break;

			case 'prepatch':
				patch++;
				prerelease = 0;
				break;

			case 'patch':
				if (prerelease === undefined) {
					patch++;
				}
				prerelease = undefined;
				break;

			case 'prerelease':
				if (prerelease !== undefined) {
					prerelease++;
				}
				else {
					patch++;
					prerelease = 0;
				}
				break;

			default:
				throw new Error('Unexpected version');
		}

		currentVersion = '';

		if (prerelease !== undefined) {
			currentVersion = `${major}.${minor}.${patch}-${preid}.${prerelease}`;
		}
		else {
			currentVersion = `${major}.${minor}.${patch}`;
		}

		return `${prefix}${currentVersion}`;
	}
	else {
		return options.version;
	}
}

/**
 * Returns a tag prefix that can be used to construct or find a version tag.
 *
 * -   If we're being run from a subdirectory in a monorepo and a ".yarnrc" file
 *     exists, we return its "version-tag-prefix".
 *
 *     For example, given a prefix of "my-package/v", then we can find matching
 *     tags using `git describe --match='my-package/v*'.
 *
 *     Likewise, if we're being run from the repo root and a ".yarnrc" file
 *     exists there.
 *
 *     For example, given a prefix of "v", then we can find matching tags using
 *     `git describe --match='v*'`.
 *
 * -   If we can't get a "version-tag-prefix", we use a fallback prefix of "".
 *
 *     With the fallback prefix of "", we can find matching tags using
 *     `git describe --match='*'`.
 *
 * If none of the above apply (eg. because we're being run from the
 * wrong directory), an error is thrown.
 */
async function getVersionTagPrefix() {
	const settings = await readYarnrc();

	const setting = settings.get('version-tag-prefix');

	if (setting) {
		const match = setting.match(/^"([^"]+)"$/);

		if (match) {
			return match[1];
		}
	}

	return '';
}

async function go(options) {
	const {outfile, to} = options;

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

	/* eslint-disable-next-line prefer-const */
	let [contents, breaking] = await generate({
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
			}
			catch (error) {

				// This will be the last chunk we generate.

				info('No more tags found (this is not an error) 🦄');
			}

			const date = await getDate(from);
			const [chunk] = await generate({
				date,
				from: previousVersion,
				remote,
				to: from,
				version: from,
			});
			contents += '\n' + chunk;

			from = previousVersion;
		}

		await write(options, contents, contents);

		written = contents.length;
	}
	else {
		let previousContents = '';

		try {
			previousContents = fs.readFileSync(outfile, 'utf8');
		}
		catch (error) {
			warn(`Cannot read previous file ${outfile}; will create anew.`);
		}

		if (previousContents.indexOf(`[${version}]`) !== -1) {
			const message = [
				`${outfile} already contains a reference to ${version}.`,
				'Did you mean to regenerate using the --regenerate switch?',
			];
			if (options.force) {
				warn(...message);
			}
			else {
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

		await write(options, contents, newContents);

		written = newContents.length;
	}

	if (options.interactive && options.version.endsWith(PLACEHOLDER_VERSION)) {
		info(`[--interactive] Would write ${outfile} ${written} bytes ✨`);

		if (breaking) {
			warn(
				'Breaking changes detected; "major" or "premajor" version recommended.'
			);
		}

		const answer = await prompt(
			'Please choose a version from the list, or provide one in full (or enter to abort):',
			Array.from(DERIVED_VERSIONS)
		);

		if (answer === '') {
			process.exit();
		}
		else {
			options.version = answer;

			options.version = await getVersion(options);

			return await go(options);
		}
	}
	else if (options.dryRun) {
		info(`[--dry-run] Would write ${outfile} ${written} bytes ✨`);
	}
	else {
		info(`Wrote ${outfile} ${written} bytes ✨`);
	}

	if (options.interactive && !options.dryRun) {
		info('[--interactive] git-diff preview 👀');

		const diff = await git(
			'-c',
			'color.diff=always',
			'diff',
			'--',
			options.outfile
		);

		log('');

		log(diff);

		const answer = await prompt(
			'Would you like to stage these changes? (y/n)',
			[]
		);

		if (/^y(es?)?$/i.test(answer)) {
			await git('add', '--', options.outfile);
		}
	}
}

function linkToComparison(from, to, remote) {
	if (remote && from) {
		return `[Full changelog](${remote}/compare/${from}...${to})`;
	}
	else {
		return null;
	}
}

function linkToPullRequest(number, remote) {
	if (isNaN(number)) {
		return null;
	}
	else if (remote) {
		const url = `${remote}/pull/${number}`;

		return `[\\#${number}](${url})`;
	}
	else {
		return `#${number}`;
	}
}

function linkToVersion(version, remote) {
	if (remote) {
		return `[${version}](${remote}/tree/${version})`;
	}
	else {
		return version;
	}
}

async function main(_node, _script, ...args) {
	printBanner(`
		@liferay/changelog-generator
		============================

		Reporting for duty!
	`);

	const options = await parseArgs(args);

	if (!options) {
		process.exit(1);
	}

	if (options.updateTags) {
		try {
			info('Fetching remote tags: run with --no-update-tags to skip');
			await git('remote', 'update');
		}
		catch (error) {
			warn('Failed to update tags: run with --no-update-tags to skip');
		}
	}

	try {
		await go(options);
	}
	finally {
		cleanup();
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
	}
	else {

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
		}
		else {
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
			}
			else {
				warn(
					`Replacing unexpected "${name}${v}" prefix with expected "${prefix}" prefix in version "${version}"`,
					'use --force to disable this coercion'
				);

				return `${prefix}${semver}`;
			}
		}
	}
	else {
		if (name || v) {
			if (force) {
				warn(
					`Version "${version}" has unexpected "${name}${v}" prefix`
				);
			}
			else {
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

async function parseArgs(args) {
	const options = {
		dryRun: false,
		outfile: './CHANGELOG.md',
		to: 'HEAD',
		updateTags: true,
	};

	if (
		!args.every((arg) =>
			matchOption(arg, {
				/* eslint-disable no-return-assign */
				'dry-run|d': (value) => (options.dryRun = value),
				'force|f': (value) => (options.force = value),
				'from=': (value) => (options.from = value),
				'help|h': () => {
					printUsage();
					process.exit();
				},
				'interactive|i': (value) => (options.interactive = value),
				'major': (value) => value && (options.version = 'major'),
				'minor': (value) => value && (options.version = 'minor'),
				'outfile=': (value) => (options.outfile = value),
				'patch': (value) => value && (options.version = 'patch'),
				'preid=': (value) => (options.preid = value),
				'premajor': (value) => value && (options.version = 'premajor'),
				'preminor': (value) => value && (options.version = 'preminor'),
				'prepatch': (value) => value && (options.version = 'prepatch'),
				'prerelease': (value) =>
					value && (options.version = 'prerelease'),
				'regenerate': (value) => (options.regenerate = value),
				'remote-url=': (value) => (options.remote = value),
				'to=': (value) => (options.to = value),
				'update-tags': (value) => (options.updateTags = value),
				'version=': (value) => (options.version = value),
				/* eslint-enable no-return-assign */
			})
		)
	) {
		return null;
	}

	if (!options.version) {
		if (options.dryRun || options.interactive) {
			const prefix = await getVersionTagPrefix();

			const version = `${prefix}${PLACEHOLDER_VERSION}`;

			const reason = options.interactive ? '--interactive' : '--dry-run';

			info(`[${reason}] Using phony version ${version}`);

			options.version = version;
		}
		else {
			error('Missing required option: --version; see --help for usage');

			return null;
		}
	}
	else {
		options.version = await getVersion(options);
	}

	return options;
}

/**
 * Aliases mapping common mistakes to legit Conventional Commits types.
 */
const ALIASES = {
	bug: 'fix',
	doc: 'docs',
	feature: 'feat',
};

const TYPE_REGEXP = /^\s*(\w+)(\([^)]+\))?(!)?:\s+.+/;

const BREAKING_TRAILER_REGEXP = /^BREAKING[ -]CHANGE:/m;

function parseChanges(changes, remote) {
	const sections = new Map(Object.keys(TYPES).map((type) => [type, []]));

	changes.forEach(({description, number}) => {
		const match = description.match(TYPE_REGEXP);

		const type = ALIASES[match && match[1]] || (match && match[1]);

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

	return sections;
}

function printUsage() {
	log(
		'',
		`${path.relative('.', __filename)} [option...]`,
		'',
		'Required options (at least one of):',
		'  --interactive|-i             Guided update (proposes version, shows preview etc)',
		'  --version=VERSION            Version being released',
		'  --major                      New major (increment "a" in "a.b.c")',
		'  --minor                      New minor (increment "b" in "a.b.c")',
		'  --patch                      New patch (increment "c" in "a.b.c")',
		'  --premajor                   New major prelease (increment "a" in "a.b.c-pre.0")',
		'  --preminor                   New minor prelease (increment "b" in "a.b.c-pre.0")',
		'  --prepatch                   New patch prelease (increment "c" in "a.b.c-pre.0")',
		'  --prerelease                 New prelease (increment "d" in "a.b.c-pre.d")',
		'',
		'Optional options:',
		'  --dry-run|-d                 Preview changes without writing to disk',
		'  --force|-f                   Disable safety checks',
		'  --from=FROM                  Starting point (default: previous tag)',
		'  --to=TO                      Ending point( default: "HEAD")',
		'  --no-update-tags             Disable tag prefetching',
		'  --outfile=FILE               Output filename (default: "./CHANGELOG.md")',
		'  --preid=ID                   Prerelease prefix (default: "pre")',
		'  --regenerate                 Overwrite instead of appending',
		'  --remote-url=REPOSITORY_URL  Remote repositor (default: inferred)',
		'',
		'Other options:',
		'  --help|-h                    Show this help then exit'
	);
}

/**
 * Depending on the `options` in effect:
 *
 * - Prints `preview` to standard output (eg. during `--dry-run`); or:
 * - Prints `contents` to the specified `outfile`.
 */
async function write(options, preview, contents) {
	if (options.dryRun || options.version.endsWith(PLACEHOLDER_VERSION)) {
		if (options.dryRun) {
			info(`[--dry-run] Preview of changes 👀`);
		}
		else if (options.interactive) {
			info(`[--interactive] Preview of changes 👀`);
		}

		process.stdout.write(preview + '\n');
	}
	else {
		fs.writeFileSync(options.outfile, contents);

		yarn('format');
	}
}

module.exports = {
	getVersion,
	main,
};
