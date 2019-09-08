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

const JSP_COMMENT_END = match('--%>').name('JSP_COMMENT_END');
const JSP_COMMENT_START = match('<%--').name('JSP_COMMENT_START');

const JSP_DIRECTIVE_END = match('%>').name('JSP_DIRECTIVE_END');
const JSP_DIRECTIVE_START = match('<%@').name('JSP_DIRECTIVE_START');

const JSP_DECLARATION_END = match('%>').name('JSP_DECLARATION_END');
const JSP_DECLARATION_START = match('<%!').name('JSP_DECLARATION_START');

const JSP_EXPRESSION_START = match('<%=').name('JSP_EXPRESSION_START');
const JSP_SCRIPTLET_START = match('<%').name('JSP_SCRIPTLET_START');
const EL_EXPRESSION_START = match('${').name('EL_EXPRESSION_START');
// const EL_EXPRESSION_START = match('$#').name('EL_EXPRESSION_START');
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
);

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

	// TODO: until()

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

			if (match) {
				return match;
			} else {
				// Fake a zero-width match.
				return getMatchObject('');
			}
		},

		name
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

		exec(string) {
			for (let i = 0; i < matchers.length; i++) {
				const matcher = lookup(matchers[i]);

				const match = matcher.exec(string);

				if (match) {
					return match;
				}
			}

			return null;
		},

		until(predicate) {
			const parent = this;

			return {
				get description() {
					// TODO: figure out what to return here
					return '<no description>';
				},

				exec(string) {
					let remaining = string;
					let consumed = '';

					while (remaining !== '') {
						let match = predicate.exec(remaining);

						if (match) {
							remaining = remaining.slice(match[0].length);

							return getMatchObject(consumed + match[0]);
						}

						match = parent.exec(remaining);

						if (match) {
							remaining = remaining.slice(match[0].length);

							consumed += match[0];
						} else {
							break;
						}
					}

					return null;
				}
			};
		}
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
				const match = matcher.exec(remaining);

				if (match) {
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

function lex(source) {
	const tokens = [];

	let remaining = source;

	const atEnd = () => remaining.length === 0;

	const consume = matcher => {
		if (typeof matcher === 'string') {
			matcher = match(matcher);
		}

		return {
			maybe() {
				const match = matcher.exec(remaining);

				if (match) {
					remaining = remaining.slice(match[0].length);

					return match[0];
				}
			},

			once() {
				const match = matcher.exec(remaining) || fail(matcher);

				remaining = remaining.slice(match[0].length);

				return match[0];
			},

			until(predicate) {
				let consumed = '';

				while (!atEnd()) {
					let match = predicate.exec(remaining);

					if (match) {
						remaining = remaining.slice(match[0].length);

						return consumed + match[0];
					}

					match = matcher.exec(remaining);

					if (match) {
						remaining = remaining.slice(match[0].length);

						consumed += match[0];
					} else {
						break;
					}
				}

				fail(
					`Unexpected end-of-input trying to match ${predicate.description}`
				);
			}
		};
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
			let text = consume(JSP_COMMENT_START).once();
			text += consume(CHAR).until(JSP_COMMENT_END);

			token('JSP_COMMENT', text);
		} else if (peek(JSP_DIRECTIVE_START)) {
			let text = consume(JSP_DIRECTIVE_START).once();
			text += consume(SPACE).maybe();

			if (peek('include')) {
				text += consume('include').once();
				text += consume(SPACE).once();
				text += consume('file').once();
				text += consume(EQ).once();
				text += consume(ATTRIBUTE_VALUE).once();
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
				).once();
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
				).once();
			} else {
				fail('Failed to find valid JSP directive attribute');
			}

			text += consume(SPACE).maybe();
			text += consume(JSP_DIRECTIVE_END).once();

			token('JSP_DIRECTIVE', text);
		} else if (peek(JSP_DECLARATION_START)) {
			let text = consume(JSP_DECLARATION_START).once();
			text += consume(CHAR).until(JSP_DECLARATION_END);

			token('JSP_DECLARATION', text);
			// } else if (peek(JSP_EXPRESSION_START)) {
			// } else if (peek(JSP_SCRIPTLET_START)) {
			// } else if (peek(EL_EXPRESSION_START)) {
			// } else if (peek(PORTLET_NAMESPACE)) {
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
