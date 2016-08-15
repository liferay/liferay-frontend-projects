'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');
var stripAnsi = require('strip-ansi');

var assert = chai.assert;

var LayoutCreator = require('../../lib/layout_creator');

describe('LayoutCreator', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(LayoutCreator.prototype);
	});

	describe('constructor', function() {
		it('should set options as instance properties and throw error if after function is not set', function(done) {
			var init = LayoutCreator.prototype.init;

			LayoutCreator.prototype.init = sinon.spy();

			var layoutCreator = new LayoutCreator({
				after: _.noop,
				className: 'class-name'
			});

			assert.equal(layoutCreator.after, _.noop);
			assert.equal(layoutCreator.className, 'class-name');
			assert.equal(LayoutCreator.prototype.init.callCount, 1);

			assert.throws(function() {
				new LayoutCreator({
					className: 'class-name'
				});
			}, 'Must define an after function!');

			LayoutCreator.prototype.init = init;

			done();
		});
	});

	describe('init', function() {
		it('should set rows to empty array and init prompting if rowData is undefined', function(done) {
			prototype.after = sinon.spy();
			prototype._promptRow = sinon.spy();

			prototype.init();

			assert.deepEqual(prototype.rows, []);
			assert.equal(prototype._promptRow.callCount, 1);

			assert(_.isFunction(prototype._promptRow.args[0][0]), '_promptRow is called with function as first argument');
			assert(prototype.after.notCalled, 'after function was not called');

			done();
		});

		it('should use rowData if defined and skip prompting', function(done) {
			prototype._promptRow = sinon.spy();
			prototype._renderLayoutTemplate = sinon.stub().returns('template');
			prototype.after = sinon.spy();
			prototype.className = 'class-name';

			prototype.rowData = [];

			prototype.init();

			assert.deepEqual(prototype._renderLayoutTemplate.getCall(0).args[0], {
				className: 'class-name',
				rowData: []
			}, '_renderLayoutTemplate is called with correct data');

			assert(prototype._promptRow.notCalled, 'promptRow was not called');
			assert(prototype.after.calledOnce, 'after function was called once');
			assert(prototype.after.calledWith('template'), 'return value of _renderLayoutTemplate is passed to after function');

			done();
		});
	});

	describe('prompt', function() {
		it('should pass arguments to inquirer.prompt', function() {
			var prompt = inquirer.prompt;

			inquirer.prompt = sinon.spy();

			var cb = sinon.spy();

			prototype.prompt(['question1', 'question2'], cb);

			assert(inquirer.prompt.calledWith(['question1', 'question2'], cb));

			inquirer.prompt = prompt;
		});
	});

	describe('_addRow', function() {
		it('should add new row and print layout', function() {
			prototype._printLayoutPreview = sinon.spy();
			prototype.rows = [];

			var rowData = {
				data: 'data'
			};

			prototype._addRow(rowData);

			assert(prototype._printLayoutPreview.calledOnce, 'print layout was called once');
			assert.deepEqual(prototype.rows[0], rowData);
		});
	});

	describe('_addWhiteSpace', function() {
		it('should add whitespace', function() {
			var choices = [];

			prototype._addWhiteSpace(choices);

			assert.deepEqual(choices[0], new inquirer.Separator(' '), 'Array has whitespace.');
		});
	});

	describe('_afterPrompt', function() {
		it('should process data returned from prompts and render template passing content to after property', function() {
			prototype.after = sinon.spy();
			prototype.className = 'class-name';
			prototype.rows = [
				[
					{
						size: 6,
						columnNumber: 1
					},
					{
						size: 6,
						columnNumber: 2
					}
				]
			];

			prototype._afterPrompt();

			assert(prototype.after.calledOnce, 'after function was called');
		});
	});

	describe('_afterPromptColumnCount', function() {
		it('should should pass columnCount to cb function', function() {
			var answers = {
				columnCount: 3
			};

			var cb = sinon.spy();

			prototype._afterPromptColumnCount(answers, cb);

			assert(cb.calledOnce, 'cb is called once');
			assert(cb.calledWith(null, 3), 'cb is called with no error and columnCount from answers');
		});
	});

	describe('_afterPromptColumnWidths', function() {
		it('should should pass columnCount to cb function', function() {
			prototype._addRow = sinon.spy();
			prototype.rows = [1];

			var answers = {
				'0': 6,
				'1': 6
			};

			var cb = sinon.spy();

			prototype._afterPromptColumnWidths(answers, cb);

			assert(cb.calledWith(null, [1]), 'cb is called with no error and rows property');
			assert(prototype._addRow.calledWith(answers), 'row answers are passed to _addRow');
		});
	});

	describe('_afterPromptFinishRow', function() {
		it('should follow correct workflow based on selection', function() {
			var cbSpy = sinon.spy();
			prototype.rows = [1];

			prototype._promptInsertRow = sinon.spy();
			prototype._promptRemoveRow = sinon.spy();
			prototype._promptRow = sinon.spy();
			prototype._removeRow = sinon.spy();

			prototype._afterPromptFinishRow({
				finish: 'add'
			}, cbSpy);

			assert(prototype._promptRow.calledOnce, 'called correct function');
			assert(prototype._promptRow.calledWith(cbSpy), 'called with cb function');

			prototype._afterPromptFinishRow({
				finish: 'insert'
			}, cbSpy);

			assert(prototype._promptInsertRow.calledOnce, 'called correct function');
			assert(prototype._promptInsertRow.calledWith(cbSpy), 'called with cb function');

			prototype._afterPromptFinishRow({
				finish: 'finish'
			}, cbSpy);

			assert(cbSpy.calledOnce, 'called correct function');

			prototype._afterPromptFinishRow({
				finish: 'remove'
			}, cbSpy);

			assert(prototype._promptRemoveRow.calledOnce, 'called correct function');
			assert(prototype._promptRemoveRow.calledWith(cbSpy), 'called with cb function');

			assert(cbSpy.calledOnce, 'it did not call cb more than once');
			assert(prototype._promptRow.calledOnce, 'that it did not restart add prompt');
		});

		it('should not call anything if invalid value', function() {
			var cbSpy = sinon.spy();
			prototype.rows = [1];

			prototype._promptInsertRow = sinon.spy();
			prototype._promptRemoveRow = sinon.spy();
			prototype._promptRow = sinon.spy();

			prototype._afterPromptFinishRow({
				finish: 'notsupported'
			}, cbSpy);

			assert(cbSpy.notCalled);
			assert(prototype._promptInsertRow.notCalled);
			assert(prototype._promptRemoveRow.notCalled);
			assert(prototype._promptRow.notCalled);
		});
	});

	describe('_afterPromptInsertRow', function() {
		it('should set rowInserIndex based on answers and pass cb to _promptRow', function() {
			var cb = _.noop;

			prototype._promptRow = sinon.spy();

			prototype._afterPromptInsertRow({
				rowIndex: 2
			}, cb);

			assert.equal(prototype.rowInsertIndex, 2);
			assert(prototype._promptRow.calledWith(cb));
		});
	});

	describe('_afterPromptRemoveRow', function() {
		it('should pass rowIndex answer to _removeRow and re-prompt finish row', function() {
			prototype._promptFinishRow = sinon.spy();
			prototype._removeRow = sinon.spy();
			prototype.rows = [2];

			var cb = _.noop;

			prototype._afterPromptRemoveRow({
				rowIndex: 3
			}, cb);

			assert(prototype._removeRow.calledWith(3), 'removed row by index');
			assert(prototype._promptFinishRow.calledWith([2], cb));
		});
	});

	describe('_formatInlineChoicePreview', function() {
		it('should return formatted preview', function() {
			var preview = prototype._formatInlineChoicePreview(2, 2);

			assert.match(preview, /\S+\s{2}\S+\s{2}\S+\s{8}/);

			preview = prototype._formatInlineChoicePreview(5, 5);

			assert.match(preview, /\S+\s{5}\S+\s{5}\S+\s{2}/);

			preview = prototype._formatInlineChoicePreview(0, 12);

			assert.match(preview, /\S+\s{12}\S+/);
		});
	});

	describe('_formatPercentageValue', function() {
		it('should return formatted label with column width percentage', function() {
			prototype._formatInlineChoicePreview = sinon.stub().returns('preview');

			var labels = [
				'1/12 - 8.33%', '2/12 - 16.66%', '3/12 - 25%', '4/12 - 33.33%', '5/12 - 41.66%', '6/12 - 50%',
				'7/12 - 58.33%', '8/12 - 66.66%', '9/12 - 75%', '10/12 - 83.33%', '11/12 - 91.66%', '12/12 - 100%'
			];

			_.forEach(labels, function(label, index) {
				assert(_.startsWith(prototype._formatPercentageValue(index + 1), label));
			});

			assert(prototype._formatInlineChoicePreview.notCalled, '_formatInlineChoicePreview was not called');

			_.forEach(labels, function(label, index) {
				var formattedLabel = prototype._formatPercentageValue(index + 1, 0, true);

				assert(_.startsWith(formattedLabel, label), 'starts with label');
				assert(_.endsWith(formattedLabel, 'preview'), 'adds inline preview to choice label');
			});

			assert.equal(prototype._formatInlineChoicePreview.callCount, 12);
		});
	});

	describe('_getColumnClassNames', function() {
		it('should return appropriate column classes', function() {
			var classNames = prototype._getColumnClassNames(1, 1);

			assert.equal(classNames[0], 'portlet-column-only');
			assert.equal(classNames[1], 'portlet-column-content-only');

			classNames = prototype._getColumnClassNames(1, 2);

			assert.equal(classNames[0], 'portlet-column-first');
			assert.equal(classNames[1], 'portlet-column-content-first');

			classNames = prototype._getColumnClassNames(2, 2);

			assert.equal(classNames[0], 'portlet-column-last');
			assert.equal(classNames[1], 'portlet-column-content-last');

			classNames = prototype._getColumnClassNames(2, 3);

			assert(_.isUndefined(classNames));
		});
	});

	describe('_getColumnWidthChoices', function() {
		it('should return limited width choices based on columnIndex, columnCount, and available row width', function() {
			var choices = prototype._getColumnWidthChoices(0, 1, {});

			assert.equal(choices.length, 1);
			assert.equal(choices[0].value, 12);

			choices = prototype._getColumnWidthChoices(0, 2, {});

			//assert.equal(_.last(choices).type, 'separator');
			assert.equal(choices[choices.length - 1].value, 11);
			assert.equal(choices.length, 11);

			choices = prototype._getColumnWidthChoices(1, 2, {
				'0': 5
			});

			assert.equal(choices.length, 1);
			assert.equal(choices[0].value, 7);

			choices = prototype._getColumnWidthChoices(1, 4, {
				'0': 5
			});

			assert.equal(choices.length, 5);
		});
	});

	describe('_getFinishRowChoices', function() {
		it('should only return add option if rows property is empty', function() {
			var rows = [];

			var choices = prototype._getFinishRowChoices(rows);

			assert.equal(choices.length, 1);
			assert.deepEqual(choices[0], {
				name: 'Add row',
				value: 'add'
			});

			rows = [1];

			choices = prototype._getFinishRowChoices(rows);

			assert.equal(choices.length, 4);
		});
	});

	describe('_getInsertRowChoices', function() {
		it('should return compact layout preview where row borders are choices', function() {
			prototype.rows = [
				{
					'0': 3,
					'1': 9
				},
				{
					'0': 3,
					'1': 9
				}
			];

			var choices = prototype._getInsertRowChoices();

			var choiceValue = 0;

			_.forEach(choices, function(choice, index) {
				index = index + 1;

				if (index % 2 == 0) {
					assert.equal(choice.type, 'separator');
					assert.equal(stripAnsi(choice.line), '  |3       |9                         |');
				}
				else {
					assert.equal(choice.name, '  -------------------------------------');
					assert.equal(choice.value, choiceValue);

					choiceValue++;
				}
			});

			assert(choices[choices.length - 1].type != 'separator');
		});
	});

	describe('_getRemoveRowChoices', function() {
		it('should return compact layout preview where row bodies are choices', function() {
			prototype.rows = [
				{
					'0': 3,
					'1': 9
				},
				{
					'0': 3,
					'1': 9
				}
			];

			var choices = prototype._getRemoveRowChoices();

			var choiceValue = 0;

			_.forEach(choices, function(choice, index) {
				index = index + 1;

				if (index % 2 == 0) {
					assert.equal(choice.value, choiceValue);
					assert.equal(stripAnsi(choice.name), '  |3       |9                         |');

					choiceValue++;
				}
				else {
					assert.equal(stripAnsi(choice.line), '  -------------------------------------');
					assert.equal(choice.type, 'separator');
				}
			});

			assert(choices[choices.length - 1].type == 'separator');
		});
	});

	describe('_getRowNumber', function() {
		it('should return next row number for labels and messages', function() {
			prototype.rows = [1, 2];

			var rowNumber = prototype._getRowNumber();

			assert.equal(rowNumber, 3);

			prototype.rowInsertIndex = 1;

			rowNumber = prototype._getRowNumber();

			assert.equal(rowNumber, 2);
		});
	});

	describe('_preprocessLayoutTemplateData', function() {
		it('should convert prompt data to data that template can easily process', function() {
			var rows = [
				{
					'0': 2,
					'1': 10
				},
				{
					'0': 2,
					'1': 1,
					'2': 9
				},
				{
					'0': 12
				}
			];

			var rowDataFromObjects = prototype._preprocessLayoutTemplateData(rows);

			rows = [
				[2, 10],
				[2, 1, 9],
				[12]
			];

			var rowDataFromArray = prototype._preprocessLayoutTemplateData(rows);

			assert(_.isArray(rowDataFromObjects), 'rowData is array');
			assert.deepEqual(rowDataFromObjects, rowDataFromArray, 'that it returns the same data when passing in objects or arrays');

			var number = 0;

			_.forEach(rowDataFromObjects, function(row, index) {
				assert(_.isArray(row), 'each row is an array');

				_.forEach(row, function(column, index) {
					assert(_.isObject(column), 'each row is an array');

					number++;

					assert.equal(number, column.number, 'column number is indexed correctly');
				});
			});

			var json = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/json/processed_template_data.json')));

			assert.deepEqual(rowDataFromObjects, json);
		});
	});

	describe('_printLayoutPreview', function() {
		it('should print layout preview', function() {
			prototype.rows = [
				[6, 6],
				[3, 3, 6]
			];

			prototype._stdoutWrite = sinon.spy();

			prototype._printLayoutPreview();

			var preview = '\n  Here is what your layout looks like so far\n' +
				'  -------------------------------------\n' +
				'  |6                |6                |\n' +
				'  |                 |                 |\n' +
				'  -------------------------------------\n' +
				'  |3       |3       |6                |\n' +
				'  |        |        |                 |\n' +
				'  -------------------------------------\n\n';

			var strippedPreview = stripAnsi(prototype._stdoutWrite.getCall(0).args[0]);

			assert.equal(strippedPreview, preview);
		});
	});

	describe('_promptColumnCount', function() {
		it('should prompt user for column count using correct row number in prompt message', function() {
			prototype.prompt = sinon.spy();

			prototype.rows = [];

			prototype._promptColumnCount(_.noop);

			var question = prototype.prompt.args[0][0][0];

			assert(_.isFunction(prototype.prompt.args[0][1]));
			assert.equal(question.name, 'columnCount');
			assert.equal(question.validate, prototype._validateColumnCount);
			assert.match(question.message, /row 1/);

			prototype.rows = [1, 2, 3];

			prototype._promptColumnCount(_.noop);

			question = prototype.prompt.args[1][0][0];

			assert(_.isFunction(prototype.prompt.args[0][1]));
			assert.equal(question.name, 'columnCount');
			assert.equal(question.validate, prototype._validateColumnCount);
			assert.match(question.message, /row 4/);
		});
	});

	describe('_promptColumnWidths', function() {
		it('should prompt user for column widths', function() {
			prototype.prompt = sinon.spy();
			prototype.rows = [];

			prototype._promptColumnWidths(2, _.noop);

			assert(prototype.prompt.calledOnce, 'prompt is called once');

			var questions = prototype.prompt.args[0][0];

			assert(_.isArray(questions), 'first arg is array');
			assert.equal(questions.length, 2, 'it creates a question for every column');
			assert(_.isFunction(prototype.prompt.args[0][1]), 'second arg is cb');

			_.forEach(questions, function(question, index) {
				var columnNumber = index + 1;

				assert.equal(index, question.name, 'name is index');
				assert.match(question.message, new RegExp('column ' + columnNumber));
				assert(_.isFunction(question.choices), 'choices is function');
			});
		});
	});

	describe('_promptFinishRow', function() {
		it('should prompt user for next action (add, insert, remove, finish)', function() {
			assertPromptFn(prototype, '_promptFinishRow', [[], _.noop], {
				message: 'What now?',
				name: 'finish'
			});
		});
	});

	describe('_promptInsertRow', function() {
		it('should prompt user for where they want to insert row', function() {
			assertPromptFn(prototype, '_promptInsertRow', [_.noop], {
				message: 'Where would you like to insert a new row?',
				name: 'rowIndex'
			});
		});
	});

	describe('_promptRemoveRow', function() {
		it('should prompt user for what row they want to remove', function() {
			assertPromptFn(prototype, '_promptRemoveRow', [_.noop], {
				message: 'What row would you like to remove?',
				name: 'rowIndex'
			});
		});
	});

	describe('_promptRow', function() {
		it('should remove last row and print layout', function(done) {
			var waterfallSpy = sinon.spy();

			var getWaterfallFunction = function(name) {
				return function(data, cb) {
					if (!cb) {
						cb = data;
					}

					waterfallSpy(name, data);

					cb(null, name);
				}
			};

			prototype._promptColumnCount = getWaterfallFunction('_promptColumnCount');
			prototype._promptColumnWidths = getWaterfallFunction('_promptColumnWidths');
			prototype._promptFinishRow = getWaterfallFunction('_promptFinishRow');

			prototype._promptRow(function() {
				assert.equal(waterfallSpy.getCall(0).args[0], '_promptColumnCount');
				assert(waterfallSpy.getCall(1).calledWith('_promptColumnWidths', '_promptColumnCount'));
				assert(waterfallSpy.getCall(2).calledWith('_promptFinishRow', '_promptColumnWidths'));

				done();
			});
		});
	});

	describe('_removeRow', function() {
		it('should remove row by index and print layout', function() {
			prototype._printLayoutPreview = sinon.spy();
			prototype.rows = [1, 2, 3];

			prototype._removeRow(1);

			assert(prototype._printLayoutPreview.calledOnce, 'it printed new layout');
			assert.deepEqual(prototype.rows, [1, 3], 'it removed middle row');

			prototype._removeRow(1);

			assert(prototype._printLayoutPreview.calledTwice, 'it printed new layout');
			assert.deepEqual(prototype.rows, [1], 'it removed last row');
		});
	});

	describe('_renderPreviewLine', function() {
		it('should render preview line', function() {
			var line = prototype._renderPreviewLine({
				'0': 4,
				'1': 8
			});

			line = stripAnsi(line);

			assert.equal(line, '  |           |                       |');

			line = prototype._renderPreviewLine({
				'0': 4,
				'1': 4,
				'2': 2,
				'3': 2
			}, {
				label: true
			});

			line = stripAnsi(line);

			assert.equal(line, '  |4          |4          |2    |2    |');
		});
	});

	describe('_renderLayoutTemplate', function() {
		it('should compile data into valid template', function() {
			var fileOptions = {
				encoding: 'utf8'
			};

			var json = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/json/processed_template_data.json'), fileOptions));

			prototype.liferayVersion = '7.0';

			var tplContent = prototype._renderLayoutTemplate({
				className: 'my-class-name',
				rowData: json
			});

			var tplFileContent = fs.readFileSync(path.join(__dirname, '../fixtures/tpl/layout_template.tpl'), fileOptions);

			assert.equal(tplContent, tplFileContent, 'correctly renders template');
		});
	});

	describe('_replaceAt', function() {
		it('should replace string character at index', function() {
			assert.equal(prototype._replaceAt('string', 0, 'x'), 'xtring');
			assert.equal(prototype._replaceAt('string', 2, 'x'), 'stxing');
			assert.equal(prototype._replaceAt('string', 6, 'x'), 'stringx');
		});
	});

	describe('_stylePreviewLine', function() {
		it('should pass', function() {
			prototype._stylePreviewLine
		});
	});

	describe('_validateColumnCount', function() {
		it('should validate column count', function() {
			var errMessage = 'Please enter a number between 1 and 12!';

			var retVal = prototype._validateColumnCount(1);

			assert(retVal, '1 is valid');

			retVal = prototype._validateColumnCount(12);

			assert(retVal, '12 is valid');

			retVal = prototype._validateColumnCount(0);

			assert.equal(retVal, errMessage, '0 is invalid');

			retVal = prototype._validateColumnCount(13);

			assert(retVal, errMessage, '12 is invalid');

			retVal = prototype._validateColumnCount('string');

			assert(retVal, errMessage, 'string is invalid');
		});
	});
});

function assertPromptFn(prototype, fnName, args, assertionData) {
	prototype.prompt = sinon.spy();

	prototype[fnName].apply(prototype, args);

	var args = prototype.prompt.getCall(0).args;
	var question = args[0][0];

	assert(_.isFunction(question.choices), 'choices is function');
	assert.equal(question.message, assertionData.message);
	assert.equal(question.name, assertionData.name);
	assert.equal(question.type, 'list');

	assert(_.isFunction(args[1]), 'callback is function');
}
