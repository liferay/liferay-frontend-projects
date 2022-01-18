/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {addPackageDependencies} from '../dependencies';

expect.extend({
	toMatchDependencies(deps, ...pkgIds) {
		const missingDeps = [];
		const extraDeps = [];
		const invalidDepFields = {};

		pkgIds.forEach((pkgId) => {
			const dep = deps[pkgId];

			if (!dep) {
				missingDeps.push(pkgId);
			}
			else {
				let pkgName;
				let pkgVersion;

				if (pkgId === PkgDesc.ROOT_ID) {
					pkgName = 'test-project';
					pkgVersion = '1.0.0';
				}
				else {
					const pkgIdParts = pkgId.split('@');
					pkgName = pkgIdParts[0];
					pkgVersion = pkgIdParts[1];
				}

				const invalidFields = invalidDepFields[pkgId] || {};

				if (dep.id !== pkgId) {
					invalidFields.id = `${dep.id} (expected: ${pkgId})`;
				}

				if (dep.name !== pkgName) {
					invalidFields.name = `${dep.name} (expected: ${pkgName})`;
				}

				if (dep.version !== pkgVersion) {
					invalidFields.version =
						`${dep.version} ` + `(expected: ${pkgVersion})`;
				}

				const expectedDepDir =
					pkgId === PkgDesc.ROOT_ID
						? ''
						: path.normalize(`node_modules/${pkgName}`);

				if (
					dep.dir.asNative !== '.' &&
					!dep.dir.asNative.endsWith(expectedDepDir)
				) {
					invalidFields.dir =
						`${dep.dir} ` + `(expected: ${expectedDepDir})`;
				}

				if (Object.keys(invalidFields).length) {
					invalidDepFields[pkgId] = invalidFields;
				}
			}
		});

		Object.keys(deps).forEach((depId) => {
			if (pkgIds.indexOf(depId) === -1) {
				extraDeps.push(depId);
			}
		});

		let pass = true;
		let message = '';

		if (missingDeps.length) {
			message += `\nRequired dependencies missing: ${missingDeps}\n`;
			pass = false;
		}

		if (extraDeps.length) {
			message += `\nNot required dependencies found: ${extraDeps}\n`;
			pass = false;
		}

		if (Object.keys(invalidDepFields).length) {
			message += `\nInvalid dependency fields: ${JSON.stringify(
				invalidDepFields,
				'',
				2
			)}\n`;
			pass = false;
		}

		return {
			message: () => message,
			pass,
		};
	},
});

beforeAll(() => {
	project.loadFrom(path.join(__dirname, '__fixtures__', 'project'));
});

it('loads project dependencies correctly', () => {
	const deps = addPackageDependencies({}, project.dir.asNative);

	expect(deps).toMatchDependencies(
		PkgDesc.ROOT_ID,
		'test-project-dep-0@1.0.0',
		'test-project-dep-1@1.0.0',
		'test-project-dep-0@0.1.0'
	);
});

it('appends extra dependencies correctly', () => {
	const deps = addPackageDependencies({}, project.dir.asNative, [
		'stale-package',
	]);

	expect(deps).toMatchDependencies(
		'stale-package@1.0.0',
		PkgDesc.ROOT_ID,
		'test-project-dep-0@1.0.0',
		'test-project-dep-1@1.0.0',
		'test-project-dep-0@0.1.0'
	);
});
