/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	addMetatypeAttr,
	addMetatypeLocalization,
	createMetatype,
	format,
} from '../xml';
import {
	SystemConfigurationField,
	SystemConfiguration,
} from 'liferay-npm-build-tools-common/lib/api/configuration-json';

describe('addMetatypeAttr', () => {
	it('works with just the type', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
		} as SystemConfigurationField);

		expect(xml).toMatchSnapshot();
	});

	it('adds description if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			description: 'a-description',
		} as SystemConfigurationField);

		expect(xml).toMatchSnapshot();
	});

	it('adds required if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			required: true,
		} as SystemConfigurationField);

		expect(xml).toMatchSnapshot();
	});

	it('adds default if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			default: 'default-value',
		} as SystemConfigurationField);

		expect(xml).toMatchSnapshot();
	});

	it('adds options if present', () => {
		const xml = createMetatype('id', 'name');
		addMetatypeAttr(xml, 'an-attr', {
			type: 'string',
			options: {
				A: 'option-a',
				B: 'option-b',
			},
		} as any);

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
	} as SystemConfigurationField);
	addMetatypeAttr(xml, 'a-float', {
		type: 'float',
	} as SystemConfigurationField);
	addMetatypeAttr(xml, 'a-string', {
		type: 'string',
	} as SystemConfigurationField);
	addMetatypeAttr(xml, 'a-boolean', {
		type: 'boolean',
	} as SystemConfigurationField);
	addMetatypeAttr(xml, 'an-option', {
		type: 'string',
		default: 'A',
		options: {
			A: 'option-a',
			B: 'option-b',
		},
	} as any);

	expect(format(xml)).toMatchSnapshot();
});
