const merge = require('deepmerge');

const emptyTarget = value => (Array.isArray(value) ? [] : {});
const clone = (value, options) => merge(emptyTarget(value), value, options);

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

module.exports = function(defaultConfig, customConfig) {
	return merge(customConfig, defaultConfig, {arrayMerge: combineMerge});
};
