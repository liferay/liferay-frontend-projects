/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {LogLevel} from '@liferay/js-toolkit-core';
import pretty from 'pretty-time';

import {Report} from '.';

export function htmlDump(report: Report): string {
	const {
		_executionDate,
		_executionTime,
		_rootPkg,
		_versionsInfo,
		_warnings,
		_webpack,
	} = report;

	const title = 'Report of liferay-npm-bundler execution';

	const summary = htmlTable([
		htmlRow(
			`<td>Executed at:</td><td>${_executionDate.toUTCString()}</td>`
		),
		htmlIf(_executionTime !== undefined, () =>
			htmlRow(
				`<td>Execution took:</td><td>${pretty(_executionTime)}</td>`
			)
		),
	]);

	const warnings = htmlIf(!!_warnings.length, () =>
		htmlSection('Warnings', htmlList(..._warnings))
	);

	const projectInfo = htmlSection(
		'Project information',
		htmlTable(
			'Name',
			'Version',
			htmlRow(`
				<td>${_rootPkg.name}</td>
				<td>${_rootPkg.version}</td>
			`)
		)
	);

	const versionsInfo = htmlSection(
		'Bundler environment versions',
		htmlTable(
			'Package',
			'Version',
			Object.keys(_versionsInfo).map((pkgName) =>
				htmlRow(`
					<td>${pkgName}</td>
					<td>${_versionsInfo[pkgName].version}</td>
				`)
			)
		)
	);

	const webpack = htmlSection(
		'Details of webpack execution',
		htmlTable(
			'File',
			'',
			'Source',
			'Messages',
			Object.entries(_webpack.logs)
				.sort((a, b) => a[0].localeCompare(b[0]))
				.map(([prjRelPath, sources]) =>
					Object.entries(sources).map(([source, logger]) =>
						logger.messages
							.map(({logLevel, things}, index) =>
								htmlRow(
									`
									<td>${index === 0 ? prjRelPath : ''}</td>
									<td class="${logLevel}">
										${LogLevel[logLevel].toUpperCase()}
									</td>
									<td class="source">[${source}]</td>
									<td>
										${things.map((thing) => `${thing}`).join(' ')}
									</td>
									`,
									LogLevel[logLevel]
								)
							)
							.join('')
					)
				)
		)
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
						padding: .1em;
						vertical-align: top;
					}
					
					td.debug, td.info, td.warn, td.error {
						border-radius: 4px;
						color: white;
						padding: 0 2px;
						text-align: center;
						vertical-align: middle;
						width: 1px;
						white-space: nowrap;
					}

					td.debug {
						background: gray;
					}

					td.info {
						background: green;
					}

					td.warn {
						background: orange;
					}

					td.error {
						background: red;
					}
					
					td.source {
						color: grey;
						white-space: nowrap;
					}

					ul {
						padding-left: 1em;
						margin: 0 0 .5em 0;
					}
					
					p {
						margin: 0 0 .5em 0;
					}

					a {
						text-decoration: none;
						color: #055;
					}

					#log-level-selector {
						position: fixed;
						top: 1em;
						right: 1em;
						background-color: #eee;
						padding: .3em;
						border-radius: 4px;
						font-size: 8pt;
						border: 1px solid #ccc;
					}

					#log-level-selector select {
						font-size: 8pt;
					}

					.configuration {
						display: inline-block;
						margin-bottom: .5em;
					}

					.configuration > div {
						background-color: #f0f0f0;
						cursor: pointer;
						border-radius: 4px;
						padding: 2px;
						display: inline;
					}

					.configuration > div:after {
						content: "👀";
						padding: 0 .5em;
					}

					.configuration > pre {
						font-size: 8pt;
						display: none;
					}

					.configuration:hover > pre {
						display: block;
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
				<script>
					window.onload = function() {
						var style = document.createElement('style');

						style.innerHTML = '';

						document.head.appendChild(style);

						var select = document.getElementById('log-level-select');

						select.value = 'debug';

						select.onchange = function() {
							switch(select.value) {
								case 'debug':
									style.innerHTML = '';
									break;

								case 'info':
									style.innerHTML = 
										'tr.debug {display: none;}';
									break;

								case 'warn':
									style.innerHTML = 
										'tr.debug {display: none;}' +
										'tr.info {display: none;}';
									break;

								case 'error':
									style.innerHTML = 
										'tr.debug {display: none;}' +
										'tr.info {display: none;} ' +
										'tr.warn {display: none;}';
									break;
							}
						};
					}
				</script>
			</head>
			<body>
				<div id='log-level-selector'>
					Log level filter: 
					<select id='log-level-select'>
						<option>debug</option>
						<option>info</option>
						<option>warn</option>
						<option>error</option>
					</select>
				</div>
				
				<h1>${title}</h1>
				${summary}
				${warnings}
				${projectInfo}
				${versionsInfo}
				${webpack}
			</body>
		</html>
	`;
}

function htmlIf(condition: boolean, contentGenerator: {(): string}): string {
	return condition ? contentGenerator() : '';
}

function htmlSection(title: string, ...contents: string[]): string {
	return `
		<h2>${title}</h2>
		${contents.join('\n')}
	`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function htmlSubsection(title: string, ...contents: string[]): string {
	return `
		<h3>${title}</h3>
		${contents.join('\n')}
	`;
}

function htmlList(...args: string[]): string {
	return `
		<ul>
			${args.map((arg) => `<li>${arg}</li>`).join(' ')}
		</ul>
	`;
}

function htmlTable(...args: unknown[]): string {
	const columns = args.slice(0, args.length - 1);
	let content = args[args.length - 1];

	if (Array.isArray(content)) {
		content = content.join('\n');
	}

	if (!columns.length) {
		return `
			<table>
				${content}
			</table>
		`;
	}
	else {
		return `
			<table>
				${htmlRow(columns.map((column) => `<th>${column}</th>`))}
				${content}
			</table>
		`;
	}
}

function htmlRow(content: string | string[], className = ''): string {
	if (Array.isArray(content)) {
		content = content.join('\n');
	}

	return `<tr class="${className}">${content}</tr>`;
}
