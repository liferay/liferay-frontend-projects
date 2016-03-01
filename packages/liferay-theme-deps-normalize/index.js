var fs = require('fs');
var path = require('path');

function insertInjectTag(filePath, regex, replacer) {
	try {
		var fileContents = fs.readFileSync(filePath, {
			encoding: 'utf8'
		});

		regex = new RegExp(regex, 'g');

		fileContents = fileContents.replace(regex, replacer);

		fs.writeFileSync(filePath, fileContents, {
			encoding: 'utf8'
		});
	}
	catch(e) {
		console.log('Unable to add inject tags to', filePath);
	}
}

function normalize(config) {
	normalizeTemplates(config);
}

function normalizeTemplates(config) {
	var templateRegex = '(<\\/body>)';

	var templateReplacer = function(match) {
		return '<!-- inject:js -->\n<!-- endinject -->\n\n' + match;
	};

	var portalNormalPath = path.join(require.resolve(config.unstyled), '..', 'templates', 'portal_normal');

	insertInjectTag(portalNormalPath + '.ftl', templateRegex, templateReplacer);
	insertInjectTag(portalNormalPath + '.vm', templateRegex, templateReplacer);
}

module.exports = normalize;
