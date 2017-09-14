'use strict';

var Uri = require('./lib/Uri').default;

if (typeof URL === 'undefined' && typeof require !== 'undefined') {
	// If there is no "document", then this should be running in NodeJS or in ReactNative env and
	// in this case we should use the "url" NPM module as the parse function.
	// In ReactNative env "path" will be replaced with "path-browserify".

	var path = require('path');
	var url = require('url');

	Uri.setParseFn(function(urlStr) {
		var parsed = url.parse(urlStr);
		parsed.pathname = path.normalize(parsed.pathname);
		return parsed;
	});
}

module.exports = Uri;
