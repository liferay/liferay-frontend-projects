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
 * Helper to get merge two json objects
 * @param {Object} defaultConfig Config file
 * @param {Object} customConfig Config file
 * @returns {Object}
 */
module.exports = function() {
	return merge.all([...arguments], {arrayMerge: combineMerge});
};
