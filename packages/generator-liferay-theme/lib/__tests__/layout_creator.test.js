var _ = require('lodash');
var chai = require('chai');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');
var stripAnsi = require('strip-ansi');

var assert = chai.assert;
var sinonAssert = sinon.assert;

var LayoutCreator = require('../../lib/layout_creator');

describe('LayoutCreator', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(LayoutCreator.prototype);
	});

	describe('constructor', function() {
		it('should set options as instance properties and throw error if after function is not set', function() {
			var init = LayoutCreator.prototype.init;

			LayoutCreator.prototype.init = sinon.spy();

			var layoutCreator = new LayoutCreator({
				after: _.noop,
				className: 'class-name',
			});

			assert.equal(layoutCreator.after, _.noop);
			assert.equal(layoutCreator.className, 'class-name');
			sinonAssert.calledOnce(LayoutCreator.prototype.init);

			assert.throws(function() {
				new LayoutCreator({
					className: 'class-name',
				});
			}, 'Must define an after function!');

			LayoutCreator.prototype.init = init;
		});
	});

	describe('init', function() {
		it('should set rows to empty array and init prompting if rowData is undefined', function() {
			prototype.after = sinon.spy();
			prototype._promptRow = sinon.spy();

			prototype.init();

			assert.deepEqual(prototype.rows, []);
			sinonAssert.calledOnce(prototype._promptRow);

			sinonAssert.calledWithMatch(prototype._promptRow, sinon.match.func);
			sinonAssert.notCalled(prototype.after);
		});

		it('should use rowData if defined and skip prompting', function() {
			prototype._promptRow = sinon.spy();
			prototype._renderLayoutTemplate = sinon.stub().returns('template');
			prototype.after = sinon.spy();
			prototype.className = 'class-name';

			prototype.rowData = [];

			prototype.init();

			sinonAssert.calledWith(prototype._renderLayoutTemplate.getCall(0), {
				className: 'class-name',
				rowData: [],
			});

			sinonAssert.notCalled(prototype._promptRow);
			sinonAssert.calledOnce(prototype.after);
			sinonAssert.calledWith(prototype.after, 'template');
		});
	});

	describe('prompt', function() {
		it('should pass arguments to inquirer.prompt', function() {
			var prompt = inquirer.prompt;

			inquirer.prompt = sinon.spy();

			var cb = sinon.spy();

			prototype.prompt(['question1', 'question2'], cb);

			sinonAssert.calledWith(
				inquirer.prompt,
				['question1', 'question2'],
				cb
			);

			inquirer.prompt = prompt;
		});
	});

	describe('_addRow', function() {
		it('should add new row and print layout', function() {
			prototype._printLayoutPreview = sinon.spy();
			prototype.rows = [];

			var rowData = {
				data: 'data',
			};

			prototype._addRow(rowData);

			sinonAssert.calledOnce(prototype._printLayoutPreview);
			assert.deepEqual(prototype.rows[0], rowData);

			prototype.rowInsertIndex = 1;

			rowData.data = 123;

			prototype._addRow(rowData);

			sinonAssert.calledTwice(prototype._printLayoutPreview);
			assert.deepEqual(prototype.rows[1], rowData);
		});
	});

	describe('_addWhiteSpace', function() {
		it('should add whitespace', function() {
			var choices = [];

			prototype._addWhiteSpace(choices);

			assert.deepEqual(
				choices[0],
				new inquirer.Separator(' '),
				'Array has whitespace.'
			);
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
						columnNumber: 1,
					},
					{
						size: 6,
						columnNumber: 2,
					},
				],
			];

			prototype._afterPrompt();

			sinonAssert.calledOnce(prototype.after);
		});
	});

	describe('_afterPromptColumnCount', function() {
		it('should should pass columnCount to cb function', function() {
			var answers = {
				columnCount: 3,
			};

			var cb = sinon.spy();

			prototype._afterPromptColumnCount(answers, cb);

			sinonAssert.calledOnce(cb);
			sinonAssert.calledWith(cb, null, 3);
		});
	});

	describe('_afterPromptColumnWidths', function() {
		it('should should pass columnCount to cb function', function() {
			prototype._addRow = sinon.spy();
			prototype.rows = [1];

			var answers = {
				'0': 6,
				'1': 6,
			};

			var cb = sinon.spy();

			prototype._afterPromptColumnWidths(answers, cb);

			sinonAssert.calledWith(cb, null, [1]);
			sinonAssert.calledWith(prototype._addRow, answers);
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

			prototype._afterPromptFinishRow(
				{
					finish: 'add',
				},
				cbSpy
			);

			sinonAssert.calledOnce(prototype._promptRow);
			sinonAssert.calledWith(prototype._promptRow, cbSpy);

			prototype._afterPromptFinishRow(
				{
					finish: 'insert',
				},
				cbSpy
			);

			sinonAssert.calledOnce(prototype._promptInsertRow);
			sinonAssert.calledWith(prototype._promptInsertRow, cbSpy);

			prototype._afterPromptFinishRow(
				{
					finish: 'finish',
				},
				cbSpy
			);

			sinonAssert.calledOnce(cbSpy);

			prototype._afterPromptFinishRow(
				{
					finish: 'remove',
				},
				cbSpy
			);

			sinonAssert.calledOnce(prototype._promptRemoveRow);
			sinonAssert.calledWith(prototype._promptRemoveRow, cbSpy);

			sinonAssert.calledOnce(cbSpy);
			sinonAssert.calledOnce(prototype._promptRow);
		});

		it('should not call anything if invalid value', function() {
			var cbSpy = sinon.spy();
			prototype.rows = [1];

			prototype._promptInsertRow = sinon.spy();
			prototype._promptRemoveRow = sinon.spy();
			prototype._promptRow = sinon.spy();

			prototype._afterPromptFinishRow(
				{
					finish: 'notsupported',
				},
				cbSpy
			);

			sinonAssert.notCalled(cbSpy);
			sinonAssert.notCalled(prototype._promptInsertRow);
			sinonAssert.notCalled(prototype._promptRemoveRow);
			sinonAssert.notCalled(prototype._promptRow);
		});
	});

	describe('_afterPromptInsertRow', function() {
		it('should set rowInserIndex based on answers and pass cb to _promptRow', function() {
			var cb = _.noop;

			prototype._promptRow = sinon.spy();

			prototype._afterPromptInsertRow(
				{
					rowIndex: 2,
				},
				cb
			);

			assert.equal(prototype.rowInsertIndex, 2);
			sinonAssert.calledWith(prototype._promptRow, cb);
		});
	});

	describe('_afterPromptRemoveRow', function() {
		it('should pass rowIndex answer to _removeRow and re-prompt finish row', function() {
			prototype._promptFinishRow = sinon.spy();
			prototype._removeRow = sinon.spy();
			prototype.rows = [2];

			var cb = _.noop;

			prototype._afterPromptRemoveRow(
				{
					rowIndex: 3,
				},
				cb
			);

			sinonAssert.calledWith(prototype._removeRow, 3);
			sinonAssert.calledWith(prototype._promptFinishRow, [2], cb);
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
			prototype._formatInlineChoicePreview = sinon
				.stub()
				.returns('preview');

			var labels = [
				'1/12 - 8.33%',
				'2/12 - 16.66%',
				'3/12 - 25%',
				'4/12 - 33.33%',
				'5/12 - 41.66%',
				'6/12 - 50%',
				'7/12 - 58.33%',
				'8/12 - 66.66%',
				'9/12 - 75%',
				'10/12 - 83.33%',
				'11/12 - 91.66%',
				'12/12 - 100%',
			];

			_.forEach(labels, function(label, index) {
				assert(
					_.startsWith(
						prototype._formatPercentageValue(index + 1),
						label
					)
				);
			});

			sinonAssert.notCalled(prototype._formatInlineChoicePreview);

			_.forEach(labels, function(label, index) {
				var formattedLabel = prototype._formatPercentageValue(
					index + 1,
					0,
					true
				);

				assert(
					_.startsWith(formattedLabel, label),
					'starts with label'
				);
				assert(
					_.endsWith(formattedLabel, 'preview'),
					'adds inline preview to choice label'
				);
			});

			sinonAssert.callCount(prototype._formatInlineChoicePreview, 12);
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

			// assert.equal(_.last(choices).type, 'separator');
			assert.equal(choices[choices.length - 1].value, 11);
			assert.equal(choices.length, 11);

			choices = prototype._getColumnWidthChoices(1, 2, {
				'0': 5,
			});

			assert.equal(choices.length, 1);
			assert.equal(choices[0].value, 7);

			choices = prototype._getColumnWidthChoices(1, 4, {
				'0': 5,
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
				value: 'add',
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
					'1': 9,
				},
				{
					'0': 3,
					'1': 9,
				},
			];

			var choices = prototype._getInsertRowChoices();

			var choiceValue = 0;

			_.forEach(choices, function(choice, index) {
				index = index + 1;

				if (index % 2 == 0) {
					assert.equal(choice.type, 'separator');
					assert.equal(
						stripAnsi(choice.line),
						'  |3       |9                         |'
					);
				} else {
					assert.equal(
						choice.name,
						'  -------------------------------------'
					);
					assert.equal(choice.value, choiceValue);

					choiceValue++;
				}
			});

			assert(choices[choices.length - 1].type != 'separator');

			while (prototype.rows.length < 7) {
				prototype.rows.push({
					'0': 3,
					'1': 9,
				});
			}

			var choices = prototype._getInsertRowChoices();

			assert.equal(
				choices[0].name,
				'  -----------------TOP-----------------'
			);
			assert.equal(
				choices[0].selectedName,
				'  =================TOP================='
			);
		});
	});

	describe('_getRemoveRowChoices', function() {
		it('should return compact layout preview where row bodies are choices', function() {
			prototype.rows = [
				{
					'0': 3,
					'1': 9,
				},
				{
					'0': 3,
					'1': 9,
				},
			];

			var choices = prototype._getRemoveRowChoices();

			var choiceValue = 0;

			_.forEach(choices, function(choice, index) {
				index = index + 1;

				if (index % 2 == 0) {
					assert.equal(choice.value, choiceValue);
					assert.equal(
						stripAnsi(choice.name),
						'  |3       |9                         |'
					);

					choiceValue++;
				} else {
					assert.equal(
						stripAnsi(choice.line),
						'  -------------------------------------'
					);
					assert.equal(choice.type, 'separator');
				}
			});

			assert(choices[choices.length - 1].type == 'separator');

			while (prototype.rows.length < 7) {
				prototype.rows.push({
					'0': 3,
					'1': 9,
				});
			}

			var choices = prototype._getRemoveRowChoices();

			assert.equal(
				stripAnsi(choices[0].line),
				'  -----------------TOP-----------------'
			);
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
					'1': 10,
				},
				{
					'0': 2,
					'1': 1,
					'2': 9,
				},
				{
					'0': 12,
				},
			];

			var rowDataFromObjects = prototype._preprocessLayoutTemplateData(
				rows
			);

			rows = [[2, 10], [2, 1, 9], [12]];

			var rowDataFromArray = prototype._preprocessLayoutTemplateData(
				rows
			);

			assert(_.isArray(rowDataFromObjects), 'rowData is array');
			assert.deepEqual(
				rowDataFromObjects,
				rowDataFromArray,
				'that it returns the same data when passing in objects or arrays'
			);

			var number = 0;

			_.forEach(rowDataFromObjects, function(row, index) {
				assert(_.isArray(row), 'each row is an array');

				_.forEach(row, function(column, index) {
					assert(_.isObject(column), 'each row is an array');

					number++;

					assert.equal(
						number,
						column.number,
						'column number is indexed correctly'
					);
				});
			});

			var json = JSON.parse(
				fs.readFileSync(
					path.join(
						__dirname,
						'./__fixtures__/processed_template_data.json'
					)
				)
			);

			assert.deepEqual(rowDataFromObjects, json);
		});
	});

	describe('_printLayoutPreview', function() {
		it('should print layout preview', function() {
			prototype.rows = [[6, 6], [3, 3, 6]];

			prototype._stdoutWrite = sinon.spy();

			prototype._printLayoutPreview();

			var preview =
				'\n  Here is what your layout looks like so far\n' +
				'  -------------------------------------\n' +
				'  |6                |6                |\n' +
				'  |                 |                 |\n' +
				'  -------------------------------------\n' +
				'  |3       |3       |6                |\n' +
				'  |        |        |                 |\n' +
				'  -------------------------------------\n\n';

			var strippedPreview = stripAnsi(
				prototype._stdoutWrite.getCall(0).args[0]
			);

			assert.equal(strippedPreview, preview);
		});
	});

	describe('_promptColumnCount', function() {
		it('should prompt user for column count using correct row number in prompt message', function() {
			prototype.prompt = sinon.spy();

			prototype.rows = [];

			prototype._promptColumnCount(_.noop);

			var question = prototype.prompt.args[0][0][0];

			sinonAssert.calledWithMatch(
				prototype.prompt.getCall(0),
				sinon.match.array,
				sinon.match.func
			);
			assert.equal(question.name, 'columnCount');
			assert.equal(question.validate, prototype._validateColumnCount);
			assert.match(question.message, /row 1/);

			prototype.rows = [1, 2, 3];

			prototype._promptColumnCount(_.noop);

			question = prototype.prompt.args[1][0][0];

			sinonAssert.calledWithMatch(
				prototype.prompt.getCall(1),
				sinon.match.array,
				sinon.match.func
			);
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

			sinonAssert.calledOnce(prototype.prompt);

			var questions = prototype.prompt.args[0][0];

			sinonAssert.calledWithMatch(
				prototype.prompt.getCall(0),
				sinon.match.array,
				sinon.match.func
			);
			assert.equal(
				questions.length,
				2,
				'it creates a question for every column'
			);

			_.forEach(questions, function(question, index) {
				var columnNumber = index + 1;

				assert.equal(index, question.name, 'name is index');
				assert.match(
					question.message,
					new RegExp('column ' + columnNumber)
				);
				assert(_.isFunction(question.choices), 'choices is function');
			});
		});
	});

	describe('_promptFinishRow', function() {
		it('should prompt user for next action (add, insert, remove, finish)', function() {
			assertPromptFn(prototype, '_promptFinishRow', [[], _.noop], {
				message: 'What now?',
				name: 'finish',
			});
		});
	});

	describe('_promptInsertRow', function() {
		it('should prompt user for where they want to insert row', function() {
			assertPromptFn(prototype, '_promptInsertRow', [_.noop], {
				message: 'Where would you like to insert a new row?',
				name: 'rowIndex',
			});
		});
	});

	describe('_promptRemoveRow', function() {
		it('should prompt user for what row they want to remove', function() {
			assertPromptFn(prototype, '_promptRemoveRow', [_.noop], {
				message: 'What row would you like to remove?',
				name: 'rowIndex',
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
				};
			};

			prototype._promptColumnCount = getWaterfallFunction(
				'_promptColumnCount'
			);
			prototype._promptColumnWidths = getWaterfallFunction(
				'_promptColumnWidths'
			);
			prototype._promptFinishRow = getWaterfallFunction(
				'_promptFinishRow'
			);

			prototype._promptRow(function() {
				sinonAssert.calledWith(
					waterfallSpy.getCall(0),
					'_promptColumnCount'
				);
				sinonAssert.calledWith(
					waterfallSpy.getCall(1),
					'_promptColumnWidths',
					'_promptColumnCount'
				);
				sinonAssert.calledWith(
					waterfallSpy.getCall(2),
					'_promptFinishRow',
					'_promptColumnWidths'
				);

				done();
			});
		});
	});

	describe('_removeRow', function() {
		it('should remove row by index and print layout', function() {
			prototype._printLayoutPreview = sinon.spy();
			prototype.rows = [1, 2, 3];

			prototype._removeRow(1);

			sinonAssert.calledOnce(prototype._printLayoutPreview);
			assert.deepEqual(prototype.rows, [1, 3], 'it removed middle row');

			prototype._removeRow(1);

			sinonAssert.calledTwice(prototype._printLayoutPreview);
			assert.deepEqual(prototype.rows, [1], 'it removed last row');
		});
	});

	describe('_renderPreviewLine', function() {
		it('should render preview line', function() {
			var line = prototype._renderPreviewLine({
				'0': 4,
				'1': 8,
			});

			line = stripAnsi(line);

			assert.equal(line, '  |           |                       |');

			line = prototype._renderPreviewLine(
				{
					'0': 4,
					'1': 4,
					'2': 2,
					'3': 2,
				},
				{
					label: true,
				}
			);

			line = stripAnsi(line);

			assert.equal(line, '  |4          |4          |2    |2    |');
		});
	});

	describe('_renderLayoutTemplate', function() {
		it('should compile data into valid template', function() {
			var fileOptions = {
				encoding: 'utf8',
			};

			var json = JSON.parse(
				fs.readFileSync(
					path.join(
						__dirname,
						'./__fixtures__/processed_template_data.json'
					),
					fileOptions
				)
			);

			prototype.liferayVersion = '7.0';

			var tplContent = prototype._renderLayoutTemplate({
				className: 'my-class-name',
				rowData: json,
			});

			var tplFileContent = fs.readFileSync(
				path.join(__dirname, './__fixtures__/layout_template.tpl'),
				fileOptions
			);

			assert.equal(
				tplContent,
				tplFileContent,
				'correctly renders template'
			);
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
			prototype._stylePreviewLine;
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

	sinonAssert.calledWithMatch(
		prototype.prompt.getCall(0),
		sinon.match.array,
		sinon.match.func
	);

	assert.equal(question.message, assertionData.message);
	assert.equal(question.name, assertionData.name);
	assert.equal(question.type, 'list');
}
