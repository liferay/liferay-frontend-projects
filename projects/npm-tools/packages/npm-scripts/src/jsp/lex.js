/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Allow variables (BASE_CHAR, DIGIT etc) which are for readability only.
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^[A-Z_]+$" }] */

const Lexer = require('./Lexer');

const DEFAULT_OPTIONS = {
	ELEnabled: true,
};

function lex(source, options = {}) {
	const {ELEnabled} = {
		...DEFAULT_OPTIONS,
		...options,
	};

	const lexer = new Lexer((api) => {
		const {
			allOf,
			an,
			consume,
			fail,
			match,
			maybe,
			meta,
			oneOf,
			peek,
			repeat,
			sequence,
			token,
		} = api;

		meta.set('ELEnabled', !!ELEnabled);
		meta.commit();

		const {
			ATTRIBUTE_VALUE,
			ATTRIBUTES,
			CHAR,
			CUSTOM_ACTION,
			CUSTOM_ACTION_END,
			CUSTOM_ACTION_START,
			EL_EXPRESSION,
			EL_EXPRESSION_START,
			EQ,
			JSP_COMMENT_END,
			JSP_COMMENT_START,
			JSP_DECLARATION_END,
			JSP_DECLARATION_START,
			JSP_DIRECTIVE_END,
			JSP_DIRECTIVE_START,
			JSP_EXPRESSION_END,
			JSP_EXPRESSION_START,
			JSP_SCRIPTLET_END,
			JSP_SCRIPTLET_START,
			PORTLET_NAMESPACE,
			SPACE,
			TEMPLATE_TEXT,
		} = require('./jspDSL')(api);

		return () => {
			if (peek(JSP_COMMENT_START)) {
				const text = consume(
					JSP_COMMENT_START,
					CHAR.to(JSP_COMMENT_END)
				);

				return token('JSP_COMMENT', text);
			}
			else if (peek(JSP_DIRECTIVE_START)) {
				let text = consume(JSP_DIRECTIVE_START, maybe(SPACE));

				if (peek('include')) {
					text += consume(
						match('include'),
						SPACE,
						match('file'),
						EQ,
						ATTRIBUTE_VALUE
					);
				}
				else if (peek('page')) {
					text += consume(
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
								).onMatch((match, meta) => {
									meta.set('attribute:last', match[0]);
								}),
								EQ,
								an(ATTRIBUTE_VALUE).onMatch((match, meta) => {
									if (
										meta.get('attribute:last') ===
										'isELIgnored'
									) {
										meta.set(
											'ELEnabled',
											match[0] === "'false'" ||
												match[0] === '"false"'
										);
									}
								})
							)
						)
					);
				}
				else if (peek('taglib')) {
					text += consume(
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
					);
				}
				else {
					fail('Failed to find valid JSP directive attribute');
				}

				text += consume(maybe(SPACE), JSP_DIRECTIVE_END);

				return token('JSP_DIRECTIVE', text);
			}
			else if (peek(JSP_DECLARATION_START)) {
				const text = consume(
					JSP_DECLARATION_START,
					CHAR.to(JSP_DECLARATION_END)
				);

				return token('JSP_DECLARATION', text);
			}
			else if (peek(JSP_EXPRESSION_START)) {
				const text = consume(
					JSP_EXPRESSION_START,
					CHAR.to(JSP_EXPRESSION_END)
				);

				return token('JSP_EXPRESSION', text);
			}
			else if (peek(JSP_SCRIPTLET_START)) {
				const text = consume(
					JSP_SCRIPTLET_START,
					CHAR.to(JSP_SCRIPTLET_END)
				);

				return token('JSP_SCRIPTLET', text);
			}
			else if (peek(EL_EXPRESSION_START) && meta.get('ELEnabled')) {
				const text = consume(EL_EXPRESSION);

				return token('EL_EXPRESSION', text);
			}
			else if (peek(PORTLET_NAMESPACE)) {

				// This one is a special case of "CustomAction" for liferay-portal.

				const text = consume(PORTLET_NAMESPACE);

				return token('PORTLET_NAMESPACE', text);
			}
			else if (peek(CUSTOM_ACTION_END, CUSTOM_ACTION)) {
				let text = consume();

				text += consume(maybe(SPACE), match('>'));

				return token('CUSTOM_ACTION_END', text);
			}
			else if (peek(CUSTOM_ACTION_START, CUSTOM_ACTION, ATTRIBUTES)) {
				let text = consume();

				// TODO: consider making this a stack

				const name = meta.get('customAction:name');

				const E_TAG = sequence(
					match('</'),
					match(name),
					maybe(SPACE),
					match('>')
				);

				const EMPTY_BODY = oneOf(
					match('/>'),
					sequence(match('>'), E_TAG)
				);

				if (peek(EMPTY_BODY)) {
					text += consume();

					return token('CUSTOM_ACTION', text);
				}
				else {

					// Will continue tokenizing next time around.

					text += consume(match('>'));

					return token('CUSTOM_ACTION_START', text);
				}
			}
			else if (peek(TEMPLATE_TEXT)) {
				const text = consume(TEMPLATE_TEXT);

				return token('TEMPLATE_TEXT', text);
			}
			else {
				fail('Failed to consume all input');
			}
		};
	});

	const iterable = {};

	Object.defineProperties(iterable, {
		[Symbol.iterator]: {
			value() {
				return lexer.lex(source);
			},
		},

		tokens: {
			get() {
				return [...lexer.lex(source)];
			},
		},
	});

	return iterable;
}

module.exports = lex;
