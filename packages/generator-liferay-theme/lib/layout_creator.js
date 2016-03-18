'use strict';

var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');
var inquirer = require('inquirer');

var layoutTempletTpl = _.template('<div class="<%= className %>" id="main-content" role="main">\n' +
	'<% _.forEach(rowData, function(row, index) { %>' +
		'\t<div class="portlet-layout row">\n' +
			'<% _.forEach(row, function(column, index) { %>' +
				'\t\t<div class="col-md-<%= column.size %> portlet-column<%= column.className ? " " + column.className : "" %>" id="column-<%= column.columnNumber %>">\n' +
					'\t\t\t$processor.processColumn("column-<%= column.columnNumber %>", "portlet-column-content<%= column.contentClassName ? " " + column.contentClassName : "" %>")\n' +
				'\t\t</div>\n' +
			'<% }); %>' +
		'\t</div>\n' +
	'<% }); %>' +
'</div>');

var layoutTempletTpl_62 = _.template('<div class="<%= className %>" id="main-content" role="main">\n' +
	'<% _.forEach(rowData, function(row, index) { %>' +
		'\t<div class="portlet-layout row-fluid">\n' +
			'<% _.forEach(row, function(column, index) { %>' +
				'\t\t<div class="portlet-column<%= column.className ? " " + column.className : "" %> span<%= column.size %>" id="column-<%= column.columnNumber %>">\n' +
					'\t\t\t$processor.processColumn("column-<%= column.columnNumber %>", "portlet-column-content<%= column.contentClassName ? " " + column.contentClassName : "" %>")\n' +
				'\t\t</div>\n' +
			'<% }); %>' +
		'\t</div>\n' +
	'<% }); %>' +
'</div>');

var LayoutCreator = function(options) {
	this.after = options.after;
	this.className = options.className;

	if (!this.after) {
		throw new Error('Must define an after function!');
	}

	this.init();
};

LayoutCreator.prototype = {
	init: function() {
		var instance = this;

		this.rows = [];

		this._promptRow(function(err) {
			var rowData = instance._preprocessLayoutTemplateData(instance.rows);

			var templateContent = instance._renderLayoutTemplate({
				className: instance.className,
				rowData: rowData
			});

			instance.after(templateContent);
		});
	},

	prompt: function(questions, cb) {
		inquirer.prompt(questions, cb);
	},

	_addRow: function(data) {
		this.rows.push(data);

		this._printLayoutPreview();
	},

	_formatPercentageValue: function(spanValue) {
		var percentage = Math.floor(spanValue / 12 * 10000) / 100;

		return spanValue + '/12 - ' + percentage.toString() + '%';
	},

	_formatRowData: function(answers) {
		return answers;
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

	_promptColumnCount: function(done) {
		var instance = this;

		var row = this.rows.length + 1;

		this.prompt([{
			message: 'How many columns would you like for ' + chalk.cyan('row', row) + '?',
			name: 'columnCount',
			validate: instance._validateColumnCount
		}], done);
	},

	_promptColumnWidths: function(columnCount, cb) {
		var instance = this;

		var row = this.rows.length + 1;

		var totalWidth = 12;

		var questions = _.times(columnCount, function(index) {
			var columnIndex = index + 1;

			return {
				choices: function(answers) {
					var takenWidth = 0;

					_.forEach(answers, function(item, index) {
						item = _.parseInt(item);

						takenWidth = takenWidth + item;
					});

					var availableWidth = totalWidth - takenWidth;

					// if it's the last column, give remaining width as the only choice
					if (index + 1 >= columnCount) {
						return [{
							name: instance._formatPercentageValue(availableWidth),
							value: availableWidth
						}]
					}
					else {
						var remainingColumns = columnCount - (index + 1);

						availableWidth = availableWidth - remainingColumns;

						return _.times(availableWidth, function(index) {
							var spanValue = index + 1;

							return {
								name: instance._formatPercentageValue(spanValue),
								value: spanValue
							};
						});
					}
				},
				message: 'How wide do you want ' + chalk.cyan('row', row, 'column', columnIndex) + '?',
				name: columnIndex,
				type: 'list'
			}
		});

		this.prompt(questions, cb);
	},

	_promptFinishRow: function(cb) {
		var instance = this;

		this.prompt([{
			choices: function() {
				var choices = [{
					name: 'Add row',
					value: 'add'
				}];

				if (instance.rows.length) {
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
			message: 'What now?',
			name: 'finish',
			type: 'list'
		}], function(answers) {
			var finish = answers.finish;

			if (finish == 'remove') {
				instance._removeRow()

				instance._promptFinishRow(cb);
			}
			else {
				cb(answers);
			}
		});
	},

	_promptRow: function(done) {
		var instance = this;

		async.waterfall([
			function(cb) {
				instance._promptColumnCount(function(answers) {
					cb(null, answers.columnCount);
				});
			},
			function(columnCount, cb) {
				instance._promptColumnWidths(columnCount, function(answers) {
					var rowData = instance._formatRowData(answers);

					instance._addRow(rowData);

					cb(null, rowData);
				});
			},
			function(rowData, cb) {
				instance._promptFinishRow(function(answers) {
					if (answers.finish == 'add') {
						instance._promptRow(cb);
					}
					else if (answers.finish == 'finish') {
						cb(null);
					}
				});
			}
		], done);
	},

	_removeRow: function() {
		this.rows.pop();

		this._printLayoutPreview();
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

	_preprocessLayoutTemplateData: function(rows) {
		var instance = this;

		var totalColumnCount = 0;

		var rowData = _.map(rows, function(row, rowIndex) {
			var columnCount = _.size(row);

			return _.map(row, function(size, columnNumber) {
				columnNumber = _.parseInt(columnNumber);

				totalColumnCount++;

				var columnData = {
					columnNumber: totalColumnCount,
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
		return layoutTempletTpl(options);
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
