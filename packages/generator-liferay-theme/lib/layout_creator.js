'use strict';

var _ = require('lodash-bindright')(require('lodash'));
var async = require('async');
var chalk = require('chalk');
var inquirer = require('inquirer');

var layoutTempletTpl = _.template('<div class="<%= className %>" id="main-content" role="main">\n' +
	'<% _.forEach(rowData, function(row, index) { %>' +
		'\t<div class="portlet-layout <%= rowClassName %>">\n' +
			'<% _.forEach(row, function(column, index) { %>' +
				'\t\t<div class="<%= columnPrefix %><%= column.size %> portlet-column<%= column.className ? " " + column.className : "" %>" id="column-<%= column.number %>">\n' +
					'\t\t\t$processor.processColumn("column-<%= column.number %>", "portlet-column-content<%= column.contentClassName ? " " + column.contentClassName : "" %>")\n' +
				'\t\t</div>\n' +
			'<% }); %>' +
		'\t</div>\n' +
	'<% }); %>' +
'</div>');

var listRender = inquirer.prompt.prompts.list.prototype.render;

inquirer.prompt.prompts.list.prototype.render = function() {
	var index = this.selected;

	var choice = this.opt.choices.choices[index];

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
	this.liferayVersion = options.liferayVersion || '7.0';
	this.rowData = options.rowData;

	if (!this.after) {
		throw new Error('Must define an after function!');
	}

	this.init();
};

LayoutCreator.prototype = {
	init: function() {
		if (this.rowData) {
			this.after(this._renderLayoutTemplate({
				className: this.className,
				rowData: this.rowData
			}));
		}
		else {
			this.rows = [];

			this._promptRow(this._afterPrompt.bind(this));
		}
	},

	prompt: function(questions, cb) {
		inquirer.prompt(questions, cb);
	},

	_addRow: function(data) {
		this.rows.push(data);

		this._printLayoutPreview();
	},

	_afterPrompt: function(err) {
		var rowData = this._preprocessLayoutTemplateData(this.rows);

		var templateContent = this._renderLayoutTemplate({
			className: this.className,
			rowData: rowData
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
		}
		else if (answers.finish == 'finish') {
			cb(null);
		}
		else if (finish == 'remove') {
			this._removeRow()

			this._promptFinishRow(this.rows, cb);
		}
	},

	_formatInlineChoicePreview: function(spanValue, takenWidth) {
		var remainingWidth = 12 - (spanValue + takenWidth);

		var takenString = chalk.black.bgWhite(_.repeat(' ', takenWidth));
		var spanString = chalk.bgCyan(_.repeat(' ', spanValue));
		var remainingString = _.repeat(' ', remainingWidth);

		return chalk.reset('|') + takenString + spanString + remainingString + chalk.reset('|');
	},

	_formatPercentageValue: function(spanValue, takenWidth, preview) {
		var percentage = Math.floor(spanValue / 12 * 10000) / 100;

		var value = _.padEnd(spanValue + '/12 - ' + percentage.toString() + '% -', 17);

		if (preview) {
			var inlinePreview = this._formatInlineChoicePreview(spanValue, takenWidth);

			value = value + inlinePreview;
		}

		return value;
	},

	_getColumnClassNames: function(number, total) {
		var classNames;

		if (total <= 1) {
			classNames = ['portlet-column-only', 'portlet-column-content-only'];
		}
		else if (number <= 1) {
			classNames = ['portlet-column-first', 'portlet-column-content-first'];
		}
		else if (number >= total) {
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
			var selectedName = instance._formatPercentageValue(availableWidth, takenWidth, true);

			return [
				{
					name: instance._formatPercentageValue(availableWidth, takenWidth),
					selectedName: selectedName,
					short: selectedName,
					value: availableWidth
				}
			];
		}
		else {
			var remainingColumns = columnCount - (columnIndex + 1);

			availableWidth = availableWidth - remainingColumns;

			var choices = _.times(availableWidth, function(index) {
				var spanValue = index + 1;

				var selectedName = instance._formatPercentageValue(spanValue, takenWidth, true);

				return {
					name: instance._formatPercentageValue(spanValue, takenWidth),
					selectedName: selectedName,
					short: selectedName,
					value: spanValue
				};
			});

			choices.push(new inquirer.Separator());

			return choices;
		}
	},

	_getFinishRowChoices: function(rows) {
		var choices = [
			{
				name: 'Add row',
				value: 'add'
			}
		];

		if (rows.length) {
			choices.push({
				name: 'Remove last row',
				value: 'remove'
			});

			choices.push({
				name: 'Finish layout',
				value: 'finish'
			});
		}

		return choices;
	},

	_replaceAt: function(string, index, character) {
		return string.substr(0, index) + character + string.substr(index + character.length);
	},

	_printLayoutPreview: function() {
		var instance = this;

		var rowSeperator = _.repeat('-', 37) + '\n';

		var preview = rowSeperator + _.map(this.rows, function(item, index) {
			var line = _.repeat(' ', 35);

			var width = 0;

			_.forEach(item, function(columnWidth, index) {
				width = width + (columnWidth * 3);

				if (width < 36) {
					line = instance._replaceAt(line, width - 1, '|');
				}
			});

			line = '|' + line + '|\n';

			return _.repeat(line, 2) + rowSeperator;
		}).join('');

		process.stdout.write(chalk.cyan('\nHere is what your layout looks like so far\n') + preview);
	},

	_promptColumnCount: function(cb) {
		var instance = this;

		var row = this.rows.length + 1;

		this.prompt([{
			default: 1,
			message: 'How many columns would you like for ' + chalk.cyan('row', row) + '?',
			name: 'columnCount',
			validate: instance._validateColumnCount
		}], _.bindRight(this._afterPromptColumnCount, this, cb));
	},

	_promptColumnWidths: function(columnCount, cb) {
		var instance = this;

		var row = this.rows.length + 1;

		var questions = _.times(columnCount, function(index) {
			var columnNumber = index + 1;

			return {
				choices: instance._getColumnWidthChoices.bind(instance, index, columnCount),
				message: 'How wide do you want ' + chalk.cyan('row', row, 'column', columnNumber) + '?',
				name: index.toString(),
				type: 'list'
			}
		});

		this.prompt(questions, _.bindRight(this._afterPromptColumnWidths, this, cb));
	},

	_promptFinishRow: function(rows, cb) {
		var instance = this;

		this.prompt([{
			choices: this._getFinishRowChoices.bind(this, rows),
			message: 'What now?',
			name: 'finish',
			type: 'list'
		}], _.bindRight(this._afterPromptFinishRow, this, cb));
	},

	_promptRow: function(done) {
		var instance = this;

		async.waterfall([
			instance._promptColumnCount.bind(instance),
			instance._promptColumnWidths.bind(instance),
			instance._promptFinishRow.bind(instance)
		], done);
	},

	_removeRow: function() {
		this.rows.pop();

		this._printLayoutPreview();
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
					size: size
				}

				var classNames = instance._getColumnClassNames(columnNumber, columnCount);

				if (classNames) {
					columnData.className = classNames[0];
					columnData.contentClassName = classNames[1];
				}

				return columnData;
			});
		});

		return rowData;
	},

	_renderLayoutTemplate: function(options) {
		var liferayVersion = this.liferayVersion;

		return layoutTempletTpl(_.defaults(options, {
			columnPrefix: liferayVersion == '7.0' ? 'col-md-': 'span',
			rowClassName: liferayVersion == '7.0' ? 'row': 'row-fluid'
		}));
	},

	_validateColumnCount: function(value) {
		value = _.parseInt(value);

		var retVal = 'Please enter a number between 1 and 12!';

		if (_.isNumber(value) && value > 0 && value < 13) {
			retVal = true;
		}

		return retVal;
	}
};

module.exports = LayoutCreator;
