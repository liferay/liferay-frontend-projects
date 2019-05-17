/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const merge = require('deepmerge');

const emptyTarget = value => (Array.isArray(value) ? [] : {});
const clone = (value, options) => merge(emptyTarget(value), value, options);

/**
 * Code copied from https://github.com/TehShrike/deepmerge#combine-array
 */
function combineMerge(target, source, options) {
	const destination = target.slice();

	source.forEach(function(e, i) {
		if (typeof destination[i] === 'undefined') {
			const cloneRequested = options.clone !== false;
			const shouldClone = cloneRequested && options.isMergeableObject(e);
			destination[i] = shouldClone ? clone(e, options) : e;
		} else if (options.isMergeableObject(e)) {
			destination[i] = merge(target[i], e, options);
		} else if (target.indexOf(e) === -1) {
			destination.push(e);
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
	} catch (error) {
		// Could be a circular reference, but we're unlikely to ever get here
		// because the deepmerge package itself will die first.
		return `[unstringifiable item: ${error}]`;
	}
}

function getBabelName(item) {
	if (typeof item === 'string') {
		return item;
	} else if (Array.isArray(item) && typeof item[0] === 'string') {
		return item[0];
	} else {
		throw new Error(
			`getBabelName(): malformed item ${getItemDescription(item)}`
		);
	}
}

function getBabelOptions(item) {
	if (typeof item === 'string') {
		return null;
	} else if (Array.isArray(item)) {
		const options = item[1];
		return options &&
			typeof options === 'object' &&
			Object.keys(options).length
			? options
			: null;
	} else {
		// We never expect to get here, but just in case...
		throw new Error('getBabelOptions(): incompatible item type');
	}
}

/**
 * Custom merge that knows how to merge "plugins" and "presets".
 */
function babelMerge(key) {
	if (key === 'plugins' || key === 'presets') {
		return function(target, source, options) {
			// Create a mutable copy of `source`.
			const pending = source.slice();

			const result = target.map(targetItem => {
				const targetName = getBabelName(targetItem);
				const sourceIndex = pending.findIndex(sourceItem => {
					const sourceName = getBabelName(sourceItem);
					return sourceName === targetName;
				});
				if (sourceIndex !== -1) {
					const [sourceItem] = pending.splice(sourceIndex, 1);
					const mergedOptions = merge.all(
						[
							getBabelOptions(targetItem),
							getBabelOptions(sourceItem)
						].filter(Boolean),
						options
					);

					return Object.keys(mergedOptions).length
						? [targetName, mergedOptions]
						: targetName;
				} else {
					const targetOptions = getBabelOptions(targetItem);
					return targetOptions ? targetItem : targetName;
				}
			});

			return result.concat(
				pending.map(item => {
					const itemName = getBabelName(item);
					const itemOptions = getBabelOptions(item);
					return itemOptions ? [itemName, itemOptions] : itemName;
				})
			);
		};
	} else {
		return combineMerge;
	}
}

const MODE = Object.freeze({
	DEFAULT: 0,
	OVERWRITE_ARRAYS: 1,
	BABEL: 2
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
				arrayMerge: combineMerge
			});

		case MODE.OVERWRITE_ARRAYS:
			return merge.all(items, {
				arrayMerge: overwriteMerge
			});

		case MODE.BABEL:
			return merge.all(items, {
				customMerge: babelMerge
			});

		default:
			throw new Error(`deepMerge(): unsupported mode: ${mode}`);
	}
}

deepMerge.MODE = MODE;

module.exports = deepMerge;
