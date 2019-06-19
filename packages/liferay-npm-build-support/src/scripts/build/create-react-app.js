/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import template from 'babel-template';
import cpr from 'cpr';
import fs from 'fs-extra';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';
import readline from 'readline';

import {Renderer, runNpmBin, runNpmScript} from '../../util';

const modifiedIndexJsSignature =
	'"frontend-js-portlet-extender/webpack/registry"';
const msg = {
	askWhetherToUseBackup:
		'Do you want to use the backup instead of the current index.js (y/N)? ',
	discardingPreviousBackup:
		"Discarding previous backup of 'src/index.js' for this build. Will \n" +
		"use the current 'src/index.js' as is now.",
	indexJsBackupPresent:
		"Fortunately, this build tool makes a backup of 'src/index.js' (in\n" +
		"'src/.index.js') before modifying it; you can now restore it in \n" +
		'case you want to.\n' +
		'\n' +
		'The contents of the backup follow:\n',
	indexJsModified:
		"The 'src/index.js' file seems to be a modified copy of a previous\n" +
		'build. This is usually caused by a previous crash.',
	line: '-------------------------------------------------------------------',
	makingBackup:
		"Making a backup of 'src/index.js' (to 'src/.index.js') before \n" +
		'injecting Liferay modifications for the build.',
	indexJsBackupNotPresent:
		"The modified 'src/index.js' cannot be used for the build but an\n" +
		'automatic backup was not found, meaning that probably something\n' +
		'went badly wrong in a previous build.\n' +
		'\n' +
		"Please restore the 'src/index.js' file from your version control,\n" +
		'or fix it manually, to be able to deploy this project to Liferay.\n' +
		'\n' +
		'We are very sorry, this should never have happened :-(',
	indexJsBackupNotRestored:
		"The modified 'src/index.js' cannot be used for the build but a\n" +
		'backup was not restored. Please restore the backup or fix the\n' +
		"'src/index.js' file to be able to deploy this project to Liferay.",
	indexJsNoticeHeader:
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
		" IF YOU RUN 'npm run lr:build' AGAIN IT WILL ASK YOU IF YOU WANT\n" +
		' TO RESTORE IT BUT IF YOU WANT TO DO IT MANUALLY YOU CAN, TOO.\n' +
		'\n' +
		' SORRY FOR ANY INCONVENIENCE :-(\n' +
		'*/\n',
	noValidEntryPoint:
		"No valid entry point found in 'src/index.js'. It is not possible\n" +
		'to continue and deploy this project to Liferay.\n' +
		'\n' +
		'This build tool assumes that you use a standard React entry point\n' +
		'which contains one single ReactDOM.render() call where the second\n' +
		'argument is a document.getElementById() call.\n' +
		'\n' +
		'If that is not the case, you may not deploy this application to\n' +
		'Liferay because it will not know how to attach your UI to the\n' +
		'page.\n' +
		'\n' +
		'Visit http://bit.ly/js-toolkit-wiki for more information.\n',
	restoringBackup:
		"Restoring backup of 'src/index.js' after React's build has finished.",
	usingPreviousBackup:
		"Using previous backup of 'src/index.js' for this build",
};

const createReactAppBuildDir = path.join(project.dir, 'build');
const explodedJarDir = path.join(project.dir, 'build.lr', 'jar');
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
			console.error(`\n${err.humanMessage ? err.humanMessage : err}\n`);

			if (!err.doNotRestoreBackup) {
				restoreIndexJs();
			}

			process.exit(1);
		});
}

function assertIndexJsIntegrity() {
	const indexJsPath = path.join(project.dir, 'src', 'index.js');

	const indexJsContent = fs.readFileSync(indexJsPath).toString();

	if (indexJsContent.indexOf(modifiedIndexJsSignature) != -1) {
		console.log(msg.indexJsModified);

		const dotIndexJsPath = path.join(project.dir, 'src', '.index.js');

		if (fs.existsSync(dotIndexJsPath)) {
			console.log('');
			console.log(msg.indexJsBackupPresent);
			console.log(msg.line);
			console.log(fs.readFileSync(dotIndexJsPath).toString());
			console.log(msg.line);
			console.log('');

			const prompt = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			return new Promise((resolve, reject) => {
				prompt.question(msg.askWhetherToUseBackup, answer => {
					prompt.close();

					switch (answer) {
						case 'Y':
						case 'y':
							console.log(msg.usingPreviousBackup);
							fs.copyFileSync(dotIndexJsPath, indexJsPath);
							return resolve();

						default:
							return reject(
								Object.assign(new Error(), {
									humanMessage: msg.indexJsBackupNotRestored,
									doNotRestoreBackup: true,
								})
							);
					}
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

	console.log(msg.makingBackup);
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

	fs.writeFileSync(indexJsPath, msg.indexJsNoticeHeader + result.code);
}

function restoreIndexJs() {
	const indexJsPath = path.join(project.dir, 'src', 'index.js');
	const dotIndexJsPath = path.join(project.dir, 'src', '.index.js');

	if (fs.existsSync(dotIndexJsPath)) {
		console.log(msg.restoringBackup);
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
						window.Liferay.Loader.require(
							"frontend-js-portlet-extender/webpack/registry",
							registry => {
								registry.default.registerPortlet(
									PORTLET_ID, 
									({ portletElementId }) => {
										SOURCE
									}
								);
							}
						);
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
