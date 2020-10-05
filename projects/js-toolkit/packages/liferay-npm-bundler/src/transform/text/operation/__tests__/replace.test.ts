/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import replace from '../replace';

describe('replace', () => {
	it('works with strings', async () => {
		const text = `Erase un hombre a una nariz pegado, erase una nariz superlativa...`;

		const replaced = await replace(
			new Map([
				['una', 'dos'],
				['nariz', 'narices'],
				['erase', 'eranse'],
				['superlativa', 'superlativas'],
			])
		)(text);

		expect(replaced).toBe(
			`Erase un hombre a dos narices pegado, eranse dos narices superlativas...`
		);
	});

	it('works with RegExps', async () => {
		const text = `Erase un hombre a una nariz pegado, erase una nariz superlativa...`;

		const replaced = await replace(
			new Map([
				[/erase/gi, 'eranse'],
				[/un hombre/g, 'dos hombres'],
				[/una nariz/g, 'dos narices'],
				[/superlativa/g, 'superlativas'],
			])
		)(text);

		expect(replaced).toBe(
			`eranse dos hombres a dos narices pegado, eranse dos narices superlativas...`
		);
	});
});
