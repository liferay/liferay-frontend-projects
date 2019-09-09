/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const permute = require('../utils/permute');

/**
 * Map of all matchers keyed by name.
 */
const MATCHERS = new Map();

function lookup(matcher) {
	if (MATCHERS.has(matcher)) {
		return MATCHERS.get(matcher);
	} else {
		return matcher;
	}
}

/**
 * Assign a name to a matcher.
 */
function name(string) {
	this._description = string;

	MATCHERS.set(string, this);

	return this;
}

/**
 * Creates a fake "match" object that mimics what you would get from a call to
 * RegExp.prototype.exec().
 */
function getMatchObject(string) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
	// TODO: needs index and input properties
	// might also want to set lastIndex on regexp
	return [string];
}

/**
 * XML 1.0 Section 2.2.
 *
 * Any Unicode character, excluding the surrogate blocks, FFFE, and FFFF
 */
const CHAR = match(
	/[\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u
).name('CHAR');

/**
 * XML 1.0 Section 2.8.
 */
const EQ = sequence(maybe('SPACE'), match('='), maybe('SPACE')).name('EQ');

const CUSTOM_ACTION_START = match('<').name('CUSTOM_ACTION_START');

const TAG_PREFIX = a('NAME').name('TAG_PREFIX');

const CUSTOM_ACTION_NAME = a('NAME').name('CUSTOM_ACTION_NAME');

const CUSTOM_ACTION = sequence(
	'TAG_PREFIX',
	match(':'),
	'CUSTOM_ACTION_NAME'
).name('CUSTOM_ACTION');

/**
 * XML 1.0 Section 2.3.
 */
const NAME = sequence(
	oneOf('LETTER', match('_'), match(':')),
	repeat('NAME_CHAR')
).name('NAME');

const NAME_CHAR = oneOf(
	'LETTER',
	'DIGIT',
	match('.'),
	match('-'),
	match('_'),

	// TODO: decide what to do about this one (XML spec basically allows
	// it anywhere, but JSP spec seems to assume it is not there):
	// match(':'),

	'COMBINING_CHAR',
	'EXTENDER'
).name('NAME_CHAR');

/**
 * XML 1.0 Appendix B.
 */
const LETTER = oneOf('BASE_CHAR', 'IDEOGRAPHIC').name('LETTER');

const BASE_CHAR = match(
	new RegExp(
		`[${[
			'\\u0041-\\u005a',
			'\\u0061-\\u007a',
			'\\u00c0-\\u00d6',
			'\\u00d8-\\u00f6',
			'\\u00f8-\\u00ff',
			'\\u0100-\\u0131',
			'\\u0134-\\u013e',
			'\\u0141-\\u0148',
			'\\u014a-\\u017e',
			'\\u0180-\\u01c3',
			'\\u01cd-\\u01f0',
			'\\u01f4-\\u01f5',
			'\\u01fa-\\u0217',
			'\\u0250-\\u02a8',
			'\\u02bb-\\u02c1',
			'\\u0386',
			'\\u0388-\\u038a',
			'\\u038c',
			'\\u038e-\\u03a1',
			'\\u03a3-\\u03ce',
			'\\u03d0-\\u03d6',
			'\\u03da',
			'\\u03dc',
			'\\u03de',
			'\\u03e0',
			'\\u03e2-\\u03f3',
			'\\u0401-\\u040c',
			'\\u040e-\\u044f',
			'\\u0451-\\u045c',
			'\\u045e-\\u0481',
			'\\u0490-\\u04c4',
			'\\u04c7-\\u04c8',
			'\\u04cb-\\u04cc',
			'\\u04d0-\\u04eb',
			'\\u04ee-\\u04f5',
			'\\u04f8-\\u04f9',
			'\\u0531-\\u0556',
			'\\u0559',
			'\\u0561-\\u0586',
			'\\u05d0-\\u05ea',
			'\\u05f0-\\u05f2',
			'\\u0621-\\u063a',
			'\\u0641-\\u064a',
			'\\u0671-\\u06b7',
			'\\u06ba-\\u06be',
			'\\u06c0-\\u06ce',
			'\\u06d0-\\u06d3',
			'\\u06d5',
			'\\u06e5-\\u06e6',
			'\\u0905-\\u0939',
			'\\u093d',
			'\\u0958-\\u0961',
			'\\u0985-\\u098c',
			'\\u098f-\\u0990',
			'\\u0993-\\u09a8',
			'\\u09aa-\\u09b0',
			'\\u09b2',
			'\\u09b6-\\u09b9',
			'\\u09dc-\\u09dd',
			'\\u09df-\\u09e1',
			'\\u09f0-\\u09f1',
			'\\u0a05-\\u0a0a',
			'\\u0a0f-\\u0a10',
			'\\u0a13-\\u0a28',
			'\\u0a2a-\\u0a30',
			'\\u0a32-\\u0a33',
			'\\u0a35-\\u0a36',
			'\\u0a38-\\u0a39',
			'\\u0a59-\\u0a5c',
			'\\u0a5e',
			'\\u0a72-\\u0a74',
			'\\u0a85-\\u0a8b',
			'\\u0a8d',
			'\\u0a8f-\\u0a91',
			'\\u0a93-\\u0aa8',
			'\\u0aaa-\\u0ab0',
			'\\u0ab2-\\u0ab3',
			'\\u0ab5-\\u0ab9',
			'\\u0abd',
			'\\u0ae0',
			'\\u0b05-\\u0b0c',
			'\\u0b0f-\\u0b10',
			'\\u0b13-\\u0b28',
			'\\u0b2a-\\u0b30',
			'\\u0b32-\\u0b33',
			'\\u0b36-\\u0b39',
			'\\u0b3d',
			'\\u0b5c-\\u0b5d',
			'\\u0b5f-\\u0b61',
			'\\u0b85-\\u0b8a',
			'\\u0b8e-\\u0b90',
			'\\u0b92-\\u0b95',
			'\\u0b99-\\u0b9a',
			'\\u0b9c',
			'\\u0b9e-\\u0b9f',
			'\\u0ba3-\\u0ba4',
			'\\u0ba8-\\u0baa',
			'\\u0bae-\\u0bb5',
			'\\u0bb7-\\u0bb9',
			'\\u0c05-\\u0c0c',
			'\\u0c0e-\\u0c10',
			'\\u0c12-\\u0c28',
			'\\u0c2a-\\u0c33',
			'\\u0c35-\\u0c39',
			'\\u0c60-\\u0c61',
			'\\u0c85-\\u0c8c',
			'\\u0c8e-\\u0c90',
			'\\u0c92-\\u0ca8',
			'\\u0caa-\\u0cb3',
			'\\u0cb5-\\u0cb9',
			'\\u0cde',
			'\\u0ce0-\\u0ce1',
			'\\u0d05-\\u0d0c',
			'\\u0d0e-\\u0d10',
			'\\u0d12-\\u0d28',
			'\\u0d2a-\\u0d39',
			'\\u0d60-\\u0d61',
			'\\u0e01-\\u0e2e',
			'\\u0e30',
			'\\u0e32-\\u0e33',
			'\\u0e40-\\u0e45',
			'\\u0e81-\\u0e82',
			'\\u0e84',
			'\\u0e87-\\u0e88',
			'\\u0e8a',
			'\\u0e8d',
			'\\u0e94-\\u0e97',
			'\\u0e99-\\u0e9f',
			'\\u0ea1-\\u0ea3',
			'\\u0ea5',
			'\\u0ea7',
			'\\u0eaa-\\u0eab',
			'\\u0ead-\\u0eae',
			'\\u0eb0',
			'\\u0eb2-\\u0eb3',
			'\\u0ebd',
			'\\u0ec0-\\u0ec4',
			'\\u0f40-\\u0f47',
			'\\u0f49-\\u0f69',
			'\\u10a0-\\u10c5',
			'\\u10d0-\\u10f6',
			'\\u1100',
			'\\u1102-\\u1103',
			'\\u1105-\\u1107',
			'\\u1109',
			'\\u110b-\\u110c',
			'\\u110e-\\u1112',
			'\\u113c',
			'\\u113e',
			'\\u1140',
			'\\u114c',
			'\\u114e',
			'\\u1150',
			'\\u1154-\\u1155',
			'\\u1159',
			'\\u115f-\\u1161',
			'\\u1163',
			'\\u1165',
			'\\u1167',
			'\\u1169',
			'\\u116d-\\u116e',
			'\\u1172-\\u1173',
			'\\u1175',
			'\\u119e',
			'\\u11a8',
			'\\u11ab',
			'\\u11ae-\\u11af',
			'\\u11b7-\\u11b8',
			'\\u11ba',
			'\\u11bc-\\u11c2',
			'\\u11eb',
			'\\u11f0',
			'\\u11f9',
			'\\u1e00-\\u1e9b',
			'\\u1ea0-\\u1ef9',
			'\\u1f00-\\u1f15',
			'\\u1f18-\\u1f1d',
			'\\u1f20-\\u1f45',
			'\\u1f48-\\u1f4d',
			'\\u1f50-\\u1f57',
			'\\u1f59',
			'\\u1f5b',
			'\\u1f5d',
			'\\u1f5f-\\u1f7d',
			'\\u1f80-\\u1fb4',
			'\\u1fb6-\\u1fbc',
			'\\u1fbe',
			'\\u1fc2-\\u1fc4',
			'\\u1fc6-\\u1fcc',
			'\\u1fd0-\\u1fd3',
			'\\u1fd6-\\u1fdb',
			'\\u1fe0-\\u1fec',
			'\\u1ff2-\\u1ff4',
			'\\u1ff6-\\u1ffc',
			'\\u2126',
			'\\u212a-\\u212b',
			'\\u212e',
			'\\u2180-\\u2182',
			'\\u3041-\\u3094',
			'\\u30a1-\\u30fa',
			'\\u3105-\\u312c',
			'\\uac00-\\ud7a3'
		].join('')}]`
	)
).name('BASE_CHAR');

const COMBINING_CHAR = match(
	new RegExp(
		`[${[
			'\\u0300-\\u0345',
			'\\u0360-\\u0361',
			'\\u0483-\\u0486',
			'\\u0591-\\u05a1',
			'\\u05a3-\\u05b9',
			'\\u05bb-\\u05bd',
			'\\u05bf',
			'\\u05c1-\\u05c2',
			'\\u05c4',
			'\\u064b-\\u0652',
			'\\u0670',
			'\\u06d6-\\u06dc',
			'\\u06dd-\\u06df',
			'\\u06e0-\\u06e4',
			'\\u06e7-\\u06e8',
			'\\u06ea-\\u06ed',
			'\\u0901-\\u0903',
			'\\u093c',
			'\\u093e-\\u094c',
			'\\u094d',
			'\\u0951-\\u0954',
			'\\u0962-\\u0963',
			'\\u0981-\\u0983',
			'\\u09bc',
			'\\u09be',
			'\\u09bf',
			'\\u09c0-\\u09c4',
			'\\u09c7-\\u09c8',
			'\\u09cb-\\u09cd',
			'\\u09d7',
			'\\u09e2-\\u09e3',
			'\\u0a02',
			'\\u0a3c',
			'\\u0a3e',
			'\\u0a3f',
			'\\u0a40-\\u0a42',
			'\\u0a47-\\u0a48',
			'\\u0a4b-\\u0a4d',
			'\\u0a70-\\u0a71',
			'\\u0a81-\\u0a83',
			'\\u0abc',
			'\\u0abe-\\u0ac5',
			'\\u0ac7-\\u0ac9',
			'\\u0acb-\\u0acd',
			'\\u0b01-\\u0b03',
			'\\u0b3c',
			'\\u0b3e-\\u0b43',
			'\\u0b47-\\u0b48',
			'\\u0b4b-\\u0b4d',
			'\\u0b56-\\u0b57',
			'\\u0b82-\\u0b83',
			'\\u0bbe-\\u0bc2',
			'\\u0bc6-\\u0bc8',
			'\\u0bca-\\u0bcd',
			'\\u0bd7',
			'\\u0c01-\\u0c03',
			'\\u0c3e-\\u0c44',
			'\\u0c46-\\u0c48',
			'\\u0c4a-\\u0c4d',
			'\\u0c55-\\u0c56',
			'\\u0c82-\\u0c83',
			'\\u0cbe-\\u0cc4',
			'\\u0cc6-\\u0cc8',
			'\\u0cca-\\u0ccd',
			'\\u0cd5-\\u0cd6',
			'\\u0d02-\\u0d03',
			'\\u0d3e-\\u0d43',
			'\\u0d46-\\u0d48',
			'\\u0d4a-\\u0d4d',
			'\\u0d57',
			'\\u0e31',
			'\\u0e34-\\u0e3a',
			'\\u0e47-\\u0e4e',
			'\\u0eb1',
			'\\u0eb4-\\u0eb9',
			'\\u0ebb-\\u0ebc',
			'\\u0ec8-\\u0ecd',
			'\\u0f18-\\u0f19',
			'\\u0f35',
			'\\u0f37',
			'\\u0f39',
			'\\u0f3e',
			'\\u0f3f',
			'\\u0f71-\\u0f84',
			'\\u0f86-\\u0f8b',
			'\\u0f90-\\u0f95',
			'\\u0f97',
			'\\u0f99-\\u0fad',
			'\\u0fb1-\\u0fb7',
			'\\u0fb9',
			'\\u20d0-\\u20dc',
			'\\u20e1',
			'\\u302a-\\u302f',
			'\\u3099',
			'\\u309a'
		].join('')}]`
	)
).name('COMBINING_CHAR');

const DIGIT = match(
	new RegExp(
		`[${[
			'\\u0030-\\u0039',
			'\\u0660-\\u0669',
			'\\u06f0-\\u06f9',
			'\\u0966-\\u096f',
			'\\u09e6-\\u09ef',
			'\\u0a66-\\u0a6f',
			'\\u0ae6-\\u0aef',
			'\\u0b66-\\u0b6f',
			'\\u0be7-\\u0bef',
			'\\u0c66-\\u0c6f',
			'\\u0ce6-\\u0cef',
			'\\u0d66-\\u0d6f',
			'\\u0e50-\\u0e59',
			'\\u0ed0-\\u0ed9',
			'\\u0f20-\\u0f29'
		].join('')}]`
	)
).name('DIGIT');

const EXTENDER = match(
	new RegExp(
		`[${[
			'\\u00b7',
			'\\u02d0',
			'\\u02d1',
			'\\u0387',
			'\\u0640',
			'\\u0e46',
			'\\u0ec6',
			'\\u3005',
			'\\u3031-\\u3035',
			'\\u309d-\\u309e',
			'\\u30fc-\\u30fe'
		].join('')}]`
	)
).name('EXTENDER');

const IDEOGRAPHIC = match(/[\u3007\u3021-\u3029\u4e00-\u9fa5]/).name(
	'IDEOGRAPHIC'
);

const JSP_COMMENT_END = match('--%>').name('JSP_COMMENT_END');
const JSP_COMMENT_START = match('<%--').name('JSP_COMMENT_START');

const JSP_DIRECTIVE_END = match('%>').name('JSP_DIRECTIVE_END');
const JSP_DIRECTIVE_START = match('<%@').name('JSP_DIRECTIVE_START');

const JSP_DECLARATION_END = match('%>').name('JSP_DECLARATION_END');
const JSP_DECLARATION_START = match('<%!').name('JSP_DECLARATION_START');

const JSP_EXPRESSION_END = match('%>').name('JSP_EXPRESSION_END');
const JSP_EXPRESSION_START = match('<%=').name('JSP_EXPRESSION_START');

const JSP_SCRIPTLET_END = match('%>').name('JSP_SCRIPTLET_END');
const JSP_SCRIPTLET_START = match('<%').name('JSP_SCRIPTLET_START');

const EL_EXPRESSION_END = match('}').name('EL_EXPRESSION_END');
const EL_EXPRESSION_START = match(/[#$]\{/).name('EL_EXPRESSION_START');

const PORTLET_NAMESPACE = match(/<portlet:namespace\s*\/>/).name(
	'PORTLET_NAMESPACE'
);

const QUOTED_CHAR = oneOf(
	match('&apos;'),
	match('&quot;'),
	match('\\\\'),
	match('\\"'),
	match("\\'"),
	match('\\$'),
	match('\\#'),
	// TODO: ELExpressionBody production
	CHAR
).name('QUOTED_CHAR');

const ATTRIBUTES = sequence(
	repeat(sequence('SPACE', 'ATTRIBUTE')),
	maybe('SPACE')
).name('ATTRIBUTES');
// .validate(); // TODO: validate unique

const ATTRIBUTE = sequence(
	// a('NAME').onMatch((name, meta) => {
	//     // sequence() calls this and makes it available on match result
	//     // ATTRIBUTES can do a similar thing; validate() then checks it
	//     // might also want onEnter() or onExit() callbacks;
	//     // Then I could clear the meta data on start of sequence,
	//     // record it as I go, then check it at the end.
	//     meta.names = [...(meta.names || []), name];
	// })
	'NAME',
	'EQ',
	oneOf(
		'RT_ATTRIBUTE_VALUE_DOUBLE',
		'RT_ATTRIBUTE_VALUE_SINGLE',
		'ATTRIBUTE_VALUE_DOUBLE',
		'ATTRIBUTE_VALUE_SINGLE'
	)
).name('ATTRIBUTE');

const RT_ATTRIBUTE_VALUE_DOUBLE = sequence(
	match('"<%='),
	QUOTED_CHAR.except(match('"')).until(match('%>"'))
).name('RT_ATTRIBUTE_VALUE_DOUBLE');

const RT_ATTRIBUTE_VALUE_SINGLE = sequence(
	match("'<%="),
	QUOTED_CHAR.except(match("'")).until(match("%>'"))
).name('RT_ATTRIBUTE_VALUE_SINGLE');

const ATTRIBUTE_VALUE_DOUBLE = sequence(
	match('"'),
	QUOTED_CHAR.until(match('"'))
).name('ATTRIBUTE_VALUE_DOUBLE');

const ATTRIBUTE_VALUE_SINGLE = sequence(
	match("'"),
	QUOTED_CHAR.until(match("'"))
).name('ATTRIBUTE_VALUE_SINGLE');

const ATTRIBUTE_VALUE = oneOf(
	ATTRIBUTE_VALUE_DOUBLE,
	ATTRIBUTE_VALUE_SINGLE
).name('ATTRIBUTE_VALUE');

/**
 * XML 1.0 Section 2.3.
 */
const SPACE = match(/[ \n\r\t]+/).name('SPACE');

/**
 * Escapes `literal` for use in a RegExp.
 */
function escape(literal) {
	// https://github.com/benjamingr/RegExp.escape/blob/master/EscapedChars.md
	return literal.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, '\\$&');
}

/**
 * Returns a matcher that looks up another matcher by name and uses it.
 */
function a(matcherName) {
	return {
		get description() {
			return this._description || lookup(matcherName).description;
		},

		except,

		exec(string) {
			const matcher = lookup(matcherName);

			if (!matcher) {
				throw new Error(`Failed to find matcher with name ${name}`);
			}

			return matcher.exec(string);
		},

		name
	};
}

/**
 * Returns a composite matcher that matches if all the passed `matchers` match,
 * irrespective of order.
 *
 * This is an order-insensitive analog of `sequence()`.
 *
 * Note that permutating has O(!N) runtime, so should be used sparingly.
 */
function allOf(...matchers) {
	// Given matchers [a, b], permute them (eg. [[a, b], [b, a]])...
	const permutations = permute(matchers);

	// ...and transform into: oneOf(sequence(a, b), sequence(b, a)):
	const matcher = oneOf(...permutations.map(m => sequence(...m)));

	return {
		get description() {
			return (
				this._description ||
				'allOf:(' +
					matchers
						.map(matcher => lookup(matcher).description)
						.join(', ') +
					')'
			);
		},

		exec(string) {
			return matcher.exec(string);
		},

		name
	};
}

/**
 * Turns `stringOrRegExp` into a RegExp with a `description` property.
 */
function match(stringOrRegExp) {
	const pattern =
		typeof stringOrRegExp === 'string'
			? escape(stringOrRegExp)
			: stringOrRegExp.source;

	const matcher = new RegExp(`^${pattern}`, 'u');

	Object.defineProperty(matcher, 'description', {
		get: () => {
			return (
				matcher._description ||
				(typeof stringOrRegExp === 'string'
					? JSON.stringify(stringOrRegExp)
					: stringOrRegExp.toString())
			);
		}
	});

	matcher.name = name.bind(matcher);

	matcher.until = until.bind(matcher);

	return matcher;
}

/**
 * Returns a matcher that always matches. If the supplied `matcher` matches, we
 * return the match, otherwise we return a zero-width match.
 *
 * Conceptually equivalent to the "?" regex special character.
 */
function maybe(matcher) {
	return {
		get description() {
			return this._description || `${lookup(matcher).description}?`;
		},

		exec(string) {
			const match = lookup(matcher).exec(string);

			if (match !== null) {
				return match;
			} else {
				// Fake a zero-width match.
				return getMatchObject('');
			}
		},

		name
	};
}

function until(predicate) {
	const parent = this;

	return {
		get description() {
			return this._description || `-> ${lookup(predicate).description}`;
		},

		exec(string) {
			let remaining = string;
			let consumed = '';

			while (remaining !== '') {
				let match = predicate.exec(remaining);

				if (match !== null) {
					remaining = remaining.slice(match[0].length);

					return getMatchObject(consumed + match[0]);
				}

				match = parent.exec(remaining);

				if (match !== null) {
					remaining = remaining.slice(match[0].length);

					consumed += match[0];
				} else {
					break;
				}
			}

			return null;
		},

		name
	};
}

function except(predicate) {
	const parent = this;

	return {
		get description() {
			return this._description || `^${lookup(matcher).description}`;
		},

		exec(string) {
			let match = parent.exec(string);

			if (match !== null) {
				const negated = lookup(predicate).exec(string);

				if (negated !== null) {
					return null;
				}

				return match;
			}

			return null;
		},

		name,

		until
	};
}

/**
 * Returns a composite matcher that matches if one of the supplied matchers
 * matches.
 */
function oneOf(...matchers) {
	return {
		get description() {
			return (
				this._description ||
				matchers.map(matcher => lookup(matcher).description).join(' | ')
			);
		},

		name,

		except,

		exec(string) {
			for (let i = 0; i < matchers.length; i++) {
				const matcher = lookup(matchers[i]);

				const match = matcher.exec(string);

				if (match !== null) {
					return match;
				}
			}

			return null;
		},

		until
	};
}

/**
 * Returns a composite matcher that matches if the passed `matcher` matches at
 * least once.
 *
 * Conceptually equivalent to the "+" regex special char.
 */
function repeat(matcher) {
	return {
		get description() {
			return this._description || `${lookup(matcher).description}+`;
		},

		name,

		exec(string) {
			let remaining = string;
			let consumed = '';

			while (remaining !== '') {
				const match = lookup(matcher).exec(remaining);

				if (match !== null) {
					remaining = remaining.slice(match[0].length);

					consumed += match[0];
				} else {
					break;
				}
			}

			if (consumed) {
				return getMatchObject(consumed);
			} else {
				return null;
			}
		}
	};
}

/**
 * Returns a composite matcher that matches if all of the supplied matchers
 * match, in order.
 */
function sequence(...matchers) {
	return {
		get description() {
			return (
				this._description ||
				matchers.map(matcher => lookup(matcher).description).join(' ')
			);
		},

		exec(string) {
			let remaining = string;
			let matched = '';

			for (let i = 0; i < matchers.length; i++) {
				const matcher = lookup(matchers[i]);
				const match = matcher.exec(remaining);

				if (match !== null) {
					remaining = remaining.slice(match[0].length);

					matched += match[0];
				} else {
					return null;
				}
			}

			return getMatchObject(matched);
		},

		name
	};
}

// TODO: make this a generator
function lex(source) {
	const tokens = [];

	let remaining = source;

	const atEnd = () => remaining.length === 0;

	const consume = matcher => {
		if (typeof matcher === 'string') {
			matcher = match(matcher);
		}

		const result = matcher.exec(remaining);

		if (result === null) {
			fail(matcher);
		}

		remaining = remaining.slice(result[0].length);

		return result[0];
	};

	const fail = reasonOrMatcher => {
		let reason;

		if (reasonOrMatcher.description) {
			reason = `Failed to match ${reasonOrMatcher.description}`;
		} else {
			reason = reasonOrMatcher;
		}

		// TODO: report index, maybe.
		const context =
			remaining.length > 20 ? `${remaining.slice(0, 20)}...` : remaining;

		throw new Error(`${reason} at: ${JSON.stringify(context)}`);
	};

	const peek = matcher => {
		if (typeof matcher === 'string') {
			matcher = match(matcher);
		}

		return matcher.test(remaining);
	};

	const token = (name, contents) => {
		tokens.push({
			name,
			contents,
			index: source.length - remaining.length - contents.length
		});
	};

	while (!atEnd()) {
		if (peek(JSP_COMMENT_START)) {
			const text = consume(
				sequence(JSP_COMMENT_START, CHAR.until(JSP_COMMENT_END))
			);

			token('JSP_COMMENT', text);
		} else if (peek(JSP_DIRECTIVE_START)) {
			let text = consume(sequence(JSP_DIRECTIVE_START, maybe(SPACE)));

			if (peek('include')) {
				text += consume(
					sequence(
						match('include'),
						SPACE,
						match('file'),
						EQ,
						ATTRIBUTE_VALUE
					)
				);
			} else if (peek('page')) {
				text += consume(
					sequence(
						match('page'),
						repeat(
							sequence(
								SPACE,
								oneOf(
									match('language'),
									match('extends'),
									match('import'),
									match('session'),
									match('buffer'),
									match('autoFlush'),
									match('isThreadSafe,'),
									match('info'),
									match('errorPage'),
									match('isErrorPage'),
									match('contentType'),
									match('pageEncoding'),
									match('isELIgnored')
								),
								EQ,
								ATTRIBUTE_VALUE
							)
						)
					)
				);
			} else if (peek('taglib')) {
				text += consume(
					sequence(
						match('taglib'),
						allOf(
							sequence(
								SPACE,
								match('prefix'),
								EQ,
								ATTRIBUTE_VALUE
							),
							oneOf(
								sequence(
									SPACE,
									match('tagdir'),
									EQ,
									ATTRIBUTE_VALUE
								),
								sequence(
									SPACE,
									match('uri'),
									EQ,
									ATTRIBUTE_VALUE
								)
							)
						)
					)
				);
			} else {
				fail('Failed to find valid JSP directive attribute');
			}

			text += consume(sequence(maybe(SPACE), JSP_DIRECTIVE_END));

			token('JSP_DIRECTIVE', text);
		} else if (peek(JSP_DECLARATION_START)) {
			const text = consume(
				sequence(JSP_DECLARATION_START, CHAR.until(JSP_DECLARATION_END))
			);

			token('JSP_DECLARATION', text);
		} else if (peek(JSP_EXPRESSION_START)) {
			const text = consume(
				sequence(JSP_EXPRESSION_START, CHAR.until(JSP_EXPRESSION_END))
			);

			token('JSP_EXPRESSION', text);
		} else if (peek(JSP_SCRIPTLET_START)) {
			const text = consume(
				sequence(JSP_SCRIPTLET_START, CHAR.until(JSP_SCRIPTLET_END))
			);

			token('JSP_SCRIPTLET', text);
		} else if (peek(EL_EXPRESSION_START)) {
			// TODO: Implement full "Expression Language Specification" spec
			const text = consume(
				sequence(EL_EXPRESSION_START, CHAR.until(EL_EXPRESSION_END))
			);

			token('EL_EXPRESSION', text);
		} else if (peek(PORTLET_NAMESPACE)) {
			// This one is a special case of "CustomAction" for liferay-portal.
			const text = consume(PORTLET_NAMESPACE);

			token('PORTLET_NAMESPACE', text);
		} else if (peek(CUSTOM_ACTION_START)) {
			let text = consume(
				sequence(CUSTOM_ACTION_START, CUSTOM_ACTION, ATTRIBUTES)
			);

			// TODO: actually follow grammar here
			text += consume(match(/\s*\/>/));

			token('CUSTOM_ACTION', text);
		} else {
			// TODO: self closing tag
			// TODO: open tag
			// TODO: close tag
			fail('Failed to consume all input');
		}
	}

	return tokens;
}

module.exports = lex;
