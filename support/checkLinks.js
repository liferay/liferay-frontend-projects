#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const {promisify} = require('util');

const accessAsync = promisify(fs.access);
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const FILTER_PATTERN = /\.md$/;

const IGNORE_PATTERN = /^(?:.git|node_modules)$/;

// Adapted from: https://stackoverflow.com/a/163684/2103996
const URL_PATTERN = /\bhttps?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/;

let errorCount = 0;

async function check(link, files) {
	if (URL_PATTERN.test(link)) {
		await checkRemote(link, files);
	} else if (/^#/.test(link)) {
		await checkInternal(link, files);
	} else {
		await checkLocal(link, files);
	}
}

async function checkInternal(link, files) {
	for (const file of files) {
		const contents = await readFileAsync(file, 'utf8');

		const headingPattern = link.slice(1).replace(/-/g, '[ -,]+');

		const regExp = new RegExp(`^#+\\s+${headingPattern}\\s*$`, 'im');

		if (!contents.match(regExp)) {
			report(file, `No heading found matching internal target: ${link}`);
		}
	}
}

async function checkLocal(link, files) {
	for (const file of files) {
		const target = path.join(path.dirname(file), link);

		try {
			await accessAsync(target);
		} catch (error) {
			report(file, `No file/directory found for local target: ${target}`);
		}
	}
}

function checkRemote(link, files) {
	return new Promise(resolve => {
		const bail = problem => {
			report(files, problem);
			resolve();
		};

		const {hostname, pathname, port} = new URL(link);

		if (
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname === '0.0.0.0' ||
			hostname === '::1'
		) {
			resolve();
			return;
		}

		const request = http.get(
			{
				host: hostname,
				path: pathname,
				port
			},
			({statusCode}) => {
				if (statusCode >= 200 && statusCode < 400) {
					resolve();
				} else {
					bail(`Status code ${statusCode} for remote link: ${link}`);
				}
			}
		);

		request.on('error', error => {
			// Trim stack trace.
			const text = error.toString().split(/\n/)[0];

			bail(`Failed request (${text}) for remote link: ${link}`);
		});
	});
}

async function enqueueFile(file, pending) {
	const contents = await readFileAsync(file, 'utf8');

	const links = extractLinks(contents, file);

	links.forEach(link => {
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
		.replace(URL_PATTERN, url => {
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

function report(bad, message) {
	const files = typeof bad === 'string' ? [bad] : [...bad];

	files.forEach(file => {
		errorCount++;
		console.error(`${file}: ${message}`);
	});
}

async function* walk(directory) {
	const entries = await readdirAsync(directory);

	for (let i = 0; i < entries.length; i++) {
		const entry = path.join(directory, entries[i]);

		if (IGNORE_PATTERN.test(entry)) {
			continue;
		}

		const stat = await statAsync(entry);

		if (stat.isDirectory()) {
			for await (const nested of walk(entry)) {
				yield nested;
			}
		} else {
			yield entry;
		}
	}
}

main()
	.catch(error => {
		errorCount++;
		console.error(error);
	})
	.finally(() => {
		if (errorCount) {
			process.exit(1);
		}
	});
