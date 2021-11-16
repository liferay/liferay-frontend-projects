/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const merge = require('deepmerge');

const emptyTarget = (value) => (Array.isArray(value) ? [] : {});

const clone = (value, options) => merge(emptyTarget(value), value, options);

/**
 * Code copied from https://github.com/TehShrike/deepmerge#combine-array
 */
function combineMerge(target, source, options) {
	const destination = target.slice();

	source.forEach((item, i) => {
		if (typeof destination[i] === 'undefined') {
			const cloneRequested = options.clone !== false;
			const shouldClone =
				cloneRequested && options.isMergeableObject(item);

			destination[i] = shouldClone ? clone(item, options) : item;
		}
		else if (options.isMergeableObject(item)) {
			destination[i] = merge(target[i], item, options);
		}
		else if (target.indexOf(item) === -1) {
			destination.push(item);
		}
	});

	return destination;
}

/**
 * Code copied from https://github.com/TehShrike/deepmerge#overwrite-array
 */
const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

function getItemDescription(item) {
	try {
		return JSON.stringify(item);
	}
	catch (error) {

		// Could be a circular reference, but we're unlikely to ever get here
		// because the deepmerge package itself will die first.

		return `[unstringifiable item: ${error}]`;
	}
}

/**
 * Checks the supplied Babel preset or plugin name to confirm that
 * it has been normalized to conventional "shorthand" form, so that
 * names can be compared reliably.
 *
 * @see https://babeljs.io/docs/en/plugins#plugin-shorthand
 * @see https://babeljs.io/docs/en/presets#preset-shorthand
 */
function checkBabelName(name, kind) {
	const NORMALIZERS = {
		plugin: {
			/* eslint-disable sort-keys */
			// @babel/plugin-foo -> @babel/foo

			'^@babel/(?:plugin-)?([\\w-]+)': '@babel/$1',

			// @org/babel-plugin-foo -> @org/foo
			// babel-plugin-foo      -> foo

			'^(@[\\w-]+/)?babel-plugin-([\\w-]+)': '$1$2',
			/* eslint-enable sort-keys */
		},
		preset: {
			/* eslint-disable sort-keys */
			// @babel/preset-foo -> @babel/preset-foo
			// @babel/foo        -> @babel/preset-foo

			'^@babel/(?:preset-)?([\\w-]+)': '@babel/preset-$1',

			// @org/babel-preset-foo -> @org/foo
			// babel-preset-foo      -> foo

			'^(@[\\w-]+/)?babel-preset-([\\w-]+)': '$1$2',
			/* eslint-enable sort-keys */
		},
	};

	Object.entries(NORMALIZERS[kind]).reduce((done, [pattern, replacement]) => {
		if (!done) {
			const regExp = new RegExp(pattern);

			if (regExp.test(name)) {
				const normalized = name.replace(regExp, replacement);

				if (normalized !== name) {
					throw new Error(
						`checkBabelName(): expected "${normalized}", got "${name}"`
					);
				}
				done = true;
			}
		}

		return done;
	}, false);

	return name;
}

function getBabelName(item, kind) {
	if (typeof item === 'string') {
		return checkBabelName(item, kind);
	}
	else if (Array.isArray(item) && typeof item[0] === 'string') {
		return checkBabelName(item[0], kind);
	}
	else {
		throw new Error(
			`getBabelName(): malformed item ${getItemDescription(item)}`
		);
	}
}

function getBabelOptions(item) {
	if (typeof item === 'string') {
		return null;
	}
	else if (Array.isArray(item)) {
		const options = item[1];

		return options &&
			typeof options === 'object' &&
			Object.keys(options).length
			? options
			: null;
	}
	else {

		// We never expect to get here, but just in case...

		throw new Error('getBabelOptions(): incompatible item type');
	}
}

/**
 * Custom merge that knows how to merge "plugins" and "presets".
 */
function babelMerge(key) {
	const kind = {
		plugins: 'plugin',
		presets: 'preset',
	}[key];

	if (kind === 'plugin' || kind === 'preset') {
		return function (target, source, options) {

			// Create a mutable copy of `source`.

			const pending = source.slice();

			const result = target.map((targetItem) => {
				const targetName = getBabelName(targetItem, kind);
				const sourceIndex = pending.findIndex((sourceItem) => {
					const sourceName = getBabelName(sourceItem, kind);

					return sourceName === targetName;
				});
				if (sourceIndex !== -1) {
					const [sourceItem] = pending.splice(sourceIndex, 1);
					const mergedOptions = merge.all(
						[
							getBabelOptions(targetItem),
							getBabelOptions(sourceItem),
						].filter(Boolean),
						options
					);

					return Object.keys(mergedOptions).length
						? [targetName, mergedOptions]
						: targetName;
				}
				else {
					const targetOptions = getBabelOptions(targetItem);

					return targetOptions ? targetItem : targetName;
				}
			});

			return result.concat(
				pending.map((item) => {
					const itemName = getBabelName(item, kind);
					const itemOptions = getBabelOptions(item);

					return itemOptions ? [itemName, itemOptions] : itemName;
				})
			);
		};
	}
	else {
		return function (target, source, options) {
			if (Array.isArray(target) && Array.isArray(source)) {
				return combineMerge(target, source, options);
			}
			else if (
				options.isMergeableObject(target) &&
				options.isMergeableObject(source)
			) {
				return merge(target, source, options);
			}
			else {
				throw new Error(
					'babelMerge(): ' +
						'Cannot merge without two mergeable objects: ' +
						'please check that the .babelrc.js file is well-formed'
				);
			}
		};
	}
}

/**
 * Custom merge that overwrites `check` and `fix` arrays but merge the others.
 */
function npmscriptsMerge(key) {
	const overwriteArrayKeys = new Set(['check', 'fix']);

	if (overwriteArrayKeys.has(key)) {
		return function (target, source, options) {
			if (Array.isArray(target) && Array.isArray(source)) {
				return overwriteMerge(target, source, options);
			}
			else {
				throw new Error(
					'npmscriptsMerge(): ' +
						'Cannot merge key ' +
						key +
						' because it is not an ' +
						'array: please check that the npmscripts.config.js ' +
						'file is well-formed'
				);
			}
		};
	}
	else {
		return function (target, source, options) {
			if (Array.isArray(target) && Array.isArray(source)) {
				return combineMerge(target, source, options);
			}
			else if (
				options.isMergeableObject(target) &&
				options.isMergeableObject(source)
			) {
				return merge(target, source, options);
			}
			else {
				throw new Error(
					'npmscriptsMerge(): ' +
						'Cannot merge without two mergeable objects: ' +
						'please check that the npmscripts.config.js file is ' +
						'well-formed'
				);
			}
		};
	}
}
const MODE = Object.freeze({
	BABEL: 2,
	DEFAULT: 0,
	NPMSCRIPTS: 3,
	OVERWRITE_ARRAYS: 1,
});

/**
 * Helper to get merge two json objects
 * @param {Array} items An array of config objects
 * @param {Number} mode Merge strategy for combining values.
 * @returns {Object}
 */
function deepMerge(items, mode = MODE.DEFAULT) {
	switch (mode) {
		case MODE.DEFAULT:
			return merge.all(items, {
				arrayMerge: combineMerge,
			});

		case MODE.OVERWRITE_ARRAYS:
			return merge.all(items, {
				arrayMerge: overwriteMerge,
			});

		case MODE.BABEL:
			return merge.all(items, {
				customMerge: babelMerge,
			});

		case MODE.NPMSCRIPTS:
			return merge.all(items, {
				customMerge: npmscriptsMerge,
			});

		default:
			throw new Error(`deepMerge(): unsupported mode: ${mode}`);
	}
}

deepMerge.MODE = MODE;

module.exports = deepMerge;
