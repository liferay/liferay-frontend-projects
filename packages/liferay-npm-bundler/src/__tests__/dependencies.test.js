import path from 'path';
import {getPackageDependencies} from '../dependencies';

expect.extend({
	toMatchDependencies(deps, ...pkgIds) {
		let missingDeps = [];
		let extraDeps = [];
		let invalidDepFields = {};

		pkgIds.forEach(pkgId => {
			const dep = deps[pkgId];

			if (!dep) {
				missingDeps.push(pkgId);
			} else {
				const pkgIdParts = pkgId.split('@');
				const pkgName = pkgIdParts[0];
				const pkgVersion = pkgIdParts[1];
				let invalidFields = invalidDepFields[pkgId] || {};

				if (dep.id != pkgId) {
					invalidFields.id = `${dep.id} (expected: ${pkgId})`;
				}

				if (dep.name != pkgName) {
					invalidFields.name = `${dep.name} (expected: ${pkgName})`;
				}

				if (dep.version != pkgVersion) {
					invalidFields.version =
						`${dep.version} ` + `(expected: ${pkgVersion})`;
				}

				const expectedDepDir = path.normalize(
					`/node_modules/${pkgName}`
				);

				if (dep.dir != '.' && !dep.dir.endsWith(expectedDepDir)) {
					invalidFields.dir =
						`${dep.dir} ` + `(expected: ...${expectedDepDir})`;
				}

				if (Object.keys(invalidFields).length > 0) {
					invalidDepFields[pkgId] = invalidFields;
				}
			}
		});

		Object.keys(deps).forEach(depId => {
			if (pkgIds.indexOf(depId) == -1) {
				extraDeps.push(depId);
			}
		});

		let pass = true;
		let message = '';

		if (missingDeps.length > 0) {
			message += `\nRequired dependencies missing: ${missingDeps}\n`;
			pass = false;
		}

		if (extraDeps.length > 0) {
			message += `\nNot required dependencies found: ${extraDeps}\n`;
			pass = false;
		}

		if (Object.keys(invalidDepFields).length > 0) {
			message += `\nInvalid dependency fields: ${JSON.stringify(
				invalidDepFields,
				'',
				2
			)}\n`;
			pass = false;
		}

		return {
			message,
			pass,
		};
	},
});

beforeAll(() => {
	process.chdir('./packages/liferay-npm-bundler/src/__tests__');
});

afterAll(() => {
	process.chdir('../../../..');
});

it('loads project dependencies correctly', () => {
	const deps = getPackageDependencies('.');

	expect(deps).toMatchDependencies(
		'test-project@1.0.0',
		'test-project-dep-0@1.0.0',
		'test-project-dep-1@1.0.0',
		'test-project-dep-0@0.1.0'
	);
});

it('appends extra dependencies correctly', () => {
	const deps = getPackageDependencies('.', ['stale-package']);

	expect(deps).toMatchDependencies(
		'stale-package@1.0.0',
		'test-project@1.0.0',
		'test-project-dep-0@1.0.0',
		'test-project-dep-1@1.0.0',
		'test-project-dep-0@0.1.0'
	);
});
