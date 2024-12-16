/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

import convertNpmbuildrcToLiferayJson from './convertNpmbuildrcToLiferayJson';
import safeReadJson from './safeReadJson';

const {
	PkgJson: {addDependencies, deleteDependencies, deleteScripts, setScripts},
} = TRANSFORM_OPERATIONS;
const {info, print, success, text, warn} = format;

export default async function upgradeRegularProject(): Promise<void> {
	await convertNpmbuildrcToLiferayJson();
	await moveAssetsToSrc();
	await migratePackageJson();
	await migrateNpmbundlerrc();
}

upgradeRegularProject.signatureDependencies = ['liferay-npm-bundler'];

upgradeRegularProject.steps = [
	text`
 · Convert {.npmbuildrc} to {.liferay.json}
 · Move everything under {assets} to {src} folder
 · Remove old Liferay JavaScript Toolkit dependencies from {package.json}
 · Add {@liferay/portal-agnostic} dependency to {package.json}
 · Tweak {build} script in {package.json}
 · Tweak {deploy} script in {package.json}
 · Add {clean} script to {package.json}
 · Remove {copy-assets} script from {package.json}
 · Remove {start} script from {package.json}
 · Remove {translate} script from {package.json}
 · Remove redundant configuration from {.npmbundlerrc}
`,
	warn`
Note that, as a result of the last two modifications, you may lose support for
{npm run translate} and {npm run start}. If you are not using these scripts you
don't need to worry about it, but if you really need them in your upgraded
projects, please contact us by filing an issue in the following URL, saying that
you are upgrading a project and you need them:

    https://github.com/liferay/liferay-frontend-projects/issues/new

Thanks a lot for your cooperation!
`,
];

upgradeRegularProject.caveats = [
	warn`
Remember that the support for {npm run start} and {npm run translate} has been
dropped. If you were not using these scripts you don't need to worry about it,
but if you really need them, please undo the upgrade and contact us by filing an
issue in the following URL, saying that you are upgrading a project and you need
them:

    https://github.com/liferay/liferay-frontend-projects/issues/new
`,
];

async function migrateNpmbundlerrc(): Promise<void> {
	const npmbundlerrc = safeReadJson('.npmbundlerrc');

	const createJar = npmbundlerrc['create-jar'];

	if (createJar) {
		if (createJar['output-dir'] === 'dist') {
			delete createJar['output-dir'];
		}

		const features = createJar['features'];

		if (features) {
			const pkgJson = require(path.resolve('package.json'));

			if (features['js-extender'] === true) {
				delete features['js-extender'];
			}

			if (
				features['web-context'] ===
				`/${pkgJson.name}-${pkgJson.version}`
			) {
				delete features['web-context'];
			}

			if (features['localization'] === 'features/localization/Language') {
				delete features['localization'];
			}

			if (features['configuration'] === 'features/configuration.json') {
				delete features['configuration'];
			}

			if (!Object.keys(features).length) {
				delete createJar['features'];
			}
		}

		if (!Object.keys(createJar).length) {
			delete npmbundlerrc['create-jar'];
		}
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

async function migratePackageJson(): Promise<void> {
	const pkgJsonFile = new FilePath('package.json');

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		deleteDependencies(
			'liferay-npm-bundler',
			'liferay-npm-build-support',
			'copy-webpack-plugin',
			'webpack',
			'webpack-cli',
			'webpack-dev-server',
			'@babel/cli',
			'@babel/core',
			'@babel/preset-env'
		)
	);

	print(
		success`Removed old Liferay JavaScript Toolkit dependencies from {package.json}`
	);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addDependencies({
			'@liferay/portal-agnostic': '*',
		})
	);

	print(
		success`Added {@liferay/portal-agnostic} dependency to {package.json}`
	);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		setScripts({
			build: 'liferay build',
			clean: 'liferay clean',
			deploy: 'liferay deploy',
		}),
		deleteScripts('copy-assets', 'start', 'translate')
	);

	print(
		success`Tweaked {build} script in {package.json}`,
		success`Tweaked {deploy} script in {package.json}`,
		success`Added {clean} script to {package.json}`,
		success`Removed {copy-assets} script from {package.json}`,
		success`Removed {start} script from {package.json}`,
		success`Removed {translate} script from {package.json}`
	);
}

async function moveAssetsToSrc(): Promise<void> {
	if (!fs.existsSync('assets')) {
		print(info`Skipping move everything under {assets} to {src} folder`);

		return;
	}

	visitFiles('assets', (dirPath, fileName) => {
		const filePath = path.join(dirPath, fileName);

		if (fileName === '.placeholder') {
			return;
		}

		const relFilePath = path.relative('assets', filePath);
		const assetsRelFilePath = path.join('assets', relFilePath);

		let srcRelFilePath = path.join('src', relFilePath);

		srcRelFilePath = srcRelFilePath.replace(/.css$/i, '.scss');

		fs.mkdirSync(path.dirname(srcRelFilePath), {recursive: true});

		fs.writeFileSync(srcRelFilePath, fs.readFileSync(assetsRelFilePath));

		fs.unlinkSync(assetsRelFilePath);
	});

	await fsPromises.rmdir('assets', {recursive: true});

	print(success`Moved everything under {assets} to {src} folder`);
}

function visitFiles(
	dirPath: string,
	callback: {(dirPath: string, fileName: string): void}
): void {
	fs.readdirSync(dirPath, {withFileTypes: true}).forEach((dirent) => {
		if (dirent.isDirectory()) {
			visitFiles(path.join(dirPath, dirent.name), callback);
		}
		else {
			callback(dirPath, dirent.name);
		}
	});
}
