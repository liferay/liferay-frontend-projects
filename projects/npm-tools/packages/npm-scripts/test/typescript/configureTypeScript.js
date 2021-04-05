/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const BASE_CONFIG = require('../../src/config/tsconfig-base.json');
const configureTypeScript = require('../../src/typescript/configureTypeScript');
const expandGlobs = require('../../src/utils/expandGlobs');

const FIXTURES = path.join(__dirname, '..', '..', '__fixtures__', 'typescript');
const MODULES = path.join(FIXTURES, 'modules');

const EXPECT_HASH = expect.stringMatching(/^[0-9a-f]{40}$/);

const MOCK_PROJECT_PATHS = {};

expandGlobs(['**/*-web', '**/*-*-js'], [], {
	baseDir: MODULES,
	type: 'directory',
}).forEach((project) => {
	MOCK_PROJECT_PATHS[path.basename(project)] = project;
	fs.writeFileSync(path.join(project, 'tsconfig.json'), '');
});

describe('configureTypeScript()', () => {
	function cd(projectOrPath, callback) {
		const cwd = process.cwd();

		try {
			process.chdir(MOCK_PROJECT_PATHS[projectOrPath] || projectOrPath);

			return callback();
		}
		finally {
			process.chdir(cwd);
		}
	}

	function configure(project, graph) {
		return cd(project, () => configureTypeScript(graph));
	}

	function getDependencyGraph(...mockProjects) {
		let getTypeScriptDependencyGraph;

		jest.isolateModules(() => {
			jest.resetModules();

			jest.mock('../../src/utils/getWorkspaces', () => {
				return () => {
					return mockProjects.map((name) => MOCK_PROJECT_PATHS[name]);
				};
			});

			getTypeScriptDependencyGraph = require('../../src/typescript/getTypeScriptDependencyGraph');
		});

		return cd(MODULES, () => getTypeScriptDependencyGraph());
	}

	function readConfig(project) {
		return fs.readFileSync(
			path.join(MOCK_PROJECT_PATHS[project], 'tsconfig.json'),
			'utf8'
		);
	}

	function resetConfig(...projects) {
		projects.forEach((project) => {
			writeConfig(project, '');
		});
	}

	function writeConfig(project, contents) {
		fs.writeFileSync(
			path.join(MOCK_PROJECT_PATHS[project], 'tsconfig.json'),
			contents,
			'utf8'
		);
	}

	describe('when there is no pre-existing tsconfig.json file', () => {
		it('complains', () => {
			expect(() => {
				cd(MODULES, () => configureTypeScript({}));
			}).toThrow(/no tsconfig.json exists/);
		});
	});

	describe('when run from outside of our dependency graph', () => {
		it('complains', () => {
			const graph = getDependencyGraph('frontend-js-state-web');

			expect(() => configure('remote-app-client-js', graph)).toThrow(
				/not found in dependency graph/
			);
		});
	});

	describe('when the existing config is not valid JSON', () => {
		let graph;

		const project = 'frontend-js-state-web';

		beforeEach(() => {
			graph = getDependencyGraph(project);
		});

		it('complains', () => {
			writeConfig(project, '{"haha you so funny');

			expect(() => configure(project, graph)).toThrow(/JSON/);
		});

		it('accepts totally blank files', () => {
			writeConfig(project, '');

			expect(() => configure(project, graph)).not.toThrow();

			writeConfig(project, '\n');

			expect(() => configure(project, graph)).not.toThrow();
		});
	});

	describe('with a simple dependency graph with no dependencies', () => {
		let graph;

		const project = 'frontend-js-state-web';

		beforeEach(() => {
			graph = getDependencyGraph(project);
		});

		it('generates basic config given a simple graph with no dependencies', () => {
			resetConfig(project);

			configure(project, graph);

			const config = JSON.parse(readConfig(project));

			/* eslint-disable sort-keys */

			expect(config).toEqual({
				...BASE_CONFIG,
				compilerOptions: {
					...BASE_CONFIG.compilerOptions,
					typeRoots: [

						// Dynamically generated:

						'../../../node_modules/@types',
						'./node_modules/@types',
					],
				},
				'@generated': EXPECT_HASH,
			});

			/* eslint-enable sort-keys */
		});

		it('returns true if the config is already up-to-date', () => {
			resetConfig(project);

			// Returns false when the config isn't set up yet.

			expect(configure(project, graph)).toBe(false);

			// Returns true when it already is up-to-date.

			expect(configure(project, graph)).toBe(true);

			// Note that up-to-date-ness only cares about structural equality,
			// not whitespace.

			writeConfig(project, `\t\t${readConfig(project)}\n\n`);

			expect(configure(project, graph)).toBe(true);

			// As soon as we mutate a value, returns false again.

			writeConfig(
				project,
				JSON.stringify({
					...JSON.parse(readConfig(project)),
					references: null,
				})
			);

			expect(configure(project, graph)).toBe(false);

			// Breaking the hash also forces an update.

			writeConfig(
				project,
				JSON.stringify({
					...JSON.parse(readConfig(project)),

					// Special prize to anybody who can guess the input string that
					// led to this hash!

					'@generated': 'e0fee1adf795c84eec4735f039503eb18d9c35cc',
				})
			);

			expect(configure(project, graph)).toBe(false);
		});

		it('merges @overrides into the generated fields', () => {
			resetConfig();

			configure(project, graph);

			const hash = JSON.parse(readConfig(project))['@generated'];

			// Examples of the kind of overrides we have to do in
			// remote-app-client-js:

			writeConfig(
				project,
				JSON.stringify({
					'@overrides': {
						compilerOptions: {
							outDir: './build/node/packageRunBuild/dist/',
							target: 'es5',
							typeRoots: [
								'./src/main/resources/META-INF/resources/js/types',
							],
						},
					},
				})
			);

			configure(project, graph);

			const config = JSON.parse(readConfig(project));

			/* eslint-disable sort-keys */

			expect(config).toEqual({
				...BASE_CONFIG,
				compilerOptions: {
					...BASE_CONFIG.compilerOptions,
					outDir: './build/node/packageRunBuild/dist/',
					target: 'es5',
					typeRoots: [

						// (Still) dynamically generated:

						'../../../node_modules/@types',
						'./node_modules/@types',

						// Added via overrides:

						'./src/main/resources/META-INF/resources/js/types',
					],
				},
				'@generated': EXPECT_HASH,
			});

			/* eslint-enable sort-keys */

			// Note that hash reflects the effect of the overrides:

			expect(config['@generated']).not.toEqual(hash);
		});
	});

	describe('with a basic dependency graph with a actual dependencies', () => {
		beforeEach(() => {
			const projects = [
				'frontend-js-react-web',
				'frontend-js-state-web',
				'frontend-js-clay-sample-web',
			];

			const graph = getDependencyGraph(...projects);

			projects.forEach((project) => configure(project, graph));
		});

		it('sets up "references" and "paths" in a project with one dependency', () => {
			/* eslint-disable sort-keys */

			expect(JSON.parse(readConfig('frontend-js-react-web'))).toEqual({
				...BASE_CONFIG,
				compilerOptions: {
					...BASE_CONFIG.compilerOptions,
					paths: {
						'@liferay/frontend-js-state-web': [
							'../frontend-js-state-web/src/main/resources/META-INF/resources/index.ts',
						],
					},
					typeRoots: [
						'../../../node_modules/@types',
						'./node_modules/@types',
					],
				},
				references: [
					{
						path: '../frontend-js-state-web',
					},
				],
				'@generated': EXPECT_HASH,
			});

			/* eslint-enable sort-keys */
		});

		it('sets up "references" and "paths" in a project with two dependencies', () => {
			/* eslint-disable sort-keys */

			expect(
				JSON.parse(readConfig('frontend-js-clay-sample-web'))
			).toEqual({
				...BASE_CONFIG,
				compilerOptions: {
					...BASE_CONFIG.compilerOptions,
					paths: {
						'@liferay/frontend-js-react-web': [
							'../frontend-js-react-web/src/main/resources/META-INF/resources/js/index.ts',
						],
						'@liferay/frontend-js-state-web': [
							'../frontend-js-state-web/src/main/resources/META-INF/resources/index.ts',
						],
					},
					typeRoots: [
						'../../../node_modules/@types',
						'./node_modules/@types',
					],
				},
				references: [
					{
						path: '../frontend-js-react-web',
					},
					{
						path: '../frontend-js-state-web',
					},
				],
				'@generated': EXPECT_HASH,
			});

			/* eslint-enable sort-keys */
		});

		it('sets leaves "references" and "paths" in a project with no dependencies', () => {
			/* eslint-disable sort-keys */

			expect(JSON.parse(readConfig('frontend-js-state-web'))).toEqual({
				...BASE_CONFIG,
				compilerOptions: {
					...BASE_CONFIG.compilerOptions,
					typeRoots: [
						'../../../node_modules/@types',
						'./node_modules/@types',
					],
				},
				'@generated': EXPECT_HASH,
			});

			/* eslint-enable sort-keys */
		});
	});
});
