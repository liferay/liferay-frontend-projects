/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import template from 'babel-template';
import cpr from 'cpr';
import fs from 'fs-extra';
import {
	error,
	info,
	print,
	question,
	success,
	warn,
} from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';
import readline from 'readline';

import {Renderer, runNpmBin, runNpmScript} from '../../util';

const indexJsNoticeHeader =
	'/*\n' +
	' THIS FILE HAS BEEN MODIFIED BY LIFERAY JS TOOLKIT !!!\n' +
	'\n' +
	' IF YOU ARE SEEING THIS MESSAGE IT MEANS THAT:\n' +
	'\n' +
	'   1) EITHER YOU ARE IN THE MIDDLE OF A BUILD\n' +
	'   2) OR A PREVIOUS BUILD CRASHED\n' +
	'\n' +
	' IF IN CASE 2, THERE SHOULD BE A BACKUP OF THE ORIGINAL FILE NAMED\n' +
	" '.index.js' IN THIS SAME DIRECTORY.\n" +
	'\n' +
	" IF YOU RUN 'npm run build:liferay' AGAIN IT WILL ASK YOU IF YOU WANT\n" +
	' TO RESTORE IT BUT IF YOU WANT TO DO IT MANUALLY YOU CAN, TOO.\n' +
	'\n' +
	' SORRY FOR ANY INCONVENIENCE :-(\n' +
	'*/\n';

const msg = {
	askWhetherToUseBackup: [
		``,
		question`
		Do you want to use restore the backup to {'src/index.js'} (y/{N})? `,
	],
	indexJsBackupPresent: `
		Fortunately, this build tool makes a backup of {'src/index.js'} to 
		{'src/.index.js'} before modifying it. 
		
		You can now restore it in case you want to.
		
		The contents of the backup follow:
		`,
	indexJsModified: [
		warn`
		The {'src/index.js'} file seems to be a modified copy of a previous
		build. This is usually caused by a previous crash.
		`,
	],
	makingBackup: [
		info`
		Making a backup of {'src/index.js'} to {'src/.index.js'} before 
		injecting {Liferay JS Toolkit}'s modifications for the build.
		`,
	],
	indexJsBackupNotPresent: [
		error`
		The modified {'src/index.js'} cannot be used for the build but an
		automatic backup was not found, meaning that probably something went
		badly wrong in a previous build.

		Please restore the {'src/index.js'} file from your version control, or
		fix it manually, to be able to deploy this project.

		We are very sorry, this should not have happened| 😢|.`,
	],
	indexJsBackupNotRestored: [
		error`
		The modified {'src/index.js'} cannot be used for the build but a backup
		was not restored. Please restore the backup or fix the {'src/index.js'} 
		file and then remove the backup {'src/.index.js'} to be able to deploy 
		this project.`,
	],
	noValidEntryPoint: [
		error`
		No valid entry point found in {'src/index.js'}. It is not possible to
		continue and deploy this project to your Liferay server.
		`,
		`
		This build tool assumes that you use a standard React entry point which
		contains one single {ReactDOM.render()} call where the second argument 
		is a {document.getElementById()} call.

		If that is not the case, you may not deploy this application to a 
		Liferay server because it will not know how to attach your UI to the
		page.
		`,
		info`
		Visit http://bit.ly/js-toolkit-wiki for more information.`,
	],
	restoringBackup: [
		info`
		Restoring backup of {'src/index.js'} after React's build has finished.
		`,
	],
	usingPreviousBackup: [
		``,
		success`
		Using previous backup of {'src/index.js'} for this build.
		`,
	],
};

const createReactAppBuildDir = path.join(project.dir, 'build');
const explodedJarDir = path.join(project.dir, 'build.liferay', 'jar');
const pkgJson = readJsonSync(`${project.dir}/package.json`);
const templatesDir = path.join(
	__dirname,
	'..',
	'..',
	'resources',
	'build',
	'create-react-app'
);

const renderer = new Renderer(templatesDir, explodedJarDir);

/**
 * Test if the current project is a create-react-app project
 * @return {boolean}
 */
export function probe() {
	return project.probe.type === project.probe.TYPE_CREATE_REACT_APP;
}

/**
 * Run the specialized build
 */
export function run() {
	return Promise.resolve()
		.then(assertIndexJsIntegrity)
		.then(backupIndexJs)
		.then(tweakIndexJs)
		.then(() => runNpmScript('build'))
		.then(restoreIndexJs)
		.then(copyCreateReactAppBuild)
		.then(injectSources)
		.then(tweakMediaURLs)
		.then(() => runNpmBin('liferay-npm-bundler'))
		.catch(err => {
			if (err.humanMessage) {
				console.log();
				print(err.humanMessage);
				console.log();
			} else {
				console.error(err);
			}

			if (!err.doNotRestoreBackup) {
				restoreIndexJs();
			}

			process.exit(1);
		});
}

function assertIndexJsIntegrity() {
	const indexJsPath = path.join(project.dir, 'src', 'index.js');

	const indexJsContent = fs.readFileSync(indexJsPath).toString();

	if (indexJsContent.indexOf(indexJsNoticeHeader) != -1) {
		print(msg.indexJsModified);

		const dotIndexJsPath = path.join(project.dir, 'src', '.index.js');

		if (fs.existsSync(dotIndexJsPath)) {
			print(msg.indexJsBackupPresent);
			console.log(
				fs
					.readFileSync(dotIndexJsPath)
					.toString()
					.split('\n')
					.map(line => `> ${line}`)
					.join('\n')
			);

			const prompt = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			return new Promise((resolve, reject) => {
				print(msg.askWhetherToUseBackup);
				prompt.question('', answer => {
					if (answer === 'Y' || answer === 'y') {
						print(msg.usingPreviousBackup);
						fs.copyFileSync(dotIndexJsPath, indexJsPath);
						return resolve();
					}

					return reject(
						Object.assign(new Error(), {
							humanMessage: msg.indexJsBackupNotRestored,
							doNotRestoreBackup: true,
						})
					);
				});
			});
		} else {
			throw Object.assign(new Error(), {
				humanMessage: msg.indexJsBackupNotPresent,
				doNotRestoreBackup: true,
			});
		}
	}
}

function backupIndexJs() {
	const indexJsPath = path.join(project.dir, 'src', 'index.js');
	const dotIndexJsPath = path.join(project.dir, 'src', '.index.js');

	print(msg.makingBackup);
	fs.copyFileSync(indexJsPath, dotIndexJsPath);
}

function tweakIndexJs() {
	const indexJsPath = path.join(project.dir, 'src', 'index.js');

	const result = babel.transformFileSync(
		path.join(project.dir, 'src', 'index.js'),
		{
			parserOpts: {
				plugins: ['jsx'],
			},
			plugins: [babelPlugin],
		}
	);

	fs.writeFileSync(indexJsPath, indexJsNoticeHeader + result.code);
}

function restoreIndexJs() {
	const indexJsPath = path.join(project.dir, 'src', 'index.js');
	const dotIndexJsPath = path.join(project.dir, 'src', '.index.js');

	if (fs.existsSync(dotIndexJsPath)) {
		print(msg.restoringBackup);
		fs.copyFileSync(dotIndexJsPath, indexJsPath);
		fs.unlinkSync(dotIndexJsPath);
	}
}

function copyCreateReactAppBuild() {
	return new Promise((resolve, reject) => {
		const reactAppDir = path.join(explodedJarDir, 'react-app');

		fs.emptyDir(reactAppDir);

		cpr(
			createReactAppBuildDir,
			reactAppDir,
			{confirm: true, overwrite: true},
			err => (err ? reject(err) : resolve())
		);
	});
}

function injectSources() {
	const jsDir = path.join(createReactAppBuildDir, 'static', 'js');

	const jsFiles = fs
		.readdirSync(jsDir)
		.filter(jsFile => jsFile.endsWith('.js'));

	const jsRuntimeFile = jsFiles.find(jsFile => jsFile.startsWith('runtime~'));

	renderer.render('index.js', {
		jsFiles: [
			...jsFiles.filter(jsFile => jsFile !== jsRuntimeFile),
			jsRuntimeFile,
		],
		pkgJson,
		webContextPath: project.jar.webContextPath,
	});
}

function tweakMediaURLs() {
	const jsDir = path.join(explodedJarDir, 'react-app', 'static', 'js');

	const jsFiles = fs
		.readdirSync(jsDir)
		.filter(jsFile => jsFile.endsWith('.js'));

	jsFiles.forEach(jsFile => {
		const jsFilePath = path.join(jsDir, jsFile);

		let js = fs.readFileSync(jsFilePath).toString();

		js = js.replace(
			/static\/media\//g,
			`o${project.jar.webContextPath}/react-app/static/media/`
		);

		fs.writeFileSync(jsFilePath, js);
	});
}

/**
 *
 * @param {object} t Babel types module
 */
function babelPlugin({types: t}) {
	return {
		visitor: {
			CallExpression: {
				exit(path, state) {
					const {node} = path;
					const {callee} = node;

					if (
						!isStaticMemberExpression(t, callee, 'ReactDOM.render')
					) {
						return;
					}

					const {arguments: args} = node;

					if (args.length < 2) {
						return;
					}

					const getElementByIdCall = args[1];

					if (!t.isCallExpression(getElementByIdCall)) {
						return;
					}

					if (
						!isStaticMemberExpression(
							t,
							getElementByIdCall.callee,
							'document.getElementById'
						)
					) {
						return;
					}

					const {
						arguments: getElementByIdCallArgs,
					} = getElementByIdCall;

					if (getElementByIdCallArgs.length < 1) {
						return;
					}

					const getElementByIdCallArg = getElementByIdCallArgs[0];

					if (!t.isStringLiteral(getElementByIdCallArg)) {
						return;
					}

					getElementByIdCallArgs[0] = t.identifier(
						'portletElementId'
					);

					if (state.renderFound) {
						throw Object.assign(new Error(), {
							humanMessage: msg.noValidEntryPoint,
						});
					} else {
						state.renderFound = true;
					}
				},
			},
			Program: {
				exit(path, state) {
					if (!state.renderFound) {
						throw Object.assign(new Error(), {
							humanMessage: msg.noValidEntryPoint,
						});
					}

					const nodes = path.node.body;

					const wrapperCode = template(`
						window["${pkgJson.name}@${pkgJson.version}"].register(
							({ portletElementId }) => {
								SOURCE
							}
						)
					`);

					path.node.body = [
						...nodes.filter(node => t.isImportDeclaration(node)),
						wrapperCode({
							PORTLET_ID: t.stringLiteral(
								`${pkgJson.name}@${pkgJson.version}`
							),
							SOURCE: nodes.filter(
								node => !t.isImportDeclaration(node)
							),
						}),
					];
				},
			},
		},
	};
}

/**
 *
 * @param {*} t
 * @param {object} node
 * @param {string} call
 */
function isStaticMemberExpression(t, node, call) {
	if (!t.isMemberExpression(node)) {
		return false;
	}

	const parts = call.split('.');
	const {object, property} = node;

	if (!t.isIdentifier(object) || object.name !== parts[0]) {
		return false;
	}

	if (!t.isIdentifier(property) || property.name !== parts[1]) {
		return false;
	}

	return true;
}
