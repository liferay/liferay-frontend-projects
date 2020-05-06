/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from '.';
import prop from 'dot-prop';
import fs from 'fs-extra';
import readJsonSync from 'read-json-sync';

import FilePath from '../file-path';
import {print, warn} from '../format';
import {getFeaturesFilePath} from './util';

/**
 * Reflects JAR file configuration of JS Toolkit projects.
 */
export default class Jar {
	constructor(project: Project) {
		this._project = project;
	}

	/**
	 * Get configuration description file path.
	 * @return path of the file or undefined if not configured
	 */
	get configurationFile(): FilePath | undefined {
		if (!this.supported) {
			return undefined;
		}

		const {_project} = this;

		const absPath = getFeaturesFilePath(
			_project,
			'create-jar.features.configuration',
			'features/configuration.json'
		);

		if (!absPath) {
			return undefined;
		}

		return new FilePath(absPath);
	}

	/**
	 * Get user configured manifest headers
	 */
	get customManifestHeaders(): object | undefined {
		if (!this.supported) {
			return undefined;
		}

		const {npmbundlerrc} = this._project;

		if (this._customManifestHeaders === undefined) {
			const manifestFilePath = getFeaturesFilePath(
				this._project,
				'create-jar.features.manifest',
				'features/manifest.json'
			);

			const featuresHeaders = manifestFilePath
				? readJsonSync(manifestFilePath)
				: {};

			const npmbundlerrcHeaders = prop.get(
				npmbundlerrc,
				'create-jar.customManifestHeaders',
				{}
			);

			this._customManifestHeaders = Object.assign(
				npmbundlerrcHeaders,
				featuresHeaders
			);
		}

		return this._customManifestHeaders;
	}

	/**
	 * Get output directory for JAR file relative to `project.dir` and starting
	 * with `./`
	 */
	get outputDir(): FilePath | undefined {
		if (!this.supported) {
			return undefined;
		}

		const {_project} = this;
		const {npmbundlerrc} = _project;

		if (this._outputDir === undefined) {
			let outputDirPosixPath = prop.get(
				npmbundlerrc,
				'create-jar.output-dir',
				_project.buildDir.asPosix
			);

			if (outputDirPosixPath !== undefined) {
				if (!outputDirPosixPath.startsWith('./')) {
					outputDirPosixPath = `./${outputDirPosixPath}`;
				}

				this._outputDir = new FilePath(outputDirPosixPath, {
					posix: true,
				});
			}
		}

		return this._outputDir;
	}

	/**
	 * Get filename of output JAR file
	 */
	get outputFilename(): string | undefined {
		if (!this.supported) {
			return undefined;
		}

		const {npmbundlerrc, pkgJson} = this._project;

		if (this._outputFilename === undefined) {
			this._outputFilename = prop.get(
				npmbundlerrc,
				'create-jar.output-filename',
				pkgJson.name + '-' + pkgJson.version + '.jar'
			);
		}

		return this._outputFilename;
	}

	/**
	 * Whether or not to add a manifest header in JAR file to make the JS
	 * extender process this bundle.
	 *
	 * @return
	 * can be a boolean, a string forcing an extender version number or 'any' to
	 * leave version unbounded
	 */
	get requireJsExtender(): boolean | string | 'any' | undefined {
		if (!this.supported) {
			return undefined;
		}

		const {npmbundlerrc, pkgJson} = this._project;

		return prop.get(
			npmbundlerrc,
			'create-jar.features.js-extender',
			!!pkgJson.portlet
		);
	}

	get supported(): boolean {
		const {npmbundlerrc} = this._project;

		return !!prop.get(npmbundlerrc, 'create-jar', true);
	}

	get webContextPath(): string | undefined {
		if (!this.supported) {
			return undefined;
		}

		if (!this._webContextPath) {
			const {pkgJson} = this._project;
			const bndWebContextPath = this._getBndWebContextPath();
			const npmbundlerrcContextPath = this._getNpmbundlerrcContextPath();

			if (bndWebContextPath && npmbundlerrcContextPath) {
				print(
					warn`
Configured web context paths in .npmbundlerrc and bnd.bnd are different: using
the one in .npmbundlerrc

`
				);

				this._webContextPath = npmbundlerrcContextPath;
			} else if (bndWebContextPath) {
				this._webContextPath = bndWebContextPath;
			} else if (npmbundlerrcContextPath) {
				this._webContextPath = npmbundlerrcContextPath;
			} else {
				this._webContextPath = `/${pkgJson.name}-${pkgJson.version}`;
			}
		}

		return this._webContextPath;
	}

	_getBndWebContextPath(): string {
		const {dir} = this._project;
		const bndFile = dir.join('bnd.bnd');

		if (fs.existsSync(bndFile.asNative)) {
			const bnd = fs.readFileSync(bndFile.asNative).toString();

			const lines = bnd.split('\n');

			const webContextPathLine = lines.find(line =>
				line.startsWith('Web-ContextPath:')
			);

			if (webContextPathLine !== undefined) {
				return webContextPathLine.substring(16).trim();
			}
		}

		return undefined;
	}

	_getNpmbundlerrcContextPath(): string {
		const {npmbundlerrc} = this._project;

		return prop.get(
			npmbundlerrc,
			'create-jar.features.web-context',
			undefined
		);
	}

	private _customManifestHeaders: object;
	private _outputDir: FilePath;
	private _outputFilename: string;
	private readonly _project: Project;
	private _webContextPath: string;
}
