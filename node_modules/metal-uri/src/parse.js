'use strict';

import { isFunction } from 'metal';
import parseFromAnchor from './parseFromAnchor';

/**
 * Parses the given uri string into an object. The URL function will be used
 * when present, otherwise we'll fall back to the anchor node element.
 * @param {*=} opt_uri Optional string URI to parse
 */
function parse(opt_uri) {
	if (isFunction(URL) && URL.length) {
		const url = new URL(opt_uri);

		// Safari Browsers will cap port to the max 16-bit unsigned integer (65535) instead
		// of throwing a TypeError as per spec. It will still keep the port number in the
		// href attribute, so we can use this mismatch to raise the expected exception.
		if (url.port && url.href.indexOf(url.port) === -1) {
			throw new TypeError(`${opt_uri} is not a valid URL`);
		}

		return url;
	} else {
		return parseFromAnchor(opt_uri);
	}
}

export default parse;
