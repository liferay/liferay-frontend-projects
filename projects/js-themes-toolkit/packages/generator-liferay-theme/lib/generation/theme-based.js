/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const extractZip = require('extract-zip');
const fs = require('fs-extra');
const got = require('got');
const {
	error,
	info,
	print,
	success,
} = require('liferay-npm-build-tools-common/lib/format');
const path = require('path');
const rimraf = require('rimraf');
const semver = require('semver');
const stream = require('stream');
const {promisify} = require('util');
const xml2js = require('xml2js');
const {argv} = require('yargs');

const ProgressLine = require('../../lib/ProgressLine');
const Project = require('../../lib/utils/Project');
const versions = require('../../lib/versions');

const extract = promisify(extractZip);
const pipeline = promisify(stream.pipeline);

async function writing(generator, themeName) {
	const project = new Project(generator);
	const {liferayVersion} = project;

	let {themeVersion} = argv;

	if (themeVersion === undefined) {
		print(
			'',
			info`
			Querying https://mvnrepository.com for the latest version of Liferay's
			${themeName} theme compatible with ${liferayVersion}...
			`
		);

		const themeVersions = await getThemeVersions(themeName);

		if (themeVersions === undefined) {
			process.exit(1);
		}

		themeVersion = await getLatestThemeVersion(
			themeName,
			themeVersions,
			liferayVersion
		);
	}

	if (themeVersion === undefined) {
		process.exit(1);
	}

	await downloadThemeFiles(project, themeName, themeVersion);

	// Remove downloaded output .css files which shouldn't go in `src`

	removeCssFiles();

	// Merge files which are both in downloaded theme and in the project we are
	// generating (because facet-theme writes them).

	await mergeLiferayLookAndFeelXml(project);
	await mergeLiferayPluginPackageProperties();
	await mergeThumbnailPng();

	print(success`
		Successfully extracted Liferay's ${themeName} theme ${themeVersion} to 
		your project's source folder. 
	`);
}

async function downloadThemeFiles(project, themeName, themeVersion) {
	const warFile = path.resolve(`${themeName}-theme-${themeVersion}.war`);

	try {
		print(info`
			Downloading Liferay's ${themeName} theme ${themeVersion} and copying it 
			to your project's source folder. 

			This may take some time...
		`);

		const stream = got.stream(
			`https://repo1.maven.org/maven2/com/liferay/plugins/${themeName}-theme/${themeVersion}/${themeName}-theme-${themeVersion}.war`
		);

		const progressLine = new ProgressLine();

		stream.on('downloadProgress', (progress) =>
			progressLine.update(progress)
		);

		await pipeline(stream, fs.createWriteStream(warFile));

		progressLine.finish();

		await extract(warFile, {dir: path.resolve('src')});

		fs.unlinkSync(warFile);
	}
	catch (error) {
		print(error`
			Error downloading and extracting Liferay's ${themeName} theme:

			${error.message}
		`);
	}
}

function getLatestThemeVersion(themeName, themeVersions, liferayVersion) {
	const themeSemverExpr = versions.theme[themeName][liferayVersion];

	const sortedCompatibleVersions = themeVersions
		.filter((version) => semver.satisfies(version, themeSemverExpr))
		.sort((l, r) => -semver.compare(l, r));

	if (sortedCompatibleVersions === undefined) {
		print(error`
			Cannot a version of Liferay's ${themeName} theme compatible with ${liferayVersion}
		`);
	}

	return sortedCompatibleVersions[0];
}

async function getThemeVersions(themeName) {
	try {
		const {body} = await got(
			`https://repo1.maven.org/maven2/com/liferay/plugins/${themeName}-theme/maven-metadata.xml`
		);

		const mavenMetadata = await new xml2js.Parser().parseStringPromise(
			body
		);

		const themeVersions =
			mavenMetadata.metadata.versioning[0].versions[0].version;

		if (themeVersions === undefined) {
			print(error`
				Invalid XML returned from https://mvnrepository.com when 
				querying for the list of available versions of Liferay's 
				${themeName} theme.
			`);

			return undefined;
		}

		return themeVersions;
	}
	catch (error) {
		print(error`
			Error when querying https://mvnrepository.com for the list of 
			available versions of Liferay's ${themeName} theme:

			${error.message}
		`);

		return undefined;
	}
}

async function mergeLiferayLookAndFeelXml(project) {

	// The strategy for merging this file is: use the name and id written
	// by facet-theme to substitute the ones comming from the downloaded theme.
	// The rest remains the same as in the downloaded theme.

	// Read the XML from downloaded theme

	const downloadXml = await new xml2js.Parser().parseStringPromise(
		fs.readFileSync(
			path.resolve('src', 'WEB-INF', 'liferay-look-and-feel.xml')
		)
	);

	fs.unlinkSync(path.resolve('src', 'WEB-INF', 'liferay-look-and-feel.xml'));

	// Merge it into project's XML

	project.modifyXmlFile(
		path.join('src', 'WEB-INF', 'liferay-look-and-feel.xml'),
		(xml) => {
			const {id, name} = xml['look-and-feel']['theme'][0]['$'];

			downloadXml['look-and-feel']['compatibility'][0]['version'] =
				xml['look-and-feel']['compatibility'][0]['version'];
			downloadXml['look-and-feel']['theme'][0]['$'] = {
				...downloadXml['look-and-feel']['theme'][0]['$'],
				id,
				name,
			};

			return downloadXml;
		}
	);
}

function mergeLiferayPluginPackageProperties() {

	// The strategy for merging this file is simple: use the new on that
	// facet-theme creates and remove the one coming from downloaded theme.

	fs.unlinkSync(
		path.resolve('src', 'WEB-INF', 'liferay-plugin-package.properties')
	);
}

function mergeThumbnailPng() {

	// The strategy for merging this file is simple: use the new on that
	// facet-theme creates and remove the one coming from downloaded theme.

	fs.unlinkSync(path.resolve('src', 'images', 'thumbnail.png'));
}

function removeCssFiles() {
	rimraf.sync('./src/**/*.css');
	rimraf.sync('./src/**/*.css.map');
}

module.exports = {
	writing,
};
