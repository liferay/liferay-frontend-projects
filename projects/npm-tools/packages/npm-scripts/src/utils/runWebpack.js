/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {joinModuleName, splitModuleName} = require('@liferay/js-toolkit-core');
const path = require('path');
const webpack = require('webpack');
const WebpackError = require('webpack/lib/WebpackError');

const findRoot = require('./findRoot');

module.exports = async function runWebpack(config) {
	const stats = await new Promise((resolve, reject) => {
		try {
			const compiler = webpack(config);

			compiler.hooks.done.tap('npm-scripts', (stats) => {
				resolve(stats);
			});

			compiler.run(undefined);
		}
		catch (error) {
			reject(error);
		}
	});

	if (stats.hasErrors()) {
		abortWithErrors(stats);
	}
	else {
		console.log(`Successfully bundled project with webpack.`);
		console.log(`  Created assets:`);

		Object.entries(stats.compilation.assets).forEach(
			([filePath, sizeSource]) => {
				let size = sizeSource.size();
				let unit = 'B';

				if (size > 1024) {
					size = Math.floor(sizeSource.size() / 1024);
					unit = 'KiB';
				}

				if (size > 1024) {
					size =
						Math.floor((10 * sizeSource.size()) / (1024 * 1024)) /
						10;
					unit = 'MiB';
				}

				console.log(`    * ${filePath}: ${size} ${unit}`);
			}
		);

		let {externals} = config;

		if (externals) {
			console.log(`  External modules:`);

			const usedExternals = Array.from(stats.compilation.modules)
				.filter((module) => module instanceof webpack.ExternalModule)
				.map((module) => module.userRequest);

			externals = Object.entries(externals).reduce((externals, entry) => {
				if (usedExternals.includes(entry[0])) {
					externals[entry[0]] = entry[1];
				}

				return externals;
			}, {});

			if (!Object.keys(externals).length) {
				console.log(`    (none)`);
			}
			else {
				Object.entries(externals).forEach(([from, to]) => {
					console.log(`    * ${from} (mapped to ${to})`);
				});
			}
		}

		console.log(`  Bundled modules per package:`);

		const rootDir = findRoot();

		const summary = Array.from(stats.compilation.modules)
			.map((mod) => mod['resource'])
			.filter((filePath) => filePath)
			.map((filePath) => path.relative(rootDir, filePath))
			.filter((filePath) => filePath.startsWith('node_modules/'))
			.map((filePath) => filePath.substring(13))
			.reduce((summary, moduleName) => {
				const parts = splitModuleName(moduleName);
				const pkgName = joinModuleName(parts.scope, parts.pkgName, '');

				summary[pkgName] = summary[pkgName] || 0;
				summary[pkgName]++;

				return summary;
			}, {});

		Object.keys(summary)
			.sort()
			.forEach((pkgName) => {
				console.log(`    * ${pkgName}: ${summary[pkgName]}`);
			});
	}

	return stats;
};

class ExplainedError extends Error {
	static CONTEXT_LINES = 5;

	constructor(error, options = {}) {
		super();

		this._error = error;
		this._explanation = this._explainError(error, options);
	}

	toString() {
		return this._explanation;
	}

	_explainError(error, options) {
		let filePath = options.filePath;
		let sourceCode = options.sourceCode;
		let line;

		if (error instanceof WebpackError) {
			filePath = error['module'] && error['module']['userRequest'];
		}
		else if (error instanceof SyntaxError) {
			line = error['loc']['line'];
		}

		if (filePath) {
			if (!sourceCode) {
				try {
					sourceCode = fs.readFileSync(filePath, 'utf8');
				}
				catch (error) {
					sourceCode = '<no source code available>';
				}
			}
		}
		else {
			filePath = '<unknown file>';
		}

		const contextLines =
			sourceCode && line ? this._getContextLines(sourceCode, line) : '';

		return `${error.toString()}${contextLines}\n...at ${filePath}`;
	}

	_getContextLines(sourceCode, aroundLine) {
		const lines = sourceCode.toString().split('\n');

		const beginLine = Math.max(
			1,
			aroundLine - ExplainedError.CONTEXT_LINES
		);
		const endLine = Math.min(
			aroundLine + ExplainedError.CONTEXT_LINES,
			lines.length
		);

		const padMinChars = beginLine.toString().length;

		return `

${lines
	.slice(beginLine - 1, endLine)
	.map((line, i) => {
		i += beginLine;

		const errorMarker = i === aroundLine ? '>' : ' ';
		const lineNumber = i.toString().padStart(padMinChars);

		return `${errorMarker} ${lineNumber}: ${line}`;
	})
	.join('\n')}
`;
	}
}

function abortWithErrors(stats) {
	const {errors} = stats.compilation;

	errors.forEach((error) => {
		const webpackError = new ExplainedError(error);

		console.error(`${webpackError.toString()}\n`);
	});

	throw new Error('Webpack execution failed');
}
