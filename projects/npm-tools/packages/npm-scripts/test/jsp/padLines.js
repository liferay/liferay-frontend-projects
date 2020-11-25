/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const padLines = require('../../src/jsp/padLines');

describe('padLines()', () => {
	it('adds padding lines to make contents start at startLine', () => {
		expect(padLines('{}', 3)).toBe(
			'void 0; /* «pad» */\n' +
				'void 0; /* «pad» */\n' +
				'void 0; /* «pad» */\n' +
				'{}'
		);
	});

	it('uses the supplied padding string', () => {
		expect(padLines('{}', 2, 'void 0;')).toBe('void 0;\nvoid 0;\n{}');
	});

	it('exports a RegExp that can be used to strip padding lines', () => {
		expect(
			(
				'void 0; /* «pad» */\n' +
				'void 0; /* «pad» */\n' +
				'someCode();\n' +
				'otherCode();'
			).replace(padLines.PADDING_LINE, '')
		).toBe('someCode();\n' + 'otherCode();');
	});

	it('can strip padding comments even after minification', () => {

		// Minification strips the "void 0;" statements, but we can still remove
		// the comments.

		expect(
			(
				'/* «pad» */\n' +
				'/* «pad» */\n' +
				'someCode();\n' +
				'otherCode();'
			).replace(padLines.PADDING_LINE, '')
		).toBe('someCode();\n' + 'otherCode();');
	});
});
