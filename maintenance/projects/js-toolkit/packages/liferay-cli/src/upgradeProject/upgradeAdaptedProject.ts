/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	PkgJson,
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import convertNpmbuildrcToLiferayJson from './convertNpmbuildrcToLiferayJson';
import safeReadJson from './safeReadJson';

interface PresetName {
	after: string;
	before: string;
}

const {
	PkgJson: {addDependencies, deleteDependencies, setScripts},
} = TRANSFORM_OPERATIONS;
const {print, success, text} = format;

export default async function upgradeAdaptedProject(): Promise<void> {
	const presetName = getPresetName();

	await convertNpmbuildrcToLiferayJson();
	await migratePackageJson(presetName);
	await migrateNpmbundlerrc(presetName);
}

upgradeAdaptedProject.signatureDependencies = [
	'liferay-npm-bundler-preset-angular-cli',
	'liferay-npm-bundler-preset-create-react-app',
	'liferay-npm-bundler-preset-vue-cli',
];

upgradeAdaptedProject.steps = [
	text`
 · Convert {.npmbuildrc} to {.liferay.json}
 · Remove old Liferay JavaScript Toolkit dependencies from {package.json}
 · Add {@liferay/portal-adapt-[...]} dependency to {package.json}
 · Tweak {build:liferay} script in {package.json}
 · Tweak {deploy:liferay} script in {package.json}
 · Add {clean:liferay} script to {package.json}
 · Remove redundant configuration from {.npmbundlerrc}
`,
];

function getPresetName(): PresetName {
	const {devDependencies} = safeReadJson('package.json') as PkgJson;

	let after: string;
	let before: string;

	if (devDependencies['liferay-npm-bundler-preset-angular-cli']) {
		after = '@liferay/portal-adapt-angular-cli';
		before = 'liferay-npm-bundler-preset-angular-cli';
	}
	else if (devDependencies['liferay-npm-bundler-preset-create-react-app']) {
		after = '@liferay/portal-adapt-create-react-app';
		before = 'liferay-npm-bundler-preset-create-react-app';
	}
	else if (devDependencies['liferay-npm-bundler-preset-vue-cli']) {
		after = '@liferay/portal-adapt-vue-cli';
		before = 'liferay-npm-bundler-preset-vue-cli';
	}
	else {
		print(fail`Cannot find adaptation preset in {package.json}`);
		process.exit(1);
	}

	return {after, before};
}

async function migrateNpmbundlerrc(presetName: PresetName): Promise<void> {
	const npmbundlerrc = safeReadJson('.npmbundlerrc');

	if (npmbundlerrc['preset'] === presetName.before) {
		delete npmbundlerrc['preset'];
	}

	if (Object.keys(npmbundlerrc).length) {
		fs.writeFileSync(
			'.npmbundlerrc',
			JSON.stringify(npmbundlerrc, null, 2)
		);
	}
	else {
		fs.unlinkSync('.npmbundlerrc');
	}

	print(success`Removed redundant configuration from {.npmbundlerrc}`);
}

async function migratePackageJson(presetName: PresetName): Promise<void> {
	const pkgJsonFile = new FilePath('package.json');

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		deleteDependencies(
			'liferay-npm-bundler',
			'liferay-npm-build-support',
			presetName.before
		)
	);

	print(
		success`Removed old Liferay JavaScript Toolkit dependencies from {package.json}`
	);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addDependencies(
			{
				[presetName.after]: '*',
			},
			'dev'
		)
	);

	print(success`Added {${presetName.after}} dependency to {package.json}`);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		setScripts({
			'build:liferay': 'liferay build',
			'clean:liferay': 'liferay clean',
			'deploy:liferay': 'liferay deploy',
		})
	);

	print(
		success`Tweaked {build:liferay} script in {package.json}`,
		success`Tweaked {deploy:liferay} script in {package.json}`,
		success`Added {clean:liferay} script to {package.json}`
	);
}
