var __CONFIG__ = {
	url: 'http://localhost:3000/combo?',
	basePath: '/modules',
	combine: true,
	paths: {
		jquery: 'http://code.jquery.com/jquery-2.1.3.min.js',
		'liferay@1.0.0': '.',
	},
};
__CONFIG__.maps = {
	liferay: 'liferay@1.0.0',
	liferay2: 'liferay@1.0.0',
	'liferay@1.0.0/package': {
		value: 'liferay@1.0.0/package/index',
		exactMatch: true,
	},
};
__CONFIG__.modules = {
	'liferay@1.0.0/aui-base': {
		dependencies: ['exports'],
		path: 'liferay@1.0.0/aui-base.js',
	},
	'liferay@1.0.0/aui-core': {
		dependencies: ['exports'],
		path: 'liferay@1.0.0/aui-core.js',
	},
	'liferay@1.0.0/aui-dialog': {
		dependencies: [
			'exports',
			'liferay/aui-base',
			'liferay/aui-core',
			'liferay/aui-event',
		],
		path: 'liferay@1.0.0/aui-dialog.js',
	},
	'liferay@1.0.0/aui-event': {
		dependencies: ['exports'],
		path: 'liferay@1.0.0/aui-event.js',
	},
	'liferay@1.0.0/local-require': {
		dependencies: ['liferay/aui-core'],
		path: 'liferay@1.0.0/local-require.js',
	},
	'liferay@1.0.0/relative1': {
		dependencies: ['exports', './relative2'],
		path: 'liferay@1.0.0/relative1.js',
	},
	'liferay@1.0.0/relative2': {
		dependencies: ['exports', './sub-relative/sub-relative1'],
		path: 'liferay@1.0.0/relative2.js',
	},
	'liferay@1.0.0/relative3': {
		dependencies: ['exports'],
		path: 'liferay@1.0.0/relative3.js',
	},
	'liferay@1.0.0/sub-relative/sub-relative1': {
		dependencies: ['exports', '../relative3'],
		path: 'liferay@1.0.0/sub-relative/sub-relative1.js',
	},
	'liferay@1.0.0/package/index': {
		dependencies: ['exports'],
		path: 'liferay@1.0.0/package/index.js',
	},
	'liferay@1.0.0/liferay/liferay': {
		dependencies: ['exports'],
		path: 'liferay@1.0.0/liferay/liferay.js',
	},
	'liferay@1.0.0/liferay/liferay2': {
		dependencies: ['exports'],
		path: 'liferay@1.0.0/liferay/liferay2.js',
	},
	'liferay@1.0.0/chema/chemaps/aui-chemaps': {
		dependencies: ['exports', 'liferay/aui-base'],
		path: 'liferay@1.0.0/chema/chemaps/aui-chemaps.js',
	},
	'liferay@1.0.0/ambrin/aui-ambrin': {
		dependencies: ['exports', 'liferay/aui-core'],
		path: 'liferay@1.0.0/ambrin/aui-ambrin.js',
	},
};
