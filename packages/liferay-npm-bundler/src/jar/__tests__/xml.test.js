import fs from 'fs';
import path from 'path';

import {patchMetatypeXml} from '../xml';

describe('patchMetatypeXml', () => {
	it('works with localization file', () => {
		const xmlFile = path.join(__dirname, '__fixtures__', 'metatype.xml');

		const xml = patchMetatypeXml(fs.readFileSync(xmlFile), {
			localization: 'content/Language',
			pid: 'my-portlet',
		});

		expect(xml).toMatchSnapshot();
	});

	it('works without localization file', () => {
		const xmlFile = path.join(__dirname, '__fixtures__', 'metatype.xml');

		const xml = patchMetatypeXml(fs.readFileSync(xmlFile), {
			pid: 'my-portlet',
		});

		expect(xml).toMatchSnapshot();
	});
});
