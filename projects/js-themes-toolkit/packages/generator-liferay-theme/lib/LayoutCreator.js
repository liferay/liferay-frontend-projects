/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const async = require('async');
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const _ = require('lodash');
const path = require('path');

const templateString = fs.readFileSync(
	path.join(__dirname, 'templates', 'layout_template.jst'),
	{
		encoding: 'utf8',
	}
);

const layoutTemplateTpl = _.template(templateString);

const listRender = inquirer.prompt.prompts.list.prototype.render;

inquirer.prompt.prompts.list.prototype.render = function () {
	const index = this.selected;

	const choices = _.reduce(
		this.opt.choices.choices,
		(result, item) => {
			if (item.type !== 'separator') {
				result.push(item);
			}

			return result;
		},
		[]
	);

	const choice = choices[index];

	this.opt.pageSize = 14;

	const originalName = choice.name;

	if (choice.selectedName) {
		choice.name = choice.selectedName;
	}

	listRender.call(this);

	choice.name = originalName;
};

const LayoutCreator = function (options) {
	this.className = options.className;
	this.liferayVersion = options.liferayVersion || '7.1';
	this.rowData = options.rowData;
};

LayoutCreator.prototype = {
	_addRow(data) {
		const rowInsertIndex = this.rowInsertIndex;

		if (_.isNumber(rowInsertIndex)) {
			this.rows.splice(rowInsertIndex, 0, data);

			this.rowInsertIndex = null;
		}
		else {
			this.rows.push(data);
		}

		this._printLayoutPreview();
	},

	_addWhiteSpace(choicesArray) {
		const separator = new inquirer.Separator(' ');

		choicesArray.push(separator);
		choicesArray.push(separator);
	},

	_afterPrompt(_err) {
		const rowData = this._preprocessLayoutTemplateData(this.rows);

		const templateContent = this._renderLayoutTemplate({
			className: this.className,
			rowData,
		});

		this.after(templateContent);
	},

	_afterPromptColumnCount(answers, callback) {
		callback(null, answers.columnCount);
	},

	_afterPromptColumnWidths(answers, callback) {
		this._addRow(answers);

		callback(null, this.rows);
	},

	_afterPromptFinishRow(answers, callback) {
		const finish = answers.finish;

		if (finish === 'add') {
			this._promptRow(callback);
		}
		else if (finish === 'insert') {
			this._promptInsertRow(callback);
		}
		else if (answers.finish === 'finish') {
			callback(null);
		}
		else if (finish === 'remove') {
			this._promptRemoveRow(callback);
		}
	},

	_afterPromptInsertRow(answers, callback) {
		this.rowInsertIndex = answers.rowIndex;

		this._promptRow(callback);
	},

	_afterPromptRemoveRow(answers, callback) {
		this._removeRow(answers.rowIndex);

		this._promptFinishRow(this.rows, callback);
	},

	_formatInlineChoicePreview(spanValue, takenWidth) {
		const remainingWidth = 12 - (spanValue + takenWidth);

		const takenString = chalk.black.bgWhite(_.repeat(' ', takenWidth));
		const spanString = chalk.bgCyan(_.repeat(' ', spanValue));
		const remainingString = _.repeat(' ', remainingWidth);

		return (
			chalk.reset('|') +
			takenString +
			spanString +
			remainingString +
			chalk.reset('|')
		);
	},

	_formatPercentageValue(spanValue, takenWidth, preview) {
		const percentage = Math.floor((spanValue / 12) * 10000) / 100;

		let value = _.padEnd(
			spanValue + '/12 - ' + percentage.toString() + '%',
			14
		);

		if (preview) {
			const inlinePreview =
				' - ' + this._formatInlineChoicePreview(spanValue, takenWidth);

			value = value + inlinePreview;
		}

		return value;
	},

	_getColumnClassNames(number, total) {
		let classNames;

		if (total <= 1) {
			classNames = ['portlet-column-only', 'portlet-column-content-only'];
		}
		else if (number <= 1) {
			classNames = [
				'portlet-column-first',
				'portlet-column-content-first',
			];
		}
		else if (number >= total) {
			classNames = ['portlet-column-last', 'portlet-column-content-last'];
		}

		return classNames;
	},

	_getColumnWidthChoices(columnIndex, columnCount, answers) {
		const instance = this;

		let takenWidth = 0;
		const totalWidth = 12;

		_.forEach(answers, (item) => {
			item = _.parseInt(item);

			takenWidth = takenWidth + item;
		});

		let availableWidth = totalWidth - takenWidth;

		// if it's the last column, give remaining width as the only choice

		if (columnIndex + 1 >= columnCount) {
			const selectedName = instance._formatPercentageValue(
				availableWidth,
				takenWidth,
				true
			);

			return [
				{
					name: instance._formatPercentageValue(
						availableWidth,
						takenWidth
					),
					selectedName:
						selectedName + ' - only available width, hit enter',
					short: selectedName,
					value: availableWidth,
				},
			];
		}
		else {
			const remainingColumns = columnCount - (columnIndex + 1);

			availableWidth = availableWidth - remainingColumns;

			const choices = _.times(availableWidth, (index) => {
				const spanValue = index + 1;

				const selectedName = instance._formatPercentageValue(
					spanValue,
					takenWidth,
					true
				);

				return {
					name: instance._formatPercentageValue(
						spanValue,
						takenWidth
					),
					selectedName,
					short: selectedName,
					value: spanValue,
				};
			});

			return choices;
		}
	},

	_getFinishRowChoices(rows) {
		const choices = [
			{
				name: 'Add row',
				value: 'add',
			},
		];

		if (rows.length) {
			choices.push({
				name: 'Insert row',
				value: 'insert',
			});

			choices.push({
				name: 'Remove row',
				value: 'remove',
			});

			choices.push({
				name: 'Finish layout',
				value: 'finish',
			});
		}

		return choices;
	},

	_getInsertRowChoices() {
		const instance = this;

		const rows = this.rows;

		const insertName = '  ' + _.repeat('-', 37);
		const insertSelectedName = '  ' + _.repeat('=', 37);

		const choicesArray = _.reduce(
			this.rows,
			(choices, row, index) => {
				choices.push({
					name: insertName,
					selectedName: insertSelectedName,
					short: 'Insert row at index ' + index,
					value: index,
				});

				choices.push(
					new inquirer.Separator(
						instance._renderPreviewLine(row, {
							label: true,
						})
					)
				);

				return choices;
			},
			[]
		);

		choicesArray.push({
			name: insertName,
			selectedName: insertSelectedName,
			short: 'Insert row at index ' + rows.length,
			value: rows.length,
		});

		if (choicesArray.length > 14) {
			choicesArray[0].name = this._replaceAt(insertName, 19, 'TOP');
			choicesArray[0].selectedName = this._replaceAt(
				insertSelectedName,
				19,
				'TOP'
			);

			this._addWhiteSpace(choicesArray);
		}

		return choicesArray;
	},

	_getRemoveRowChoices() {
		const instance = this;

		const seperator = '  ' + _.repeat('-', 37);

		const choicesArray = _.reduce(
			this.rows,
			(choices, row, index) => {
				choices.push(new inquirer.Separator(seperator));

				choices.push({
					name: instance._renderPreviewLine(row, {
						label: true,
					}),
					selectedName: chalk.red(
						instance._renderPreviewLine(row, {
							label: true,
							style: false,
						}),
						'X'
					),
					short: 'Remove row ' + (index + 1),
					value: index,
				});

				return choices;
			},
			[]
		);

		choicesArray.push(new inquirer.Separator(seperator));

		if (choicesArray.length > 14) {
			choicesArray.splice(
				0,
				1,
				new inquirer.Separator(this._replaceAt(seperator, 19, 'TOP'))
			);

			this._addWhiteSpace(choicesArray);
		}

		return choicesArray;
	},

	_getRowNumber() {
		const rowInsertIndex = this.rowInsertIndex;
		let rowNumber = this.rows.length;

		if (_.isNumber(rowInsertIndex)) {
			rowNumber = rowInsertIndex;
		}

		rowNumber = rowNumber + 1;

		return rowNumber;
	},

	_preprocessLayoutTemplateData(rows) {
		const instance = this;

		let totalColumnCount = 0;

		const rowData = _.map(rows, (row) => {
			const columnCount = _.size(row);

			return _.map(row, (size, index) => {
				const columnNumber = _.parseInt(index) + 1;

				totalColumnCount++;

				const columnData = {
					number: totalColumnCount,
					size,
				};

				const classNames = instance._getColumnClassNames(
					columnNumber,
					columnCount
				);

				if (classNames) {
					columnData.className = classNames[0];
					columnData.contentClassName = classNames[1];
				}

				return columnData;
			});
		});

		return rowData;
	},

	_printHelpMessage() {
		this._stdoutWrite(
			"\n  Layout templates implement Bootstrap's grid system.\n  Every row consists of 12 sections, so columns range in size from 1 to 12.\n\n"
		);
	},

	_printLayoutPreview() {
		const instance = this;

		const rowSeperator = chalk.bold('  ' + _.repeat('-', 37) + '\n');

		const preview =
			rowSeperator +
			_.map(this.rows, (item) => {
				return (
					instance._renderPreviewLine(item, {
						label: true,
					}) +
					'\n' +
					instance._renderPreviewLine(item) +
					'\n' +
					rowSeperator
				);
			}).join('');

		this._stdoutWrite(
			chalk.cyan('\n  Here is what your layout looks like so far\n') +
				preview +
				'\n'
		);
	},

	_promptColumnCount(callback) {
		const instance = this;

		this.prompt(
			[
				{
					default: 1,
					message:
						'How many columns would you like for ' +
						chalk.cyan('row', this._getRowNumber()) +
						'?',
					name: 'columnCount',
					validate: instance._validateColumnCount,
				},
			],
			(answers) => this._afterPromptColumnCount(answers, callback)
		);
	},

	_promptColumnWidths(columnCount, callback) {
		const instance = this;

		const rowNumber = instance._getRowNumber();

		const questions = _.times(columnCount, (index) => {
			const columnNumber = index + 1;

			return {
				choices: instance._getColumnWidthChoices.bind(
					instance,
					index,
					columnCount
				),
				message:
					'How wide do you want ' +
					chalk.cyan('row', rowNumber, 'column', columnNumber) +
					'?',
				name: index.toString(),
				type: 'list',
			};
		});

		this.prompt(questions, (answers) =>
			this._afterPromptColumnWidths(answers, callback)
		);
	},

	_promptFinishRow(rows, callback) {
		this.prompt(
			[
				{
					choices: this._getFinishRowChoices.bind(this, rows),
					message: 'What now?',
					name: 'finish',
					type: 'list',
				},
			],
			(answers) => this._afterPromptFinishRow(answers, callback)
		);
	},

	_promptInsertRow(callback) {
		this.prompt(
			[
				{
					choices: this._getInsertRowChoices.bind(this),
					message: 'Where would you like to insert a new row?',
					name: 'rowIndex',
					type: 'list',
				},
			],
			(answers) => this._afterPromptInsertRow(answers, callback)
		);
	},

	_promptRemoveRow(callback) {
		this.prompt(
			[
				{
					choices: this._getRemoveRowChoices.bind(this),
					message: 'What row would you like to remove?',
					name: 'rowIndex',
					type: 'list',
				},
			],
			(answers) => this._afterPromptRemoveRow(answers, callback)
		);
	},

	_promptRow(done) {
		async.waterfall(
			[
				this._promptColumnCount.bind(this),
				this._promptColumnWidths.bind(this),
				this._promptFinishRow.bind(this),
			],
			done
		);
	},

	_removeRow(index) {
		this.rows.splice(index, 1);

		this._printLayoutPreview();
	},

	_renderLayoutTemplate(options) {
		return layoutTemplateTpl(
			_.defaults(options, {
				columnPrefix: 'col-md-',
				rowClassName: 'row',
			})
		);
	},

	_renderPreviewLine(column, config) {
		const instance = this;

		config = config || {};

		const label = config.label;

		let line = _.repeat(' ', 35);

		let width = 0;

		_.forEach(column, (columnWidth) => {
			const prevWidth = width;

			width = width + columnWidth * 3;

			if (width < 36) {
				line = instance._replaceAt(line, width - 1, '|');
			}

			if (label) {
				line = instance._replaceAt(
					line,
					prevWidth,
					columnWidth.toString()
				);
			}
		});

		line = '  |' + line + '|';

		return config.style === false
			? line
			: this._stylePreviewLine(line, label);
	},

	_replaceAt(string, index, character) {
		return (
			string.substr(0, index) +
			character +
			string.substr(index + character.length)
		);
	},

	_stdoutWrite(string) {
		process.stdout.write(string);
	},

	_stylePreviewLine(line, label) {
		if (label) {
			line = line.replace(/\d/g, (match) => {
				return chalk.cyan(match);
			});
		}

		return chalk.bold(line);
	},

	_validateColumnCount(value) {
		value = _.parseInt(value);

		let retVal = 'Please enter a number between 1 and 12!';

		if (_.isNumber(value) && value > 0 && value < 13) {
			retVal = true;
		}

		return retVal;
	},

	init() {
		if (this.rowData) {
			this.after(
				this._renderLayoutTemplate({
					className: this.className,
					rowData: this.rowData,
				})
			);
		}
		else {
			this.rows = [];

			this._printHelpMessage();

			this._promptRow(this._afterPrompt.bind(this));
		}
	},

	prompt(questions, callback) {
		inquirer.prompt(questions, callback);
	},

	run() {
		return new Promise((resolve) => {
			this.after = resolve;
			this.init();
		});
	},
};

module.exports = LayoutCreator;
