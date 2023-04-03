/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-explicit-any */

import merge from 'deepmerge';
import fs from 'fs';
import yaml from 'js-yaml';
import os from 'os';
import path from 'path';
import resolve from 'resolve';

import FilePath from '../../file/FilePath';
import LiferayJson from '../../schema/LiferayJson';
import PkgJson from '../../schema/PkgJson';
import Build from './Build';
import Deploy from './Deploy';
import Dist from './Dist';
import Start from './Start';

import type ClientExtensionYaml from '../../schema/ClientExtensionYaml';
import type {Writable} from './Writable';

export default class Project {
	readonly assetsDir: FilePath | null;
	readonly build: Build;
	readonly deploy: Deploy;
	readonly dir: FilePath;
	readonly dist: Dist;
	readonly isWorkspace: boolean;
	readonly mainModuleFile: FilePath;
	readonly pkgJson: PkgJson;
	readonly srcDir: FilePath;
	readonly start: Start;

	constructor(projectPath: string) {
		this.dir = new FilePath(projectPath).resolve();
		this.reload();
	}

	reload(): void {
		const self = this as Writable<Project>;

		self.isWorkspace = this._isWorkspace();

		self.assetsDir = this.dir.join('assets');
		self.srcDir = this.dir.join('src');

		if (!fs.existsSync(this.assetsDir.asNative)) {
			self.assetsDir = null;
		}

		self.pkgJson = JSON.parse(
			fs.readFileSync(this.dir.join('package.json').asNative, 'utf8')
		);

		if (this.pkgJson.main) {
			self.mainModuleFile = this.dir.join(
				new FilePath(this.pkgJson.main, {posix: true})
			);
		}
		else {
			self.mainModuleFile = this.srcDir.join('index.js');
		}

		let liferayJson: LiferayJson = this._loadLiferayJson();

		if (self.isWorkspace) {
			const clientExtensionYamlPath = this._getClientExtensionYamlPath();

			if (fs.existsSync(clientExtensionYamlPath)) {
				try {
					const yamlConfig = yaml.load(
						fs.readFileSync(clientExtensionYamlPath, 'utf8')
					);

					liferayJson = merge.all([
						liferayJson,
						this._normalizeClientExtensionYaml(yamlConfig),
					]);
				}
				catch (error) {
					if (error.code !== 'ENOENT') {
						throw error;
					}
				}
			}
		}

		self.build = new Build(this, liferayJson);
		self.deploy = new Deploy(this, liferayJson);
		self.dist = new Dist(this, liferayJson);
		self.start = new Start(this, liferayJson);
	}

	/**
	 * Requires a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal `require()`
	 * call).
	 * @param moduleName
	 */
	require(moduleName: string): any {
		return require(this.resolve(moduleName));
	}

	/**
	 * Resolves a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal
	 * `require.resolve()` call).
	 * @param moduleName
	 */
	resolve(moduleName: string): string {
		return resolve.sync(moduleName, {
			basedir: this.dir.asNative,
		});
	}

	private _getAutopreset(): string | null {
		const {dependencies = {}, devDependencies = {}} = this.pkgJson;

		const autopresets = Object.keys({
			...dependencies,
			...devDependencies,
		}).reduce((autopresets, pkgName) => {
			try {
				const {dependencies} = this.require(`${pkgName}/package.json`);

				if (!dependencies || !dependencies['@liferay/portal-base']) {
					return autopresets;
				}

				autopresets.push(pkgName);
			}
			catch (error) {

				// ignore

			}

			return autopresets;
		}, []);

		if (autopresets.length > 1) {
			throw new Error(
				'Multiple autopreset dependencies found in project ' +
					`(${autopresets}): please remove the invalid ones.`
			);
		}

		return autopresets.length ? autopresets[0] : null;
	}

	private _isWorkspace(): boolean {
		let isWorkspace = false;
		let dir = this.dir.resolve().asNative;

		while (!isWorkspace) {
			try {
				isWorkspace = fs
					.readFileSync(path.join(dir, 'settings.gradle'), 'utf-8')
					.includes('"com.liferay.gradle.plugins.workspace"');
			}
			catch (error) {

				// ignore

			}

			const newDir = path.dirname(dir);

			if (newDir === dir) {
				break;
			}

			dir = newDir;
		}

		return isWorkspace;
	}

	private _getClientExtensionYamlPath(): string {
		let dir = this.dir.resolve().asNative;

		while (true) {
			const clientExtensionYamlPath = path.join(
				dir,
				'client-extension.yaml'
			);

			if (fs.existsSync(clientExtensionYamlPath)) {
				return clientExtensionYamlPath;
			}

			const newDir = path.dirname(dir);

			if (
				newDir === dir ||
				fs.existsSync(path.join(dir, 'settings.gradle'))
			) {
				break;
			}

			dir = newDir;
		}

		return '';
	}

	private _loadLiferayJson(): LiferayJson {
		const items: unknown[] = [{}];

		const autopreset = this._getAutopreset();

		if (autopreset) {
			try {
				items.push(this.require(`${autopreset}/liferay.json`));
			}
			catch (error) {

				// ignore

			}
		}

		[
			path.join(os.homedir(), '.liferay.json'),
			this.dir.join('.liferay.json').asNative,
			this.dir.join('liferay.json').asNative,
		].forEach((liferayJsonPath) => {
			try {
				items.push(
					JSON.parse(fs.readFileSync(liferayJsonPath, 'utf8'))
				);
			}
			catch (error) {
				if (error.code !== 'ENOENT') {
					throw error;
				}
			}
		});

		const liferayJson: LiferayJson = merge.all(
			items.map((item) => this._normalizeLiferayJson(item))
		);

		// Default project type is 'bundler2'

		liferayJson.build = liferayJson.build || {
			options: {},
			type: 'bundler2',
		};
		liferayJson.build.type = liferayJson.build.type || 'bundler2';

		return liferayJson;
	}

	private _normalizeClientExtensionYaml(
		yamlConfig: ClientExtensionYaml
	): LiferayJson {
		const {type, ...otherConfig} = yamlConfig[this.pkgJson.name];

		return {
			build: {
				options: otherConfig,
				type,
			},
		};
	}

	private _normalizeLiferayJson(liferayJson: any): LiferayJson {

		// Normalize externals if they exist

		const options = liferayJson.build?.options;

		if (options && options.externals) {
			if (Array.isArray(options.externals)) {
				options.externals = options.externals.reduce(
					(map: string, bareIdentifier: string) => {
						map[bareIdentifier] = bareIdentifier;

						return map;
					},
					{}
				);
			}
		}

		return liferayJson;
	}
}
