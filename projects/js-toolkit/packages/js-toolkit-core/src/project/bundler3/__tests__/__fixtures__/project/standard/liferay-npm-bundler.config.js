module.exports = {
	'config': {
		imports: {
			'an-osgi-module': {
				d3: '>=3.0.0',
				react: '>=16.8.5',
			},
			'frontend-js-node-shims': {
				assert: '>=1.2.0',
				punycode: '>=1.3.1',
				setimmediate: '>=1.0.0',
			},
			'frontend-js-web': {
				'/': '>=8.0.0',
			},
		},
	},
	'create-jar': {
		'output-dir': 'dist',
		'output-filename': 'output.jar',
		'customManifestHeaders': {
			'Project-Name': 'Overriden in manifest.json',
			'Responsible': 'john.doe@somewhere.net',
		},
		'features': {
			'localization': 'features/localization/Language',
			'manifest': 'features/manifest.json',
			'web-context': '/standard',
		},
	},
	'exclude': {
		'*': ['__tests__/**/*'],
		'is-object': ['test/**/*'],
		'is-array@1.0.1': ['test/**/*', 'Makefile'],
		'is-false': false,
		'is-true': true,
	},
	'max-parallel-files': 32,
};
