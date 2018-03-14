/* eslint require-jsdoc: off */
import pretty from 'pretty-time';

export function htmlDump(report) {
	const {
		_executionDate,
		_executionTime,
		_warnings,
		_versionsInfo,
		_packages,
	} = report;

	const title = 'Report of liferay-npm-bundler execution';

	const summary = htmlTable([
		htmlRow(
			`<td>Executed at:</td><td>${_executionDate.toUTCString()}</td>`
		),
		htmlIf(_executionTime, () =>
			htmlRow(
				`<td>Execution took:</td><td>${pretty(_executionTime)}</td>`
			)
		),
	]);

	const warnings = htmlIf(_warnings.length > 0, () =>
		htmlSection('Warnings', htmlList(..._warnings))
	);

	const versionsInfo = htmlSection(
		'Bundler environment versions',
		htmlTable(
			'Package',
			'Version',
			Object.keys(_versionsInfo).map(pkgName =>
				htmlRow(`
					<td>${pkgName}</td>
					<td>${_versionsInfo[pkgName]}</td>
				`)
			)
		)
	);

	const dependencies = htmlSection(
		'Bundled packages',
		htmlTable(
			'Package',
			'Version',
			'Copied files',
			'Excluded files',
			'Exclusions',
			'Linked to',
			Object.keys(_packages)
				.sort()
				.map(pkgId => {
					const {
						name,
						version,
						link,
						allFiles,
						copiedFiles,
						exclusions,
					} = _packages[pkgId];

					return htmlRow(`
						<td>${name}</td>
						<td>${version}</td>
						<td>${copiedFiles.length}</td>
						<td>${allFiles.length - copiedFiles.length}</td>
						<td>${exclusions}</td>
						<td>${link === undefined ? '' : link}</td>
					`);
				})
		)
	);

	const packageProcesses = htmlSection(
		'Summary of package transformations',
		htmlTable(
			'Package',
			'Version',
			'Pre-babel phase plugins',
			'Post-babel phase plugins',
			'Babel phase results',
			Object.keys(_packages)
				.sort()
				.map(pkgId => {
					const pkg = _packages[pkgId];
					const {pre, post, babel} = pkg.process;
					const preKeys = Object.keys(pre);
					const postKeys = Object.keys(post);
					const babelKeys = Object.keys(babel.files);

					const preNotice = htmlIf(
						preKeys.length > 0,
						() => `${preKeys.length} plugins applied`
					);
					const postNotice = htmlIf(
						postKeys.length > 0,
						() => `${postKeys.length} plugins applied`
					);
					const babelNotice = htmlIf(
						babelKeys.length > 0,
						() => `${babelKeys.length} files processed`
					);

					return htmlRow(`
						<td>${pkg.name}</td>
						<td>${pkg.version}</td>
						<td>
							<a href="#${pkgId}-pre">
								${preNotice}
							</a>
						</td>
						<td>
							<a href="#${pkgId}-post">
								${postNotice}
							</a>
						</td>
						<td>
							<a href="#${pkgId}-babel">
								${babelNotice}
							</a>
						</td>
					`);
				})
		)
	);

	const packageProcessesBundlerDetails = htmlSection(
		'Details of bundler transformations',
		...Object.keys(_packages)
			.sort()
			.map(pkgId => {
				const pkg = _packages[pkgId];
				const {pre, post} = pkg.process;
				const preKeys = Object.keys(pre);
				const postKeys = Object.keys(post);

				return htmlIf(preKeys.length > 0 || postKeys.length > 0, () =>
					htmlSubsection(
						`
							<a name="${pkgId}-pre"></a>
							${pkgId}
						`,
						htmlIf(preKeys.length > 0, () =>
							preKeys
								.sort()
								.map(pluginName =>
									htmlLogOutput(
										['Pre-phase plugin', 'Config'],
										[
											[
												pluginName,
												JSON.stringify(
													pre[pluginName].plugin
														.config
												),
											],
										],
										[pre[pluginName].logger],
										{source: false}
									)
								)
						),
						htmlIf(postKeys.length > 0, () =>
							postKeys
								.sort()
								.map(pluginName =>
									htmlLogOutput(
										['Post-phase plugin', 'Config'],
										[
											[
												pluginName,
												JSON.stringify(
													post[pluginName].plugin
														.config
												),
											],
										],
										[post[pluginName].logger],
										{source: false}
									)
								)
						)
					)
				);
			})
	);

	const packageProcessesBabelDetails = htmlSection(
		'Details of Babel transformations',
		...Object.keys(_packages)
			.sort()
			.map(pkgId => {
				const pkg = _packages[pkgId];
				const {babel} = pkg.process;
				const babelKeys = Object.keys(babel.files);

				return htmlIf(babelKeys.length > 0, () =>
					htmlSubsection(
						`
							<a name="${pkgId}-babel"></a>
							${pkgId}
						`,
						`<p>
							Configuration: 
							${JSON.stringify(babel.config)}
						</p>`,
						htmlLogOutput(
							['File'],
							babelKeys.sort().map(filePath => [filePath]),
							babelKeys
								.sort()
								.map(filePath => babel.files[filePath].logger)
						)
					)
				);
			})
	);

	return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<title>${title}</title>
				<style>
					body, h1, h2, h3, p, li {
						font-family: sans-serif;
					}
					
					body, p, th, td, li {
						font-size: 10pt;
					}
					
					h1 {
						font-size: 16pt;
						margin: 1em 0 .5em 0;
					}
					
					h2 {
						font-size: 13pt;
						margin: 1em 0 .5em 0;
					}
					
					h3 {
						font-size: 11pt;
						margin: 1em 0 .5em 0;
					}
					
					table {
						margin: 0 0 .5em 0;
					}
					
					tr:nth-child(odd) {
						background-color: #F6F6F6;
					}
					
					th {
						background-color: #F0F0F0;
						text-align: left;
					}
					
					th, td {
						padding: .1em 0;
						vertical-align: top;
					}
					
					td.info, td.error {
						background: green;
						border-radius: 4px;
						color: white;
						text-align: center;
						vertical-align: middle;
						width: 1px;
						white-space: nowrap;
					}

					td.error {
						background: red;
					}
					
					td.source {
						white-space: nowrap;
					}

					ul {
						padding-left: 1em;
						margin: 0 0 .5em 0;
					}
					
					p {
						margin: 0 0 .5em 0;
					}
				</style>
				<script id="report" type="application/json">
					${JSON.stringify(report)}
				</script>
				<script>
					window.report = JSON.parse(
						document.getElementById("report").innerHTML
					);
				</script>
			</head>
			<body>
				<h1>${title}</h1>
				${summary}
				${warnings}
				${versionsInfo}
				${dependencies}
				${packageProcesses}
				${packageProcessesBundlerDetails}
				${packageProcessesBabelDetails}
			</body>
		</html>
	`;
}

function htmlIf(condition, contentGenerator) {
	return condition ? contentGenerator() : '';
}

function htmlSection(title, ...contents) {
	return `
		<h2>${title}</h2>
		${contents.join('\n')}
	`;
}

function htmlSubsection(title, ...contents) {
	return `
		<h3>${title}</h3>
		${contents.join('\n')}
	`;
}

function htmlList(...args) {
	return `
		<ul>
			${args.map(arg => `<li>${arg}</li>`).join(' ')}
		</ul>
	`;
}

function htmlTable(...args) {
	const columns = args.slice(0, args.length - 1);
	let content = args[args.length - 1];

	if (Array.isArray(content)) {
		content = content.join('\n');
	}

	if (columns.length == 0) {
		return `
			<table>
				${content}
			</table>
		`;
	} else {
		return `
			<table>
				${htmlRow(columns.map(column => `<th>${column}</th>`))}
				${content}
			</table>
		`;
	}
}

function htmlRow(content) {
	if (Array.isArray(content)) {
		content = content.join('\n');
	}

	return `<tr>${content}</tr>`;
}

/**
 * Dump a table with the output of a PluginLogger
 * @param  {Array} prefixColumns [description]
 * @param  {Array<Array>} prefixCells an array with one array per row containing the prefix cell content
 * @param  {Array} rowLoggers an array with one logger per row in prefixCells
 * @param  {boolean} source whether or not to show 'Log source' column
 * @return {String} an HTML table
 */
function htmlLogOutput(
	prefixColumns,
	prefixCells,
	rowLoggers,
	{source} = {source: true}
) {
	if (prefixCells.length != rowLoggers.length) {
		throw new Error(
			'The length of prefixCells and rowLoggers must be the same'
		);
	}

	let logColums = ['Message', ''];

	if (source) {
		logColums.splice(0, 0, 'Log source');
	}

	const columns = prefixColumns.concat(logColums);

	let rows = [];

	prefixCells.forEach((cells, i) => {
		if (cells.length != prefixColumns.length) {
			throw new Error(
				`Prefix cells row ${i} has an invalid length: ${cells.length}`
			);
		}

		const msgs = rowLoggers[i].messages;

		if (msgs.length == 0) {
			rows.push(
				htmlRow(`
					${cells.map(cell => `<td>${cell}</td>`).join(' ')}
					${htmlIf(source, () => `<td></td>`)}
					${logColums
		.splice(1)
		.map(() => '<td></td>')
		.join(' ')}
				`)
			);
		} else {
			const msg0 = msgs[0];

			let sourceCell = htmlIf(
				source,
				() => `<td class="source">${msg0.source}</td>`
			);

			rows.push(
				htmlRow(`
					${cells.map(cell => `<td>${cell}</td>`).join(' ')}
					${sourceCell}
					<td class="${msg0.level}">${msg0.level.toUpperCase()}</td>
					<td>${msg0.things.join(' ')}</td>
				`)
			);

			for (let i = 1; i < msgs.length; i++) {
				sourceCell = htmlIf(
					source,
					() => `<td class="source">${msgs[i].source}</td>`
				);

				rows.push(
					htmlRow(`
						${cells.map(() => `<td></td>`).join(' ')}
						${sourceCell}
						<td class="${msgs[i].level}">
							${msgs[i].level.toUpperCase()}
						</td>
						<td>${msgs[i].things.join(' ')}</td>
					`)
				);
			}
		}
	});

	return htmlTable(...columns, rows);
}
