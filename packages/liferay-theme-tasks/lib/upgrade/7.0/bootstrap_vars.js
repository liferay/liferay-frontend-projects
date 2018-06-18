const removed = [
	'line-height-computed',
	'padding-base-horizontal',
	'padding-base-vertical',
	'padding-large-horizontal',
	'padding-large-vertical',
	'padding-small-horizontal',
	'padding-small-vertical',
	'padding-xs-horizontal',
	'padding-xs-vertical',
	'gray-base',
	'gray-darker',
	'gray-dark',
	'gray',
	'gray-light',
	'gray-lighter',
	'brand-primary',
	'brand-success',
	'brand-info',
	'brand-warning',
	'brand-danger',
	'state-success-text',
	'state-success-bg',
	'state-success-border',
	'state-info-text',
	'state-info-bg',
	'state-info-border',
	'state-warning-text',
	'state-warning-bg',
	'state-warning-border',
	'state-danger-text',
	'state-danger-bg',
	'state-danger-border',
];

const rules = removed.map(varName => {
	return {
		name: varName,
		message: `$${varName} was removed in Bootstrap 4.x.x`,
		regex: new RegExp(`\\$${varName}`, 'g'),
	};
});

module.exports = {
	removed: removed,
	rules: rules,
};
