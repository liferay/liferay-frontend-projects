/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getRegExpForGlob = require('./getRegExpForGlob');

const DEFAULT_OPTIONS = {
	baseDir: '.',
	maxDepth: Infinity,
	type: 'file',
};

/**
 * Given a list of glob patterns and a list of ignore patterns, returns a list
 * of matching files, searching in the current dirctory.
 */
function expandGlobs(matchGlobs, ignoreGlobs = [], options = {}) {
	const {baseDir, maxDepth, type} = {
		...DEFAULT_OPTIONS,
		...options,
	};

	const ignorers = [];
	const matchers = matchGlobs.map(getRegExpForGlob);
	const results = [];

	// If any matchers are negated, move them into the "ignores" list.

	for (let i = matchers.length - 1; i >= 0; i--) {
		if (matchers[i].negated) {

			// Make a copy of the regular expression without the "negated" flag.

			ignorers.unshift(getRegExpForGlob(matchGlobs[i].slice(1)));
		}
	}

	// Make note of index of the last negation. (If a file has been
	// ignored, we can stop testing it as soon as we get past the last
	// negation.)

	let lastNegationIndex = 0;

	ignorers.push(
		...ignoreGlobs.map((glob, index) => {
			const regExp = getRegExpForGlob(glob);

			if (regExp.negated) {
				lastNegationIndex = ignorers.length + index;
			}

			return regExp;
		})
	);

	// As a special case, if we see an ignore glob like "a/b/c/**" past the
	// lastNegationIndex we can short-circuit.

	const prunable = new Map();
	const seen = [];

	for (let i = lastNegationIndex; i < ignorers.length; i++) {
		const glob = ignorers[i].glob;

		const match = glob.match(/^([^!*]+)\/\*\*$/);

		if (match) {
			const base = match[1];

			// Warn about overlapping ignore patterns. This check is O(n^2) but
			// n is expected to be tiny (approx. 10).

			seen.forEach((previous) => {
				if (
					previous.startsWith(base) ||
					base.startsWith(previous) ||
					previous.endsWith(base) ||
					base.endsWith(previous)
				) {
					throw new Error(
						`Redundant ignore patterns (\`${previous}\`, \`${base}\`) detected`
					);
				}
			});

			seen.push(base);

			const components = base.split('/');

			// For fast lookup later on, given "a/b/c", produce this trie:
			//
			//     c -> b -> a -> true
			//

			let current = prunable;

			for (let j = components.length - 1; j >= 0; j--) {
				const component = components[j];

				if (!current.has(component)) {
					if (j) {
						current.set(component, new Map());
					}
					else {

						// Mark the root with "true".

						current.set(component, true);
					}
				}

				current = current.get(component);
			}
		}
	}

	let currentDepth = 0;

	function traverse(directory) {
		if (currentDepth >= maxDepth) {
			return;
		}

		currentDepth++;

		const entries = fs.readdirSync(directory);
		entries.forEach((entry) => {
			const file = path.posix.join(directory, entry);
			const testedFilePath = path.isAbsolute(baseDir)
				? path.relative(baseDir, file)
				: file;

			// Check trie to see whether entire subtree can be pruned.

			let trie = prunable;
			let current = file;

			while (current !== '.') {
				trie = trie.get(path.basename(current));

				if (trie === true) {
					return;
				}
				else if (!trie) {
					break;
				}

				current = path.dirname(current);
			}

			let ignored = false;

			for (let i = 0; i < ignorers.length; i++) {
				const ignorer = ignorers[i];

				if (ignored ^ ignorer.negated) {

					// File is ignored, but ignorer is not a negation;
					// or file is not ignored, and ignorer is a negation.

					continue;
				}

				if (ignorer.test(testedFilePath)) {
					if (ignorer.negated) {

						// File got unignored.

						ignored = false;
					}
					else {

						// File is provisionally ignored, for now.

						ignored = true;
					}
				}

				if (ignored && i >= lastNegationIndex) {

					// File got definitively ignored.

					return;
				}
			}

			const stat = fs.statSync(file);

			const match = () =>
				matchers.some((matcher) => matcher.test(testedFilePath));

			if (stat.isDirectory()) {
				if (type === 'directory' && match()) {
					results.push(file);
				}

				traverse(file);
			}
			else if (type === 'file' && match()) {
				results.push(file);
			}
		});

		currentDepth--;
	}

	traverse(baseDir);

	return results;
}

module.exports = expandGlobs;
