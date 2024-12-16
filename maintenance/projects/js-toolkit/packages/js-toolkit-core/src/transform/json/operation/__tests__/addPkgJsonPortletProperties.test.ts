/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgJson from '../../../../schema/PkgJson';
import addPkgJsonPortletProperties from '../addPkgJsonPortletProperties';

describe('addPkgJsonPortletProperties', () => {
	let pkgJson: PkgJson;

	beforeEach(() => {
		pkgJson = {
			name: 'a-project',
			version: '1.0.0',
		};
	});

	it('adds portlet properties', async () => {
		const pkgJson2 = await addPkgJsonPortletProperties({
			'javax.portlet.name': 'myportlet',
			'javax.portlet.resource-bundle': 'content.Language',
		})(pkgJson);

		expect(pkgJson2).toStrictEqual({
			name: 'a-project',
			portlet: {
				'javax.portlet.name': 'myportlet',
				'javax.portlet.resource-bundle': 'content.Language',
			},
			version: '1.0.0',
		});
	});
});
