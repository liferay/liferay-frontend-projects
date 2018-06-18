const removed = {
	'color-placeholder': 'color_placeholder',
	'select-box-icon': 'select_box_icon',
};

const rules = Object.keys(removed).map(varName => {
	return {
		name: varName,
		message: `The mixin @${varName} has been removed in the new Clay 2.x.x version`,
		regex: new RegExp(`@include ${varName}\([^)]*)`, 'g'),
	};
});

module.exports = {
	removed: removed,
	rules: rules,
};
