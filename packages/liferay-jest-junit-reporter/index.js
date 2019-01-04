'use strict';

const xml = require('xml');
const fs = require('fs');

module.exports = (report) => {
  const generalMetrics = {
    _attr: {
      hostname: '',
      id: 0,
      errors: 0,
      failures: report.numFailedTests,
      name: 'Jest',
      package: '',
      skipped: 0,
      tests: report.numTotalTests,
      time: 0,
      timestamp: report.startTime
    }
  };

  let testResults = report.testResults
    .reduce((results, suite) => suite.testResults.length ? results.concat(suite.testResults) : results, [])
    .map(testCase => {
      return {
        'testcase': [{
          _attr: {
            classname: testCase.ancestorTitles[0],
            name: `${testCase.ancestorTitles.join(' ')} ${testCase.title}`,
            time: testCase.duration / 1000
          }
        }]
      };
    });

  fs.writeFileSync('TEST-frontend-js.xml', xml(
    {'testsuite': [generalMetrics, ...testResults]},
    { declaration: true, indent: '  '}
  ));

  return report;
};
