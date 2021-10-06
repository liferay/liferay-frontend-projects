#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const {promisify} = require('util');

const accessAsync = promisify(fs.access);
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const FILTER_PATTERN = /\.md$/;

/**
 * Use not-robot-like headers to attempt to prevent Cloudflare from
 * rejecting our external link checks with 403 or 503 status.
 *
 * See: https://github.com/liferay/liferay-frontend-guidelines/issues/133
 */
const HEADERS = {
	Accept:
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Encoding': 'gzip, deflate, br',
	'Accept-Language': 'en-US,en;q=0.8,es-ES;q=0.5,es;q=0.3',
	DNT: '1',
	'User-Agent':
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:74.0) Gecko/20100101 Firefox/74.0',
};

const IGNORE_DIR = /^(?:.git|node_modules)$/;

const IGNORE_HOSTS = new Set([

	// localhost and variants:

	'0.0.0.0',
	'127.0.0.1',
	'::1',
	'localhost',

	// As of https://github.com/liferay/liferay-frontend-guidelines/pull/161
	// Cloudflare is 503-ing all "bot-like" codepen.io requests.

	'codepen.io',
]);

// Adapted from: https://stackoverflow.com/a/163684/2103996

const URL_PATTERN = /\bhttps?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/;

let errorCount = 0;

async function check(link, files) {
	if (URL_PATTERN.test(link)) {
		await checkRemote(link, files);
	}
	else if (/^#/.test(link)) {
		await checkInternal(link, files);
	}
	else {
		await checkLocal(link, files);
	}
}

async function checkInternal(link, files) {
	for (const file of files) {
		const contents = await readFileAsync(file, 'utf8');

		const targets = new Set();

		contents.replace(/^#+\s+(.+?)\s*$/gm, (match, heading) => {

			// To make a target anchor, GitHub:
			// - Extracts link text from Markdown links.
			// - Turns spaces, hyphens, commas into hyphens.
			// - Removes backticks, colons.

			const target = heading
				.replace(/^\[([^\\]+)\].*$/, (_match, text) => {
					return text;
				})
				.replace(/[ -,]+/g, '-')
				.replace(/[`:/]/g, '');

			// Lowercase because the browser matches case-insensitively.

			targets.add(target.toLowerCase());

			return match;
		});

		// When we write in source:
		//
		//      <code id="text-wrappedField">wrappedField</code>
		//
		// GitHub renders:
		//
		//      <code id="user-content-text-wrappedfield">wrappedField</code>
		//

		contents.replace(/<\w+[^>]+\s\bid="([^"]*)"/g, (match, codeId) => {
			targets.add(codeId.toLowerCase());

			return match;
		});

		if (!targets.has(link.slice(1).toLowerCase())) {
			report(
				file,
				`No heading or id found matching internal target: ${link}`
			);
		}
	}
}

async function checkLocal(link, files) {
	const [base, fragment] = link.split('#');

	for (const file of files) {
		let target;

		if (path.isAbsolute(base)) {

			// Resolve relative to repo root.

			target = path.join(__dirname, '..', base);
		}
		else {

			// Resolve relative to current file's directory.

			target = path.join(path.dirname(file), base);
		}

		try {
			await accessAsync(target);
		}
		catch (error) {
			report(file, `No file/directory found for local target: ${target}`);
		}

		if (fragment) {
			await checkInternal(`#${fragment}`, new Set([target]));
		}
	}
}

function checkRemote(link, files) {
	return new Promise((resolve) => {
		const bail = (problem) => {
			report(files, problem);
			resolve();
		};

		const {hostname, pathname, port, search} = new URL(link);

		if (IGNORE_HOSTS.has(hostname)) {
			resolve();

			return;
		}

		const request = http.get(
			{
				headers: HEADERS,
				host: hostname,
				path: `${pathname}${search}`,
				port,
			},
			({statusCode}) => {
				if (statusCode >= 200 && statusCode < 400) {
					resolve();
				}
				else if (statusCode === 403) {
					warn(
						files,
						`Cannot verify ${link} due to forbidden client (HTTP 403)`
					);
					resolve();
				}
				else if (statusCode === 429) {
					warn(
						files,
						`Cannot verify ${link} due to rate-limiting (HTTP 429 Too Many Requests)`
					);
					resolve();
				}
				else {
					bail(`Status code ${statusCode} for remote link: ${link}`);
				}
			}
		);

		request.on('error', (error) => {

			// Trim stack trace.

			const text = error.toString().split(/\n/)[0];

			bail(`Failed request (${text}) for remote link: ${link}`);
		});
	});
}

async function enqueueFile(file, pending) {
	const contents = await readFileAsync(file, 'utf8');

	const links = extractLinks(contents, file);

	links.forEach((link) => {
		if (!pending.has(link)) {
			pending.set(link, new Set());
		}
		pending.get(link).add(file);
	});
}

/**
 * Look for links as described here:
 * https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#links
 */
function extractLinks(contents, file) {
	const definitions = new Set();
	const links = new Set();
	const references = new Set();

	contents

		// [reference text]: resolved-target optional-title

		.replace(
			/^\s*\[([^\]\n]+)\]\s*:\s*([^\s]+)(?:[ \t]+[^\n]+)?$/gm,
			(_, reference, target) => {
				definitions.add(reference);
				links.add(target);

				return ' ';
			}
		)

		// [link text](https://example.com a title)

		.replace(/\[[^\]\n]+\]\(([^\s)]+) [^)\n]+\)/g, (_, link) => {
			links.add(link);

			return ' ';
		})

		// [link text](<https://example.com>)

		.replace(/\[[^\]\n]+\]\(<([^\s>]+)>\)/g, (_, link) => {
			links.add(link);

			return ' ';
		})

		// [link text](https://example.com)

		.replace(/\[[^\]\n]+\]\(([^\s)]+)\)/g, (_, link) => {
			links.add(link);

			return ' ';
		})

		// [link text][reference]

		.replace(/\[[^\]\n]+\]\[([^\]\n]+)\]/g, (_, reference) => {
			references.add(reference);

			return ' ';
		})

		// [link text]

		.replace(/\[([^\]\n]+)\]g/, (_, reference) => {
			references.add(reference);

			return ' ';
		})

		// <http://www.example.com>

		.replace(new RegExp(`<(${URL_PATTERN.source})>`, 'gi'), (_, url) => {
			links.add(url);

			return ' ';
		})

		// http://www.example.com

		.replace(URL_PATTERN, (url) => {
			links.add(url);

			return ' ';
		});

	for (const reference of references) {
		if (!definitions.has(reference)) {
			report(file, `Missing reference: ${reference}`);
		}
	}

	return Array.from(links);
}

async function main() {
	const pending = new Map();

	for await (const file of walk('.')) {
		if (FILTER_PATTERN.test(file)) {
			await enqueueFile(file, pending);
		}
	}

	await run(pending);
}

const MAX_CONCURRENT_CHECKS = 10;

async function run(pending) {
	const active = new Set();

	while (active.size > 0 || pending.size > 0) {
		for (let i = active.size; i < MAX_CONCURRENT_CHECKS; i++) {
			for (const [link, files] of pending.entries()) {
				const promise = new Promise((resolve, reject) => {
					check(link, files)
						.then(resolve)
						.catch(reject)
						.finally(() => active.delete(promise));
				});

				active.add(promise);
				pending.delete(link);

				break;
			}
		}

		await Promise.race(active);
	}
}

/**
 * Report a bad file (or files) and increment the total error count.
 */
function report(bad, message) {
	const files = typeof bad === 'string' ? [bad] : [...bad];

	files.forEach((file) => {
		errorCount++;
		console.error(`${file}: ${message}`);
	});
}

async function* walk(directory) {
	const entries = await readdirAsync(directory);

	for (let i = 0; i < entries.length; i++) {
		const entry = path.join(directory, entries[i]);

		if (IGNORE_DIR.test(entry)) {
			continue;
		}

		const stat = await statAsync(entry);

		if (stat.isDirectory()) {
			for await (const nested of walk(entry)) {
				yield nested;
			}
		}
		else {
			yield entry;
		}
	}
}

/**
 * Warn about problems in `files`; this does not increment the total error count
 * and does not affect the exit status of the process.
 */
function warn(files, message) {
	files.forEach((file) => {
		// eslint-disable-next-line no-console
		console.log(`${file}: ${message}`);
	});
}

main()
	.catch((error) => {
		errorCount++;
		console.error(error);
	})
	.finally(() => {
		if (errorCount) {
			process.exit(1);
		}
	});
