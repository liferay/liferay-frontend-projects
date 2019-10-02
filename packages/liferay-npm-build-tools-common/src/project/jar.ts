/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';
import readJsonSync from 'read-json-sync';

import FilePath from '../file-path';
import {Project} from '.';
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
	get customManifestHeaders(): object {
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
	get outputDir(): FilePath {
		const {_project} = this;
		const {npmbundlerrc} = _project;

		if (this._outputDir === undefined) {
			let outputDirPosixPath = prop.get(
				npmbundlerrc,
				'create-jar.output-dir',
				this.supported ? _project.buildDir.asPosix : undefined
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
	get outputFilename(): string {
		const {npmbundlerrc, pkgJson} = this._project;

		if (this._outputFilename === undefined) {
			this._outputFilename = prop.get(
				npmbundlerrc,
				'create-jar.output-filename',
				this.supported
					? pkgJson['name'] + '-' + pkgJson['version'] + '.jar'
					: undefined
			);
		}

		return this._outputFilename;
	}

	/**
	 * Whether or not to add a manifest header in JAR file to make the JS
	 * extender process this bundle.
	 * @return can be a boolean, a string forcing an extender version number or
	 * 			'any' to leave version unbounded
	 */
	get requireJsExtender(): boolean | string | 'any' {
		const {npmbundlerrc} = this._project;

		return prop.get(
			npmbundlerrc,
			'create-jar.features.js-extender',
			// TODO: deprecated 'auto-deploy-portlet', remove for the next major version
			prop.get(npmbundlerrc, 'create-jar.auto-deploy-portlet', true)
		);
	}

	get supported(): boolean {
		const {npmbundlerrc} = this._project;

		return !!prop.get(npmbundlerrc, 'create-jar', false);
	}

	get webContextPath(): string {
		const {npmbundlerrc, pkgJson} = this._project;

		if (!this._webContextPath) {
			this._webContextPath = prop.get(
				npmbundlerrc,
				'create-jar.features.web-context',
				// TODO: deprecated 'web-context-path', remove for the next major version
				prop.get(
					npmbundlerrc,
					'create-jar.web-context-path',
					// TODO: deprecated 'osgi.Web-ContextPath', remove for the next major version
					prop.get(
						pkgJson,
						'osgi.Web-ContextPath',
						`/${pkgJson['name']}-${pkgJson['version']}`
					)
				)
			);
		}

		return this._webContextPath;
	}

	private _customManifestHeaders: object;
	private _outputDir: FilePath;
	private _outputFilename: string;
	private readonly _project: Project;
	private _webContextPath: string;
}
