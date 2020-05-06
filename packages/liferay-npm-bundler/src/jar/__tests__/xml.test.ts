/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {ConfigurationField} from 'liferay-js-toolkit-core/lib/api/configuration-json';

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
		} as ConfigurationField);

		expect(xml).toMatchSnapshot();
	});

	it('adds description if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			description: 'a-description',
		} as ConfigurationField);

		expect(xml).toMatchSnapshot();
	});

	it('adds required if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			required: true,
		} as ConfigurationField);

		expect(xml).toMatchSnapshot();
	});

	it('adds default if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			default: 'default-value',
		} as ConfigurationField);

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
		} as ConfigurationField);

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
	} as ConfigurationField);
	addMetatypeAttr(xml, 'a-float', {
		type: 'float',
	} as ConfigurationField);
	addMetatypeAttr(xml, 'a-string', {
		type: 'string',
	} as ConfigurationField);
	addMetatypeAttr(xml, 'a-boolean', {
		type: 'boolean',
	} as ConfigurationField);
	addMetatypeAttr(xml, 'an-option', {
		name: 'an-option',
		type: 'string',
		default: 'A',
		options: {
			A: 'option-a',
			B: 'option-b',
		},
	} as ConfigurationField);

	expect(format(xml)).toMatchSnapshot();
});
