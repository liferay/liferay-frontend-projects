var fs = require('fs');
var path = require('path');

function insertInjectTag(filePath, beforeRegex, replacementContent) {
	const relativePath = path.relative('', filePath);

	if (fs.existsSync(filePath)) {
		var fileContents = fs.readFileSync(filePath, {
			encoding: 'utf8',
		});

		if (fileContents.indexOf(replacementContent) !== -1) {
			console.log(
				`Skipping tag injection for ${relativePath} (already done)`
			);
		} else {
			fileContents = fileContents.replace(beforeRegex, function(match) {
				return replacementContent + match;
			});

			fs.writeFileSync(filePath, fileContents, {
				encoding: 'utf8',
			});

			console.log(`Completed tag injection for ${relativePath}`);
		}
	} else {
		console.log(
			`Skipping tag injection for ${relativePath} (does not exist)`
		);
	}
}

function normalize() {
	var beforeRegex = /<\/body>/;

	var replacementContent = '<!-- inject:js -->\n<!-- endinject -->\n\n';

	var portalNormalPath = path.join(
		require.resolve('liferay-frontend-theme-unstyled'),
		'..',
		'templates',
		'portal_normal'
	);

	insertInjectTag(portalNormalPath + '.ftl', beforeRegex, replacementContent);
	insertInjectTag(portalNormalPath + '.vm', beforeRegex, replacementContent);
}

module.exports = normalize;
