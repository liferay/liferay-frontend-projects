/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Manifest from '../manifest';

it('returns essential headers', () => {
	const manifest = new Manifest();

	expect(manifest.content).toEqual(
		`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
`
	);
});

it('set bundleSymbolicName works', () => {
	const manifest = new Manifest();

	manifest.bundleSymbolicName = 'My wonderful bundle';

	expect(manifest.content).toEqual(
		`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
Bundle-SymbolicName: My wonderful bundle
`
	);
});

it('set bundleVersion works', () => {
	const manifest = new Manifest();

	manifest.bundleVersion = '1.0.0';

	expect(manifest.content).toEqual(
		`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
Bundle-Version: 1.0.0
`
	);
});

it('set bundleName works', () => {
	const manifest = new Manifest();

	manifest.bundleName = 'my-wonderful-bundle';

	expect(manifest.content).toEqual(
		`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
Bundle-Name: my-wonderful-bundle
`
	);
});

it('set webContextPath works', () => {
	const manifest = new Manifest();

	manifest.webContextPath = '/my-wonderful-bundle';

	expect(manifest.content).toEqual(
		`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
Web-ContextPath: /my-wonderful-bundle
`
	);
});

it('addProvideCapability works', () => {
	const manifest = new Manifest();

	manifest.addProvideCapability('my-capability', 'capability-value');

	expect(manifest.content).toEqual(
		`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
Provide-Capability: my-capability;capability-value
`
	);
});

it('addRequireCapability works', () => {
	const manifest = new Manifest();

	manifest.addRequireCapability('my-capability', 'capability-value');

	expect(manifest.content).toEqual(
		`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
Require-Capability: my-capability;filter:=capability-value
`
	);
});

describe('addCustomHeader', () => {
	it('works', () => {
		const manifest = new Manifest();

		manifest.addCustomHeader('Custom-Header', 'Custom value');
		manifest.addCustomHeader('Custom-Header-2', 'Custom value 2');

		expect(manifest.content).toEqual(
			`Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Tool: liferay-npm-bundler-2.18.7
Custom-Header: Custom value
Custom-Header-2: Custom value 2
`
		);
	});

	it('throws when a forbidden header is added', () => {
		const manifest = new Manifest();

		expect(() =>
			manifest.addCustomHeader('Manifest-Version', '1.2.3')
		).toThrowError();
	});

	it('throws when a header is added twice', () => {
		const manifest = new Manifest();

		expect(() => {
			manifest.addCustomHeader('My-Header', 'Value');
			manifest.addCustomHeader('My-Header', 'Other-Value');
		}).toThrowError();
	});
});
