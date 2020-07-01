/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {ConfigurationJsonField} from 'liferay-js-toolkit-core';

import {
	addMetatypeAttr,
	addMetatypeLocalization,
	createMetatype,
	format,
} from '../xml';

describe('addMetatypeAttr', () => {
	it('works with just the type', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
		} as ConfigurationJsonField);

		expect(xml).toMatchSnapshot();
	});

	it('adds description if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			description: 'a-description',
		} as ConfigurationJsonField);

		expect(xml).toMatchSnapshot();
	});

	it('adds required if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			required: true,
		} as ConfigurationJsonField);

		expect(xml).toMatchSnapshot();
	});

	it('adds default if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			default: 'default-value',
		} as ConfigurationJsonField);

		expect(xml).toMatchSnapshot();
	});

	it('adds options if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			name: 'an-attr',
			type: 'string',
			options: {
				A: 'option-a',
				B: 'option-b',
			},
		} as ConfigurationJsonField);

		expect(xml).toMatchSnapshot();
	});
});

it('addMetatypeLocalization works', () => {
	const xml = createMetatype('id', 'name');
	addMetatypeLocalization(xml, 'localization/file.properties');

	expect(xml).toMatchSnapshot();
});

it('createMetatype works', () => {
	const xml = createMetatype('id', 'name');

	expect(xml).toMatchSnapshot();
});

it('all together works', () => {
	const xml = createMetatype('id', 'name');
	addMetatypeLocalization(xml, 'localization/file.properties');
	addMetatypeAttr(xml, 'a-number', {
		type: 'number',
	} as ConfigurationJsonField);
	addMetatypeAttr(xml, 'a-float', {
		type: 'float',
	} as ConfigurationJsonField);
	addMetatypeAttr(xml, 'a-string', {
		type: 'string',
	} as ConfigurationJsonField);
	addMetatypeAttr(xml, 'a-boolean', {
		type: 'boolean',
	} as ConfigurationJsonField);
	addMetatypeAttr(xml, 'an-option', {
		name: 'an-option',
		type: 'string',
		default: 'A',
		options: {
			A: 'option-a',
			B: 'option-b',
		},
	} as ConfigurationJsonField);

	expect(format(xml)).toMatchSnapshot();
});
