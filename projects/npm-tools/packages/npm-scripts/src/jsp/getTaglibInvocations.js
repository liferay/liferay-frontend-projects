/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

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
			consume,
			fail,
			match,
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
			ATTRIBUTE,
			CHAR,
			CUSTOM_ACTION,
			CUSTOM_ACTION_START,
			SPACE,
		} = require('./getJSPTokenMatchers')(api);

		return () => {
			if (peek(sequence(CUSTOM_ACTION_START, CUSTOM_ACTION))) {
				consume(CUSTOM_ACTION_START);

				return token('TAG', consume(CUSTOM_ACTION));
			}
			else if (peek(SPACE)) {
				consume(SPACE);

				return token('SPACE', '·');
			}
			else if (peek(ATTRIBUTE)) {
				return token('ATTRIBUTE', consume());
			}
			else if (peek(oneOf(match('>'), match('/>')))) {
				consume(repeat(CHAR));

				return token('REST', '·');
			}
			else {
				fail('Failed to consume all input');
			}
		};
	});

	return [...lexer.lex(source)];
}

function getLineNumber(offset, lineOffsets) {
	for (let i = 0; i < lineOffsets.length; i++) {
		if (offset < lineOffsets[i]) {
			return i;
		}
	}

	throw new Error(
		`Invalid offset ${offset} (last offset is ${
			lineOffsets[lineOffsets.length - 1]
		}`
	);
}

module.exports = function (jsp, ...tags) {
	const invocations = [];

	const lineOffsets = jsp.split('\n').reduce(
		(offsets, line) => {
			offsets.push(offsets[offsets.length - 1] + line.length + 1);
			return offsets;
		},
		[0]
	);

	for (const tag of tags) {
		let from = 0;

		while ((from = jsp.indexOf(`<${tag}`, from)) !== -1) {
			let to = jsp.indexOf(`</${tag}>`, from + 1 + tag.length);

			if (to > 0) {
				to += 3 + tag.length; // 3 accounts for '</' plus '>'
			}
			else {
				to = jsp.indexOf('/>', from + 1 + tag.length);

				if (to === -1) {

					// tag did not close, so stop searching

					break;
				}

				to += 2; // 2 accounts for '/>'
			}

			const jspFragment = jsp.substring(from, to);

			const tokens = lex(jspFragment);

			const attributes = {};

			const attributeTokens = tokens.filter(
				(token) => token.name === 'ATTRIBUTE'
			);

			for (const token of attributeTokens) {
				const {contents} = token;

				const i = contents.indexOf('=');
				const name = contents.substring(0, i);
				const value = contents.substring(i + 2, contents.length - 1); // 2 accounts for `="`

				attributes[name] = value;
			}

			invocations.push({
				attributes,
				line: getLineNumber(from, lineOffsets),
				tag,
			});

			from = to;
		}
	}

	return invocations;
};
