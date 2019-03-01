var fs = require('fs');
var path = require('path');

function insertInjectTag(filePath, regex, replacer) {
	const relativePath = path.relative('', filePath);

	if (fs.existsSync(filePath)) {
		var fileContents = fs.readFileSync(filePath, {
			encoding: 'utf8',
		});

		regex = new RegExp(regex, 'g');

		fileContents = fileContents.replace(regex, replacer);

		fs.writeFileSync(filePath, fileContents, {
			encoding: 'utf8',
		});

		console.log(`Completed tag injection for ${relativePath}`);
	} else {
		console.log(
			`Skipping tag injection for ${relativePath} (does not exist)`
		);
	}
}

function normalize(config) {
	normalizeTemplates(config);
}

function normalizeTemplates() {
	var templateRegex = '(<\\/body>)';

	var templateReplacer = function(match) {
		return '<!-- inject:js -->\n<!-- endinject -->\n\n' + match;
	};

	var portalNormalPath = path.join(
		require.resolve('liferay-frontend-theme-unstyled'),
		'..',
		'templates',
		'portal_normal'
	);

	insertInjectTag(portalNormalPath + '.ftl', templateRegex, templateReplacer);
	insertInjectTag(portalNormalPath + '.vm', templateRegex, templateReplacer);
}

module.exports = normalize;
