/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	ClientExtensionConfigJson,
	FilePath,
	Project,
	format,
} from '@liferay/js-toolkit-core';
import {question, warn} from '@liferay/js-toolkit-core/lib/format';
import fs from 'fs';
import JSZip from 'jszip';
import {createInterface} from 'readline';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';

import createManifest from '../util/createManifest';
import getWebpackConfiguration from '../util/getWebpackConfiguration';
import promptForDeployPath from '../util/promptForDeployPath';

const {fail, info, print} = format;

export default async function customElement(project: Project): Promise<void> {
	const zipFile = await deployZip(project);

	print(info`Deployed live development Remote App to Liferay`);

	const config = getWebpackConfiguration(project);

	config.devtool = 'cheap-source-map';
	config.mode = 'development';

	const compiler = webpack(config);

	const devServerOptions: webpackDevServer.Configuration = {
		headers: [
			{
				key: 'access-control-allow-headers',
				value: 'Origin, X-Requested-With, Content-Type, Accept, Range',
			},
			{
				key: 'access-control-allow-origin',
				value: '*',
			},
		],
		port: project.start.port,
		static: {
			directory: project.assetsDir.asNative,
		},
	};

	const server = new webpackDevServer(devServerOptions, compiler);

	await server.start();

	process.on('exit', () => {
		print(warn`
Undeployed live development Remote App from Liferay.`);
		print(info`
Run 'yarn deploy' if you want to make your Remote App available in your Liferay
server again by deploying a non-live version of it.`);

		fs.rmSync(zipFile.asNative);
	});
}

async function checkForOldZipFile(zipFile: FilePath): Promise<void> {
	if (!fs.existsSync(zipFile.asNative)) {
		return;
	}

	print(warn`
There is an older version of this project in your Liferay server.`);

	print(info`
Continuing with the 'start' command will redeploy the project and the older
version will be overwritten.`);

	print(question`
Are you sure you want to continue (y/N)?`);

	const lines = createInterface({
		input: process.stdin,
	});

	for await (const line of lines) {
		if (line.toLowerCase() === 'y') {
			break;
		}

		print(fail`Deployment aborted by user`);

		process.exit(2);
	}
}

async function deployZip(project: Project): Promise<FilePath> {
	let deployDir = project.deploy.dir;

	if (!deployDir) {
		deployDir = await promptForDeployPath(project);
	}

	if (!deployDir) {
		print(fail`No path to Liferay installation given: cannot deploy`);
		process.exit(1);
	}

	const zipFile = project.deploy.dir.join(`${project.pkgJson.name}.zip`);

	await checkForOldZipFile(zipFile);

	const manifest = createManifest(project);

	const configurationPid =
		'com.liferay.client.extension.type.configuration.CETConfiguration~' +
		project.pkgJson.name;

	const clientExtensionConfigJson: ClientExtensionConfigJson = {
		[configurationPid]: {
			baseURL: `http://localhost:${project.start.port}`,
			description: project.pkgJson.description || '',
			name: `${project.pkgJson.name} (live development)`,
			sourceCodeURL: '',
			type: 'customElement',
			typeSettings: [
				`cssURLs=${manifest.cssURLs.join('\n')}`,
				`htmlElementName=${manifest.htmlElementName}`,
				'instanceable=true',
				'portletCategoryName=category.remote-apps',
				`urls=${manifest.urls.join('\n')}`,
				`useESM=${manifest.useESM}`,
			],
		},
	};

	const zip = new JSZip();

	zip.file(
		`${project.pkgJson.name}.client-extension-config.json`,
		JSON.stringify(clientExtensionConfigJson, null, '\t')
	);

	const buffer = await zip.generateAsync({
		compression: 'DEFLATE',
		compressionOptions: {
			level: 6,
		},
		type: 'nodebuffer',
	});

	fs.writeFileSync(zipFile.asNative, buffer);

	return zipFile;
}
