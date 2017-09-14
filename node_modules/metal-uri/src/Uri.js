'use strict';

import { isDef, string } from 'metal';
import parse from './parse';
import { MultiMap } from 'metal-structs';

var parseFn_ = parse;

class Uri {

	/**
	 * This class contains setters and getters for the parts of the URI.
	 * The following figure displays an example URIs and their component parts.
	 *
	 *                                  path
	 *	                             ┌───┴────┐
	 *	  abc://example.com:123/path/data?key=value#fragid1
	 *	  └┬┘   └────┬────┘ └┬┘           └───┬───┘ └──┬──┘
	 * protocol  hostname  port            search    hash
	 *          └──────┬───────┘
	 *                host
	 *
	 * @param {*=} opt_uri Optional string URI to parse
	 * @constructor
	 */
	constructor(opt_uri = '') {
		this.url = Uri.parse(this.maybeAddProtocolAndHostname_(opt_uri));
	}

	/**
	 * Adds parameters to uri from a <code>MultiMap</code> as source.
	 * @param {MultiMap} multimap The <code>MultiMap</code> containing the
	 *   parameters.
	 * @protected
	 * @chainable
	 */
	addParametersFromMultiMap(multimap) {
		multimap.names().forEach((name) => {
			multimap.getAll(name).forEach((value) => {
				this.addParameterValue(name, value);
			});
		});
		return this;
	}

	/**
	 * Adds the value of the named query parameters.
	 * @param {string} key The parameter to set.
	 * @param {*} value The new value. Will be explicitly casted to String.
	 * @chainable
	 */
	addParameterValue(name, value) {
		this.ensureQueryInitialized_();
		if (isDef(value)) {
			value = String(value);
		}
		this.query.add(name, value);
		return this;
	}

	/**
	 * Adds the values of the named query parameter.
	 * @param {string} key The parameter to set.
	 * @param {*} value The new value.
	 * @chainable
	 */
	addParameterValues(name, values) {
		values.forEach((value) => this.addParameterValue(name, value));
		return this;
	}

	/**
	 * Ensures query internal map is initialized and synced with initial value
	 * extracted from URI search part.
	 * @protected
	 */
	ensureQueryInitialized_() {
		if (this.query) {
			return;
		}
		this.query = new MultiMap();
		var search = this.url.search;
		if (search) {
			search.substring(1).split('&').forEach((param) => {
				var [key, value] = param.split('=');
				if (isDef(value)) {
					value = Uri.urlDecode(value);
				}
				this.addParameterValue(key, value);
			});
		}
	}

	/**
	 * Gets the hash part of uri.
	 * @return {string}
	 */
	getHash() {
		return this.url.hash || '';
	}

	/**
	 * Gets the host part of uri. E.g. <code>[hostname]:[port]</code>.
	 * @return {string}
	 */
	getHost() {
		var host = this.getHostname();
		if (host) {
			var port = this.getPort();
			if (port && port !== '80') {
				host += ':' + port;
			}
		}
		return host;
	}

	/**
	 * Gets the hostname part of uri without protocol and port.
	 * @return {string}
	 */
	getHostname() {
		var hostname = this.url.hostname;
		if (hostname === Uri.HOSTNAME_PLACEHOLDER) {
			return '';
		}
		return hostname;
	}

	/**
	 * Gets the origin part of uri. E.g. <code>http://[hostname]:[port]</code>.
	 * @return {string}
	 */
	getOrigin() {
		var host = this.getHost();
		if (host) {
			return this.getProtocol() + '//' + host;
		}
		return '';
	}

	/**
	 * Returns the first value for a given parameter or undefined if the given
	 * parameter name does not appear in the query string.
	 * @param {string} paramName Unescaped parameter name.
	 * @return {string|undefined} The first value for a given parameter or
	 *   undefined if the given parameter name does not appear in the query
	 *   string.
	 */
	getParameterValue(name) {
		this.ensureQueryInitialized_();
		return this.query.get(name);
	}

	/**
	 * Returns the value<b>s</b> for a given parameter as a list of decoded
	 * query parameter values.
	 * @param {string} name The parameter to get values for.
	 * @return {!Array<?>} The values for a given parameter as a list of decoded
	 *   query parameter values.
	 */
	getParameterValues(name) {
		this.ensureQueryInitialized_();
		return this.query.getAll(name);
	}

	/**
	 * Returns the name<b>s</b> of the parameters.
	 * @return {!Array<string>} The names for the parameters as a list of
	 *   strings.
	 */
	getParameterNames() {
		this.ensureQueryInitialized_();
		return this.query.names();
	}

	/**
	 * Gets the function currently being used to parse URIs.
	 * @return {!function()}
	 */
	static getParseFn() {
		return parseFn_;
	}

	/**
	 * Gets the pathname part of uri.
	 * @return {string}
	 */
	getPathname() {
		return this.url.pathname;
	}

	/**
	 * Gets the port number part of uri as string.
	 * @return {string}
	 */
	getPort() {
		return this.url.port;
	}

	/**
	 * Gets the protocol part of uri. E.g. <code>http:</code>.
	 * @return {string}
	 */
	getProtocol() {
		return this.url.protocol;
	}

	/**
	 * Gets the search part of uri. Search value is retrieved from query
	 * parameters.
	 * @return {string}
	 */
	getSearch() {
		var search = '';
		var querystring = '';
		this.getParameterNames().forEach((name) => {
			this.getParameterValues(name).forEach((value) => {
				querystring += name;
				if (isDef(value)) {
					querystring += '=' + encodeURIComponent(value);
				}
				querystring += '&';
			});
		});
		querystring = querystring.slice(0, -1);
		if (querystring) {
			search += '?' + querystring;
		}
		return search;
	}

	/**
	 * Checks if uri contains the parameter.
	 * @param {string} name
	 * @return {boolean}
	 */
	hasParameter(name) {
		this.ensureQueryInitialized_();
		return this.query.contains(name);
	}

	/**
	 * Returns true if the default protocol (scheme) was added to the original Uri.
	 * @return {boolean} True if a protocol (scheme) was added to the Url, false
	 *   otherwise
	 */
	isUsingDefaultProtocol() {
		return this.usingDefaultProtocol_;
	}

	/**
	 * Makes this URL unique by adding a random param to it. Useful for avoiding
	 * cache.
	 */
	makeUnique() {
		this.setParameterValue(Uri.RANDOM_PARAM, string.getRandomString());
		return this;
	}

	/**
	 * Maybe adds protocol and a hostname placeholder on a partial URI if needed.
	 * Relevant for compatibility with <code>URL</code> native object.
	 * @param {string=} opt_uri
	 * @return {string} URI with protocol and hostname placeholder.
	 */
	maybeAddProtocolAndHostname_(opt_uri) {
		var url = opt_uri;
		if (opt_uri.indexOf('://') === -1 &&
			opt_uri.indexOf('javascript:') !== 0) { // jshint ignore:line

			url = Uri.DEFAULT_PROTOCOL;
			this.usingDefaultProtocol_ = true;

			if (opt_uri[0] !== '/' || opt_uri[1] !== '/') {
				url += '//';
			}

			switch (opt_uri.charAt(0)) {
				case '.':
				case '?':
				case '#':
					url += Uri.HOSTNAME_PLACEHOLDER;
					url += '/';
					url += opt_uri;
					break;
				case '':
				case '/':
					if (opt_uri[1] !== '/') {
						url += Uri.HOSTNAME_PLACEHOLDER;
					}
					url += opt_uri;
					break;
				default:
					url += opt_uri;
			}
		} else {
			this.usingDefaultProtocol_ = false;
		}
		return url;
	}

	/**
	 * Parses the given uri string into an object.
	 * @param {*=} opt_uri Optional string URI to parse
	 */
	static parse(opt_uri) {
		return parseFn_(opt_uri);
	}

	/**
	 * Removes the named query parameter.
	 * @param {string} name The parameter to remove.
	 * @chainable
	 */
	removeParameter(name) {
		this.ensureQueryInitialized_();
		this.query.remove(name);
		return this;
	}

	/**
	 * Removes uniqueness parameter of the uri.
	 * @chainable
	 */
	removeUnique() {
		this.removeParameter(Uri.RANDOM_PARAM);
		return this;
	}

	/**
	 * Sets the hash.
	 * @param {string} hash
	 * @chainable
	 */
	setHash(hash) {
		this.url.hash = hash;
		return this;
	}

	/**
	 * Sets the hostname.
	 * @param {string} hostname
	 * @chainable
	 */
	setHostname(hostname) {
		this.url.hostname = hostname;
		return this;
	}

	/**
	 * Sets the value of the named query parameters, clearing previous values
	 * for that key.
	 * @param {string} key The parameter to set.
	 * @param {*} value The new value.
	 * @chainable
	 */
	setParameterValue(name, value) {
		this.removeParameter(name);
		this.addParameterValue(name, value);
		return this;
	}

	/**
	 * Sets the values of the named query parameters, clearing previous values
	 * for that key.
	 * @param {string} key The parameter to set.
	 * @param {*} value The new value.
	 * @chainable
	 */
	setParameterValues(name, values) {
		this.removeParameter(name);
		values.forEach((value) => this.addParameterValue(name, value));
		return this;
	}

	/**
	 * Sets the pathname.
	 * @param {string} pathname
	 * @chainable
	 */
	setPathname(pathname) {
		this.url.pathname = pathname;
		return this;
	}

	/**
	 * Sets the port number.
	 * @param {*} port Port number.
	 * @chainable
	 */
	setPort(port) {
		this.url.port = port;
		return this;
	}

	/**
	 * Sets the function that will be used for parsing the original string uri
	 * into an object.
	 * @param {!function()} parseFn
	 */
	static setParseFn(parseFn) {
		parseFn_ = parseFn;
	}

	/**
	 * Sets the protocol. If missing <code>http:</code> is used as default.
	 * @param {string} protocol
	 * @chainable
	 */
	setProtocol(protocol) {
		this.url.protocol = protocol;
		if (this.url.protocol[this.url.protocol.length - 1] !== ':') {
			this.url.protocol += ':';
		}
		return this;
	}

	/**
	 * @return {string} The string form of the url.
	 * @override
	 */
	toString() {
		var href = '';
		var host = this.getHost();
		if (host) {
			href += this.getProtocol() + '//';
		}
		href += host + this.getPathname() + this.getSearch() + this.getHash();
		return href;
	}

	/**
	 * Joins the given paths.
	 * @param {string} basePath
	 * @param {...string} ...paths Any number of paths to be joined with the base url.
	 * @static
	 */
	static joinPaths(basePath, ...paths) {
		if (basePath.charAt(basePath.length - 1) === '/') {
			basePath = basePath.substring(0, basePath.length - 1);
		}
		paths = paths.map(path => path.charAt(0) === '/' ? path.substring(1) : path);
		return [basePath].concat(paths).join('/').replace(/\/$/, '');
	}

	/**
	 * URL-decodes the string. We need to specially handle '+'s because
	 * the javascript library doesn't convert them to spaces.
	 * @param {string} str The string to url decode.
	 * @return {string} The decoded {@code str}.
	 */
	static urlDecode(str) {
		return decodeURIComponent(str.replace(/\+/g, ' '));
	}

}

/**
 * Default protocol value.
 * @type {string}
 * @default http:
 * @static
 */
const isSecure = () =>
	(typeof window !== 'undefined' &&
		window.location &&
		window.location.protocol &&
		window.location.protocol.indexOf('https') === 0);

Uri.DEFAULT_PROTOCOL = isSecure() ? 'https:' : 'http:';

/**
 * Hostname placeholder. Relevant to internal usage only.
 * @type {string}
 * @static
 */
Uri.HOSTNAME_PLACEHOLDER = 'hostname' + Date.now();

/**
 * Name used by the param generated by `makeUnique`.
 * @type {string}
 * @static
 */
Uri.RANDOM_PARAM = 'zx';

export default Uri;
