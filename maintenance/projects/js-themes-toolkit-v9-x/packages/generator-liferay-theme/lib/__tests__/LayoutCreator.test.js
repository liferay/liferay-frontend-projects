/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const sinon = require('sinon');
const stripAnsi = require('strip-ansi');

const assert = chai.assert;
const sinonAssert = sinon.assert;

describe('LayoutCreator', () => {
	let FORCE_COLOR;

	let LayoutCreator;

	let inquirer;

	var prototype;

	beforeEach(() => {
		FORCE_COLOR = process.env.FORCE_COLOR;

		process.env.FORCE_COLOR = 3;

		jest.resetModules();

		LayoutCreator = require('../../lib/LayoutCreator');

		inquirer = require('inquirer');

		prototype = _.create(LayoutCreator.prototype);
	});

	afterEach(() => {
		if (FORCE_COLOR !== undefined) {
			process.env.FORCE_COLOR = FORCE_COLOR;
		}
		else {
			delete process.env.FORCE_COLOR;
		}
	});

	describe('constructor', () => {
		it('sets options as instance properties', () => {
			var init = LayoutCreator.prototype.init;

			LayoutCreator.prototype.init = sinon.spy();

			var layoutCreator = new LayoutCreator({
				className: 'class-name',
			});

			assert.equal(layoutCreator.className, 'class-name');

			LayoutCreator.prototype.init = init;
		});
	});

	describe('init', () => {
		it('sets rows to empty array and init prompting if rowData is undefined', () => {
			prototype.after = sinon.spy();
			prototype._promptRow = sinon.spy();

			prototype.init();

			assert.deepEqual(prototype.rows, []);
			sinonAssert.calledOnce(prototype._promptRow);

			sinonAssert.calledWithMatch(prototype._promptRow, sinon.match.func);
			sinonAssert.notCalled(prototype.after);
		});

		it('uses rowData if defined and skip prompting', () => {
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

	describe('prompt', () => {
		it('passes arguments to inquirer.prompt', () => {
			var prompt = inquirer.prompt;

			inquirer.prompt = sinon.spy();

			var cb = sinon.spy();

			prototype.prompt(
				[
					{
						default: 'foobar',
						message: 'question1',
						name: 'thing',
					},
				],
				cb
			);

			sinonAssert.calledWith(
				inquirer.prompt,
				[
					{
						default: 'foobar',
						message: 'question1',
						name: 'thing',
					},
				],
				cb
			);

			inquirer.prompt = prompt;
		});
	});

	describe('_addRow', () => {
		it('adds new row and print layout', () => {
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

	describe('_addWhiteSpace', () => {
		it('adds whitespace', () => {
			var choices = [];

			prototype._addWhiteSpace(choices);

			const separator = new inquirer.Separator(' ');

			assert.equal(choices[0].line, separator.line);
			assert.equal(choices[0].type, separator.type);
		});
	});

	describe('_afterPrompt', () => {
		it('processes data returned from prompts and render template passing content to after property', () => {
			prototype.after = sinon.spy();
			prototype.className = 'class-name';
			prototype.rows = [
				[
					{
						columnNumber: 1,
						size: 6,
					},
					{
						columnNumber: 2,
						size: 6,
					},
				],
			];

			prototype._afterPrompt();

			sinonAssert.calledOnce(prototype.after);
		});
	});

	describe('_afterPromptColumnCount', () => {
		it('passes columnCount to cb function', () => {
			var answers = {
				columnCount: 3,
			};

			var cb = sinon.spy();

			prototype._afterPromptColumnCount(answers, cb);

			sinonAssert.calledOnce(cb);
			sinonAssert.calledWith(cb, null, 3);
		});
	});

	describe('_afterPromptColumnWidths', () => {
		it('pass columnCount to cb function', () => {
			prototype._addRow = sinon.spy();
			prototype.rows = [1];

			var answers = {
				0: 6,
				1: 6,
			};

			var cb = sinon.spy();

			prototype._afterPromptColumnWidths(answers, cb);

			sinonAssert.calledWith(cb, null, [1]);
			sinonAssert.calledWith(prototype._addRow, answers);
		});
	});

	describe('_afterPromptFinishRow', () => {
		it('follows correct workflow based on selection', () => {
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

		it('does not call anything if invalid value', () => {
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

	describe('_afterPromptInsertRow', () => {
		it('sets rowInserIndex based on answers and pass cb to _promptRow', () => {
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

	describe('_afterPromptRemoveRow', () => {
		it('passes rowIndex answer to _removeRow and re-prompt finish row', () => {
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

	describe('_formatInlineChoicePreview', () => {
		it('returns formatted preview', () => {
			var preview = prototype._formatInlineChoicePreview(2, 2);

			assert.match(preview, /\S+\s{2}\S+\s{2}\S+\s{8}/);

			preview = prototype._formatInlineChoicePreview(5, 5);

			assert.match(preview, /\S+\s{5}\S+\s{5}\S+\s{2}/);

			preview = prototype._formatInlineChoicePreview(0, 12);

			assert.match(preview, /\S+\s{12}\S+/);
		});
	});

	describe('_formatPercentageValue', () => {
		it('returns formatted label with column width percentage', () => {
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

			_.forEach(labels, (label, index) => {
				assert(
					_.startsWith(
						prototype._formatPercentageValue(index + 1),
						label
					)
				);
			});

			sinonAssert.notCalled(prototype._formatInlineChoicePreview);

			_.forEach(labels, (label, index) => {
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

	describe('_getColumnClassNames', () => {
		it('returns appropriate column classes', () => {
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

	describe('_getColumnWidthChoices', () => {
		it('returns limited width choices based on columnIndex, columnCount, and available row width', () => {
			var choices = prototype._getColumnWidthChoices(0, 1, {});

			assert.equal(choices.length, 1);
			assert.equal(choices[0].value, 12);

			choices = prototype._getColumnWidthChoices(0, 2, {});

			// assert.equal(_.last(choices).type, 'separator');

			assert.equal(choices[choices.length - 1].value, 11);
			assert.equal(choices.length, 11);

			choices = prototype._getColumnWidthChoices(1, 2, {
				0: 5,
			});

			assert.equal(choices.length, 1);
			assert.equal(choices[0].value, 7);

			choices = prototype._getColumnWidthChoices(1, 4, {
				0: 5,
			});

			assert.equal(choices.length, 5);
		});
	});

	describe('_getFinishRowChoices', () => {
		it('only returns add option if rows property is empty', () => {
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

	describe('_getInsertRowChoices', () => {
		it('returns compact layout preview where row borders are choices', () => {
			prototype.rows = [
				{
					0: 3,
					1: 9,
				},
				{
					0: 3,
					1: 9,
				},
			];

			let choices = prototype._getInsertRowChoices();

			let choiceValue = 0;

			_.forEach(choices, (choice, index) => {
				index = index + 1;

				if (index % 2 === 0) {
					assert.equal(choice.type, 'separator');
					assert.equal(
						stripAnsi(choice.line),
						'  |3       |9                         |'
					);
				}
				else {
					assert.equal(
						choice.name,
						'  -------------------------------------'
					);
					assert.equal(choice.value, choiceValue);

					choiceValue++;
				}
			});

			assert(choices[choices.length - 1].type !== 'separator');

			while (prototype.rows.length < 7) {
				prototype.rows.push({
					0: 3,
					1: 9,
				});
			}

			choices = prototype._getInsertRowChoices();

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

	describe('_getRemoveRowChoices', () => {
		it('returns compact layout preview where row bodies are choices', () => {
			prototype.rows = [
				{
					0: 3,
					1: 9,
				},
				{
					0: 3,
					1: 9,
				},
			];

			let choices = prototype._getRemoveRowChoices();

			let choiceValue = 0;

			_.forEach(choices, (choice, index) => {
				index = index + 1;

				if (index % 2 === 0) {
					assert.equal(choice.value, choiceValue);
					assert.equal(
						stripAnsi(choice.name),
						'  |3       |9                         |'
					);

					choiceValue++;
				}
				else {
					assert.equal(
						stripAnsi(choice.line),
						'  -------------------------------------'
					);
					assert.equal(choice.type, 'separator');
				}
			});

			assert(choices[choices.length - 1].type === 'separator');

			while (prototype.rows.length < 7) {
				prototype.rows.push({
					0: 3,
					1: 9,
				});
			}

			choices = prototype._getRemoveRowChoices();

			assert.equal(
				stripAnsi(choices[0].line),
				'  -----------------TOP-----------------'
			);
		});
	});

	describe('_getRowNumber', () => {
		it('returns next row number for labels and messages', () => {
			prototype.rows = [1, 2];

			var rowNumber = prototype._getRowNumber();

			assert.equal(rowNumber, 3);

			prototype.rowInsertIndex = 1;

			rowNumber = prototype._getRowNumber();

			assert.equal(rowNumber, 2);
		});
	});

	describe('_preprocessLayoutTemplateData', () => {
		it('converts prompt data to data that template can easily process', () => {
			var rows = [
				{
					0: 2,
					1: 10,
				},
				{
					0: 2,
					1: 1,
					2: 9,
				},
				{
					0: 12,
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

			_.forEach(rowDataFromObjects, (row) => {
				assert(_.isArray(row), 'each row is an array');

				_.forEach(row, (column) => {
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

	describe('_printLayoutPreview', () => {
		it('prints layout preview', () => {
			prototype.rows = [
				[6, 6],
				[3, 3, 6],
			];

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

	describe('_promptColumnCount', () => {
		it('prompts user for column count using correct row number in prompt message', () => {
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

	describe('_promptColumnWidths', () => {
		it('prompts user for column widths', () => {
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

			_.forEach(questions, (question, index) => {
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

	describe('_promptFinishRow', () => {
		it('prompts user for next action (add, insert, remove, finish)', () => {
			assertPromptFn(prototype, '_promptFinishRow', [[], _.noop], {
				message: 'What now?',
				name: 'finish',
			});
		});
	});

	describe('_promptInsertRow', () => {
		it('prompts user for where they want to insert row', () => {
			assertPromptFn(prototype, '_promptInsertRow', [_.noop], {
				message: 'Where would you like to insert a new row?',
				name: 'rowIndex',
			});
		});
	});

	describe('_promptRemoveRow', () => {
		it('prompts user for what row they want to remove', () => {
			assertPromptFn(prototype, '_promptRemoveRow', [_.noop], {
				message: 'What row would you like to remove?',
				name: 'rowIndex',
			});
		});
	});

	describe('_promptRow', () => {
		it('removes last row and print layout', (done) => {
			var waterfallSpy = sinon.spy();

			var getWaterfallFunction = function (name) {
				return function (data, cb) {
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

			prototype._promptRow(() => {
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

	describe('_removeRow', () => {
		it('removes row by index and print layout', () => {
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

	describe('_renderPreviewLine', () => {
		it('renders preview line', () => {
			var line = prototype._renderPreviewLine({
				0: 4,
				1: 8,
			});

			line = stripAnsi(line);

			assert.equal(line, '  |           |                       |');

			line = prototype._renderPreviewLine(
				{
					0: 4,
					1: 4,
					2: 2,
					3: 2,
				},
				{
					label: true,
				}
			);

			line = stripAnsi(line);

			assert.equal(line, '  |4          |4          |2    |2    |');
		});
	});

	describe('_renderLayoutTemplate', () => {
		it('compiles data into valid template', () => {
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

	describe('_replaceAt', () => {
		it('replaces string character at index', () => {
			assert.equal(prototype._replaceAt('string', 0, 'x'), 'xtring');
			assert.equal(prototype._replaceAt('string', 2, 'x'), 'stxing');
			assert.equal(prototype._replaceAt('string', 6, 'x'), 'stringx');
		});
	});

	describe('_stylePreviewLine', () => {
		it('passes', () => {
			expect(() => prototype._stylePreviewLine).not.toThrow();
		});
	});

	describe('_validateColumnCount', () => {
		it('validates column count', () => {
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

	args = prototype.prompt.getCall(0).args;
	const question = args[0][0];

	sinonAssert.calledWithMatch(
		prototype.prompt.getCall(0),
		sinon.match.array,
		sinon.match.func
	);

	assert.equal(question.message, assertionData.message);
	assert.equal(question.name, assertionData.name);
	assert.equal(question.type, 'list');
}
