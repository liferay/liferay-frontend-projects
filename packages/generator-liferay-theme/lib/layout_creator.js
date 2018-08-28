'use strict';

var _ = require('lodash-bindright')(require('lodash'));
var async = require('async');
var chalk = require('chalk');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');

var templatString = fs.readFileSync(
	path.join(__dirname, 'templates', 'layout_template.jst'),
	{
		encoding: 'utf8',
	}
);

var layoutTempletTpl = _.template(templatString);

var listRender = inquirer.prompt.prompts.list.prototype.render;

inquirer.prompt.prompts.list.prototype.render = function() {
	var index = this.selected;

	var choices = _.reduce(
		this.opt.choices.choices,
		function(result, item, index) {
			if (item.type != 'separator') {
				result.push(item);
			}

			return result;
		},
		[]
	);

	var choice = choices[index];

	this.opt.pageSize = 14;

	var originalName = choice.name;

	if (choice.selectedName) {
		choice.name = choice.selectedName;
	}

	listRender.call(this);

	choice.name = originalName;
};

var LayoutCreator = function(options) {
	this.after = options.after;
	this.className = options.className;
	this.liferayVersion = options.liferayVersion || '7.1';
	this.rowData = options.rowData;

	if (!this.after) {
		throw new Error('Must define an after function!');
	}

	this.init();
};

LayoutCreator.prototype = {
	init: function() {
		if (this.rowData) {
			this.after(
				this._renderLayoutTemplate({
					className: this.className,
					rowData: this.rowData,
				})
			);
		} else {
			this.rows = [];

			this._printHelpMessage();

			this._promptRow(this._afterPrompt.bind(this));
		}
	},

	prompt: function(questions, cb) {
		inquirer.prompt(questions, cb);
	},

	_addRow: function(data) {
		var rowInsertIndex = this.rowInsertIndex;

		if (_.isNumber(rowInsertIndex)) {
			this.rows.splice(rowInsertIndex, 0, data);

			this.rowInsertIndex = null;
		} else {
			this.rows.push(data);
		}

		this._printLayoutPreview();
	},

	_addWhiteSpace: function(choicesArray) {
		var separator = new inquirer.Separator(' ');

		choicesArray.push(separator);
		choicesArray.push(separator);
	},

	_afterPrompt: function(err) {
		var rowData = this._preprocessLayoutTemplateData(this.rows);

		var templateContent = this._renderLayoutTemplate({
			className: this.className,
			rowData: rowData,
		});

		this.after(templateContent);
	},

	_afterPromptColumnCount: function(answers, cb) {
		cb(null, answers.columnCount);
	},

	_afterPromptColumnWidths: function(answers, cb) {
		this._addRow(answers);

		cb(null, this.rows);
	},

	_afterPromptFinishRow: function(answers, cb) {
		var finish = answers.finish;

		if (finish == 'add') {
			this._promptRow(cb);
		} else if (finish == 'insert') {
			this._promptInsertRow(cb);
		} else if (answers.finish == 'finish') {
			cb(null);
		} else if (finish == 'remove') {
			this._promptRemoveRow(cb);
		}
	},

	_afterPromptInsertRow: function(answers, cb) {
		this.rowInsertIndex = answers.rowIndex;

		this._promptRow(cb);
	},

	_afterPromptRemoveRow: function(answers, cb) {
		this._removeRow(answers.rowIndex);

		this._promptFinishRow(this.rows, cb);
	},

	_formatInlineChoicePreview: function(spanValue, takenWidth) {
		var remainingWidth = 12 - (spanValue + takenWidth);

		var takenString = chalk.black.bgWhite(_.repeat(' ', takenWidth));
		var spanString = chalk.bgCyan(_.repeat(' ', spanValue));
		var remainingString = _.repeat(' ', remainingWidth);

		return (
			chalk.reset('|') +
			takenString +
			spanString +
			remainingString +
			chalk.reset('|')
		);
	},

	_formatPercentageValue: function(spanValue, takenWidth, preview) {
		var percentage = Math.floor(spanValue / 12 * 10000) / 100;

		var value = _.padEnd(
			spanValue + '/12 - ' + percentage.toString() + '%',
			14
		);

		if (preview) {
			var inlinePreview =
				' - ' + this._formatInlineChoicePreview(spanValue, takenWidth);

			value = value + inlinePreview;
		}

		return value;
	},

	_getColumnClassNames: function(number, total) {
		var classNames;

		if (total <= 1) {
			classNames = ['portlet-column-only', 'portlet-column-content-only'];
		} else if (number <= 1) {
			classNames = [
				'portlet-column-first',
				'portlet-column-content-first',
			];
		} else if (number >= total) {
			classNames = ['portlet-column-last', 'portlet-column-content-last'];
		}

		return classNames;
	},

	_getColumnWidthChoices: function(columnIndex, columnCount, answers) {
		var instance = this;

		var takenWidth = 0;
		var totalWidth = 12;

		_.forEach(answers, function(item, index) {
			item = _.parseInt(item);

			takenWidth = takenWidth + item;
		});

		var availableWidth = totalWidth - takenWidth;

		// if it's the last column, give remaining width as the only choice
		if (columnIndex + 1 >= columnCount) {
			var selectedName = instance._formatPercentageValue(
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
		} else {
			var remainingColumns = columnCount - (columnIndex + 1);

			availableWidth = availableWidth - remainingColumns;

			var choices = _.times(availableWidth, function(index) {
				var spanValue = index + 1;

				var selectedName = instance._formatPercentageValue(
					spanValue,
					takenWidth,
					true
				);

				return {
					name: instance._formatPercentageValue(
						spanValue,
						takenWidth
					),
					selectedName: selectedName,
					short: selectedName,
					value: spanValue,
				};
			});

			return choices;
		}
	},

	_getFinishRowChoices: function(rows) {
		var choices = [
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

	_getInsertRowChoices: function() {
		var instance = this;

		var rows = this.rows;

		var insertName = '  ' + _.repeat('-', 37);
		var insertSelectedName = '  ' + _.repeat('=', 37);

		var choicesArray = _.reduce(
			this.rows,
			function(choices, row, index) {
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

	_getRemoveRowChoices: function() {
		var instance = this;

		var rows = this.rows;

		var seperator = '  ' + _.repeat('-', 37);

		var choicesArray = _.reduce(
			this.rows,
			function(choices, row, index) {
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

	_getRowNumber: function() {
		var rowInsertIndex = this.rowInsertIndex;
		var rowNumber = this.rows.length;

		if (_.isNumber(rowInsertIndex)) {
			rowNumber = rowInsertIndex;
		}

		rowNumber = rowNumber + 1;

		return rowNumber;
	},

	_preprocessLayoutTemplateData: function(rows) {
		var instance = this;

		var totalColumnCount = 0;

		var rowData = _.map(rows, function(row, rowIndex) {
			var columnCount = _.size(row);

			return _.map(row, function(size, index) {
				var columnNumber = _.parseInt(index) + 1;

				totalColumnCount++;

				var columnData = {
					number: totalColumnCount,
					size: size,
				};

				var classNames = instance._getColumnClassNames(
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

	_printHelpMessage: function() {
		this._stdoutWrite(
			'\n  Layout templates implement Bootstrap\'s grid system.\n  Every row consists of 12 sections, so columns range in size from 1 to 12.\n\n'
		);
	},

	_printLayoutPreview: function() {
		var instance = this;

		var rowSeperator = chalk.bold('  ' + _.repeat('-', 37) + '\n');

		var preview =
			rowSeperator +
			_.map(this.rows, function(item, index) {
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

	_promptColumnCount: function(cb) {
		var instance = this;

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
			_.bindRight(this._afterPromptColumnCount, this, cb)
		);
	},

	_promptColumnWidths: function(columnCount, cb) {
		var instance = this;

		var rowNumber = instance._getRowNumber();

		var questions = _.times(columnCount, function(index) {
			var columnNumber = index + 1;

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

		this.prompt(
			questions,
			_.bindRight(this._afterPromptColumnWidths, this, cb)
		);
	},

	_promptFinishRow: function(rows, cb) {
		this.prompt(
			[
				{
					choices: this._getFinishRowChoices.bind(this, rows),
					message: 'What now?',
					name: 'finish',
					type: 'list',
				},
			],
			_.bindRight(this._afterPromptFinishRow, this, cb)
		);
	},

	_promptInsertRow: function(cb) {
		this.prompt(
			[
				{
					choices: this._getInsertRowChoices.bind(this),
					message: 'Where would you like to insert a new row?',
					name: 'rowIndex',
					type: 'list',
				},
			],
			_.bindRight(this._afterPromptInsertRow, this, cb)
		);
	},

	_promptRemoveRow: function(cb) {
		this.prompt(
			[
				{
					choices: this._getRemoveRowChoices.bind(this),
					message: 'What row would you like to remove?',
					name: 'rowIndex',
					type: 'list',
				},
			],
			_.bindRight(this._afterPromptRemoveRow, this, cb)
		);
	},

	_promptRow: function(done) {
		async.waterfall(
			[
				this._promptColumnCount.bind(this),
				this._promptColumnWidths.bind(this),
				this._promptFinishRow.bind(this),
			],
			done
		);
	},

	_removeRow: function(index) {
		this.rows.splice(index, 1);

		this._printLayoutPreview();
	},

	_renderPreviewLine: function(column, config) {
		var instance = this;

		config = config || {};

		var label = config.label;

		var line = _.repeat(' ', 35);

		var width = 0;

		_.forEach(column, function(columnWidth, index) {
			var prevWidth = width;

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

	_renderLayoutTemplate: function(options) {
		var liferayVersion = this.liferayVersion;

		return layoutTempletTpl(
			_.defaults(options, {
				columnPrefix: 'col-md-',
				rowClassName: 'row',
			})
		);
	},

	_replaceAt: function(string, index, character) {
		return (
			string.substr(0, index) +
			character +
			string.substr(index + character.length)
		);
	},

	_stdoutWrite: function(string) {
		process.stdout.write(string);
	},

	_stylePreviewLine: function(line, label) {
		if (label) {
			line = line.replace(/\d/g, function(match) {
				return chalk.cyan(match);
			});
		}

		return chalk.bold(line);
	},

	_validateColumnCount: function(value) {
		value = _.parseInt(value);

		var retVal = 'Please enter a number between 1 and 12!';

		if (_.isNumber(value) && value > 0 && value < 13) {
			retVal = true;
		}

		return retVal;
	},
};

module.exports = LayoutCreator;
