/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const builder = require('css-stringify');
const fs = require('fs');

const parser = require('./css-parse');
const bg = require('./plugins/bg');
const fa = require('./plugins/fontawesome');
const yui3 = require('./plugins/yui3');

function quad(v, m) {
	// 1px 2px 3px 4px => 1px 4px 3px 2px
	if ((m = v.trim().split(/\s+(?=[^)]*(?:[(]|$))/)) && m.length == 4) {
		return [m[0], m[3], m[2], m[1]].join(' ');
	}
	return v;
}

function quad_radius(v) {
	var m = v.trim().split(/\s+/);
	// 1px 2px 3px 4px => 1px 2px 4px 3px
	// since border-radius: top-left top-right bottom-right bottom-left
	// will be border-radius: top-right top-left bottom-left bottom-right
	if (m && m.length == 4) {
		return [m[1], m[0], m[3], m[2]].join(' ');
	} else if (m && m.length == 3) {
		// super odd how this works
		// 5px 10px 20px => 10px 5px 10px 20px
		// yeah it's pretty dumb
		return [m[1], m[0], m[1], m[2]].join(' ');
	}
	return v;
}

function direction(v) {
	return v.match(/ltr/) ? 'rtl' : v.match(/rtl/) ? 'ltr' : v;
}

function rtltr(v) {
	if (v.match(/left/)) return 'right';
	if (v.match(/right/)) return 'left';
	return v;
}

function bgPosition(v) {
	if (v.match(/\bleft\b/)) {
		v = v.replace(/\bleft\b/, 'right');
	} else if (v.match(/\bright\b/)) {
		v = v.replace(/\bright\b/, 'left');
	}
	var m = v.trim().split(/\s+/);
	if (m && m.length == 1 && v.match(/(\d+)([a-z]{2}|%)/)) {
		v = 'right ' + v;
	}
	if (m && m.length == 2 && m[0].match(/\d+%/)) {
		// 30% => 70% (100 - x)
		v = 100 - parseInt(m[0], 10) + '% ' + m[1];
	}
	return v;
}

var propertyMap = {
	'-moz-border-radius-bottomleft': '-moz-border-radius-bottomright',
	'-moz-border-radius-bottomright': '-moz-border-radius-bottomleft',
	'-moz-border-radius-topleft': '-moz-border-radius-topright',
	'-moz-border-radius-topright': '-moz-border-radius-topleft',

	'-webkit-border-bottom-left-radius': '-webkit-border-bottom-right-radius',
	'-webkit-border-bottom-right-radius': '-webkit-border-bottom-left-radius',
	'-webkit-border-top-left-radius': '-webkit-border-top-right-radius',
	'-webkit-border-top-right-radius': '-webkit-border-top-left-radius',

	'border-bottom-left-radius': 'border-bottom-right-radius',
	'border-bottom-right-radius': 'border-bottom-left-radius',

	'border-left': 'border-right',
	'border-left-color': 'border-right-color',
	'border-left-width': 'border-right-width',

	'border-radius-bottomleft': 'border-radius-bottomright',
	'border-radius-bottomright': 'border-radius-bottomleft',
	'border-radius-topleft': 'border-radius-topright',
	'border-radius-topright': 'border-radius-topleft',

	'border-right': 'border-left',
	'border-right-color': 'border-left-color',
	'border-right-width': 'border-left-width',

	'border-top-left-radius': 'border-top-right-radius',
	'border-top-right-radius': 'border-top-left-radius',

	left: 'right',

	'margin-left': 'margin-right',
	'margin-right': 'margin-left',

	'padding-left': 'padding-right',
	'padding-right': 'padding-left',

	right: 'left',
};

var valueMap = {
	'-moz-border-radius': quad_radius,
	'-webkit-border-radius': quad_radius,
	'background-position': bgPosition,
	'border-color': quad,
	'border-radius': quad_radius,
	'border-style': quad,
	'border-width': quad,
	clear: rtltr,
	direction,
	float: rtltr,
	margin: quad,
	padding: quad,
	'text-align': rtltr,
};

function processRule(rule, idx, list) {
	var prev = list[idx - 1];
	if (prev && prev.type === 'comment' && prev.comment.trim() === '@noflip')
		return;

	if (rule.declarations)
		rule.declarations.forEach(declaration => {
			processDeclaration(declaration, rule);
		});
	else if (rule.rules) rule.rules.forEach(processRule);
}

function processDeclaration(declaration, rule) {
	// Ignore comments in declarations
	if (declaration.type !== 'declaration') return;

	// RegEx for comments is taken from http://www.w3.org/TR/CSS21/grammar.html
	var commentRegEx = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g,
		prop = declaration.property.replace(commentRegEx, ''), // remove comments
		val = declaration.value.replace(commentRegEx, ''),
		important = /!important/,
		isImportant = val.match(important),
		asterisk = prop.match(/^(\*+)(.+)/, '');

	if (asterisk) {
		prop = asterisk[2];
		asterisk = asterisk[1];
	} else {
		asterisk = '';
	}
	prop = propertyMap[prop] || prop;
	val = valueMap[prop] ? valueMap[prop](val, {decl: declaration, rule}) : val;

	if (!val.match(important) && isImportant) val += '!important';

	declaration.property = asterisk + prop;
	declaration.value = val;
}

function r2(css, options) {
	var ast;
	if (!options) options = {compress: true};

	ast = parser(css, {filename: options.filename});
	ast.stylesheet.rules.forEach(processRule);

	return builder(ast, options);
}

module.exports.exec = function(args) {
	const read = args[0];
	const out = args[1];
	const options = {compress: args[2] !== '--no-compress'};
	let data;

	/*
	/  If no read arg then read from stdin
	/  allows for standard piping and reading in
	/  ex: lessc file.less | r2 > file-rtl.css
	/  ex:  r2 < file.css
	*/
	if (!read) {
		var buffer = '';
		process.stdin.resume();
		process.stdin.setEncoding('utf8');

		process.stdin.on('data', chunk => {
			buffer += chunk;
		});

		process.stdin.on('end', () => {
			if (buffer) {
				// eslint-disable-next-line no-console
				console.log(r2(buffer, options));
			}
		});
	} else {
		/*
    	/  If reading from a file then print to stdout or out arg
    	/  To stdout: r2 styles.css
    	/  To file: r2 styles.cc styles-rtl.css
    	*/
		data = fs.readFileSync(read, 'utf8');
		if (out) {
			// eslint-disable-next-line no-console
			console.log('Swapping ' + read + ' to ' + out + '...');
			fs.writeFileSync(out, r2(data, options), 'utf8');
		} else {
			// eslint-disable-next-line no-console
			console.log(r2(data, options));
		}
	}
};

module.exports.swap = function(css, options) {
	return r2(css, options);
};

module.exports.valueMap = valueMap;

fa.plug(module.exports);
bg.plug(module.exports);
yui3.plug(module.exports);
