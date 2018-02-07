module.exports = {
	url: 'http://localhost:3000/combo?',
	basePath: '/modules',
	combine: true,
	maps: {
		liferay: 'liferay@1.0.0',
	},
	modules: {
		'aui-autocomplete': {
			dependencies: ['aui-node', 'aui-dialog'],
			path: 'aui-autocomplete.js',
		},
		'aui-base': {
			dependencies: [],
			fullPath: 'http://localhost:8080/demo/modules/aui-base.js',
		},
		'aui-chema': {
			dependencies: ['aui-autocomplete', 'aui-event', 'aui-node'],
			condition: {
				trigger: 'aui-nate',
				test: function() {
					return true;
				},
			},
			path: 'aui-chema.js',
		},
		'aui-core': {
			dependencies: [],
			path: 'aui-core.js',
		},
		'aui-dialog': {
			dependencies: ['aui-node', 'aui-plugin-base'],
			condition: {
				trigger: 'aui-nate',
				test: 'function () {\n    return true;\n}',
			},
			path: 'aui-dialog.js',
		},
		'aui-dom-node': {
			dependencies: ['aui-node'],
			path: 'aui-dom-node.js',
		},
		'aui-event': {
			dependencies: ['aui-node', 'aui-plugin-base'],
			path: 'aui-event.js',
		},
		'aui-nate': {
			dependencies: ['aui-autocomplete', 'aui-event'],
			path: 'aui-nate.js',
		},
		'aui-node': {
			dependencies: ['aui-base', 'aui-core'],
			path: 'aui-node.js',
		},
		'aui-plugin-base': {
			dependencies: [],
			path: 'aui-plugin-base.js',
		},
		'aui-test': {
			dependencies: ['aui-base'],
			condition: {
				trigger: 'aui-dialog',
				test: 'function () {\n    return false;\n}',
			},
			path: 'aui-test.js',
		},
		'aui-test2': {
			dependencies: ['aui-base'],
			condition: {
				trigger: 'aui-plugin-base',
				test: 'function () {\n    return true;\n}',
			},
			path: 'aui-test2.js',
		},
		'module': {
			dependencies: [],
			path: 'module/src/module',
		},
		'module.js': {
			dependencies: [],
			path: 'module.js/src/module.js',
		},
		'liferay@1.0.0': {
			dependencies: ['exports'],
			path: 'liferay.js',
		},
		'isobject@2.1.0': {
			dependencies: ['isarray'],
			map: {
				isarray: 'isarray@1.0.0',
			},
		},
	},
};
