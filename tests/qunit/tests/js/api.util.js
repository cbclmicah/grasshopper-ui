/*!
 * Copyright 2015 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['gh.core', 'moment', 'gh.api.orgunit', 'gh.api.tests'], function(gh, moment, orgUnitAPI, testAPI) {
    module('Util API');

    // Mock a configuration object to test with
    require('gh.core').config = {
        "terms": {
            "2014": [
                {
                    "name": "michaelmas",
                    "label": "Michaelmas",
                    "start": "2014-10-07",
                    "end": "2014-12-05"
                },
                {
                    "name": "lent",
                    "label": "Lent",
                    "start": "2015-01-13",
                    "end": "2015-03-13"
                },
                {
                    "name": "easter",
                    "label": "Easter",
                    "start": "2015-04-21",
                    "end": "2015-06-12"
                }
            ]
        },
        'academicYear': 2014
    };


    ////////////////
    //  CALENDAR  //
    ////////////////

    // Test the 'addLeadingZero' functionality
    QUnit.test('addLeadingZero', function(assert) {
        // Verify that a digit needs to be provided
        assert.throws(function() {
            gh.utils.addLeadingZero();
        }, 'Verify that a date needs to be provided');

        // Verify that a digit needs to be provided
        assert.throws(function() {
            gh.utils.addLeadingZero('invalid_digit');
        }, 'Verify that a date needs to be provided');

        // Verify that no leading zero is added when unnecessary
        assert.strictEqual(gh.utils.addLeadingZero(10), '10', 'Verify that no leading zero is added when unnecessary');

        // Verify that a leading zero is added when necessary
        assert.strictEqual(gh.utils.addLeadingZero(1), '01', 'Verify that a leading zero is added when necessary');
    });

    // Test the 'convertISODatetoUnixDate' functionality
    QUnit.test('convertISODatetoUnixDate', function(assert) {
        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.convertISODatetoUnixDate(null);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid string should be provided
        assert.throws(function() {
            gh.utils.convertISODatetoUnixDate(9999);
        }, 'Verify that a valid string should be provided');

        // Verify that a valid date format should be provided
        assert.throws(function() {
            gh.utils.convertISODatetoUnixDate('12-3456-78');
        }, 'Verify that a valid date format should be provided');

        var date = '2014-11-28T10:50:49.000Z';
        var convertedDate = gh.utils.convertISODatetoUnixDate(date);

        // Verify that the date is converted correctly
        assert.strictEqual(convertedDate, 1417171849000, 'Verify that the date is converted correctly');
    });

    // Test the 'convertUnixDatetoISODate' functionality
    QUnit.test('convertUnixDatetoISODate', function(assert) {
        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.convertUnixDatetoISODate(null);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid numeric date should be provided
        assert.throws(function() {
            gh.utils.convertUnixDatetoISODate('invalid_date');
        }, 'Verify that a valid numeric date should be provided');

        var date = 1417171849000;
        var convertedDate = gh.utils.convertUnixDatetoISODate(date);

        // Verify that the date is converted correctly
        assert.strictEqual(convertedDate, '2014-11-28T10:50:49+00:00', 'Verify that the date is converted correctly');
    });

    // Test the 'generateDisplayDate' functionality
    QUnit.test('generateDisplayDate', function(assert) {
        var startDate = '2015-02-18T10:00:00.000Z';
        var endDate = '2015-02-18T17:30:00.000Z';

        // Verify that a start date needs to be provided
        assert.throws(function() {
            gh.utils.generateDisplayDate(null, endDate);
        }, 'Verify that a start date needs to be provided');

        // Verify that a valid start date needs to be provided
        assert.throws(function() {
            gh.utils.generateDisplayDate(99999, endDate);
        }, 'Verify that a valid start date needs to be provided');

        // Verify that a valid start date needs to be provided
        assert.throws(function() {
            gh.utils.generateDisplayDate('invalid_start_date', endDate);
        }, 'Verify that a valid start date needs to be provided');

        // Verify that an and date needs to be provided
        assert.throws(function() {
            gh.utils.generateDisplayDate(startDate, null);
        }, 'Verify that an end date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.generateDisplayDate(startDate, 99999);
        }, 'Verify that a valid end date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.generateDisplayDate(startDate, 'invalid_end_date');
        }, 'Verify that a valid end date needs to be provided');

        // Verify that all the cases are covered
        assert.strictEqual(gh.utils.generateDisplayDate('2015-02-18T10:00:00.000Z', '2015-02-18T17:30:00.000Z'), 'W5 · Wed 10am-5:30pm');
        assert.strictEqual(gh.utils.generateDisplayDate('2015-02-18T16:00:00.000Z', '2015-02-18T17:30:00.000Z'), 'W5 · Wed 4-5:30pm');
        assert.strictEqual(gh.utils.generateDisplayDate('2015-02-18T10:00:00.000Z', '2015-02-18T11:30:00.000Z'), 'W5 · Wed 10-11:30am');
        assert.strictEqual(gh.utils.generateDisplayDate('2015-02-18T10:30:00.000Z', '2015-02-18T11:00:00.000Z'), 'W5 · Wed 10:30-11am');
        assert.strictEqual(gh.utils.generateDisplayDate('2015-02-18T10:30:00.000Z', '2015-02-18T13:30:00.000Z'), 'W5 · Wed 10:30am-1:30pm');
        assert.strictEqual(gh.utils.generateDisplayDate('2015-01-01T10:30:00.000Z', '2015-01-01T13:30:00.000Z'), 'OT · Thu 10:30am-1:30pm');
    });

    // Test the 'getAcademicWeekNumber' functionality
    QUnit.test('getAcademicWeekNumber', function(assert) {

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.getAcademicWeekNumber();
        }, 'Verify that a date needs to be provided');

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.getAcademicWeekNumber('invalid_date');
        }, 'Verify that a valid date needs to be provided');

        // Verify that no week number is returned when specifying an out-of-term date
        var weekNumber = gh.utils.getAcademicWeekNumber(gh.utils.convertISODatetoUnixDate('2015-01-01T12:30:00.000Z'));
        assert.strictEqual(weekNumber, 0, 'Verify that no week number is returned when specifying an out-of-term date');

        // Verify that a valid week number is returned when specifying an in-term date
        weekNumber = gh.utils.getAcademicWeekNumber(gh.utils.convertISODatetoUnixDate('2015-01-14T10:30:00.000Z'));
        assert.strictEqual(weekNumber, 0, 'Verify that a valid week number is returned when specifying an in-term date');

        // Verify that a valid week number is returned when specifying an in-term date
        weekNumber = gh.utils.getAcademicWeekNumber(gh.utils.convertISODatetoUnixDate('2015-01-15T10:30:00.000Z'));
        assert.strictEqual(weekNumber, 1, 'Verify that a valid week number is returned when specifying an in-term date');
    });

    // Test the 'getTerm' functionality
    QUnit.test('getTerm', function(assert) {

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.getTerm();
        }, 'Verify that a date needs to be provided');

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.getTerm('invalid_date');
        }, 'Verify that a valid date needs to be provided');

        // Verify that the corresponding term is returned when specifying an in-term date
        var term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate('2015-02-01T10:30:00.000Z'));
        assert.strictEqual(term.name, 'lent', 'Verify that the corresponding term is returned');

        // Verify that no term is returned when specifying an out-of-term date that leans close to the start of a term
        term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate('2015-01-11T00:00:00.000Z'));
        assert.ok(!term);

        // Verify that no term is returned when specifying an out-of-term date
        term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate('2015-01-01T10:30:00.000Z'));
        assert.ok(!term);

        // Verify the correct term is returned when the first day of term is passed in
        term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate('2014-10-09T10:00:00.000Z'));
        assert.ok(term);
        assert.strictEqual(term.name, 'michaelmas', 'Verify that the corresponding term is returned');

        // Verify the correct term is returned when the last day of term is passed in
        term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate('2014-12-03T10:00:00.000Z'));
        assert.ok(term);
        assert.strictEqual(term.name, 'michaelmas', 'Verify that the corresponding term is returned');

        // Verify no term is returned when the day before term starts is passed in
        term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate('2014-10-08T10:00:00.000Z'));
        assert.ok(!term);

        // Verify no term is returned when the day after term ends is passed in
        term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate('2014-12-04T10:00:00.000Z'));
        assert.ok(!term);
    });

    // Test the 'getWeeksInTerm' functionality
    QUnit.test('getWeeksInTerm', function(assert) {
        // Verify that a valid term needs to be provided
        assert.throws(function() {
            gh.utils.getWeeksInTerm();
        }, 'Verify that a valid term needs to be provided');

        // Verify that the correct number of weeks is returned
        assert.strictEqual(gh.utils.getWeeksInTerm(require('gh.core').config.terms['2014'][0]), 8, 'Verify that the correct number of weeks is returned');
        assert.strictEqual(gh.utils.getWeeksInTerm(require('gh.core').config.terms['2014'][1]), 8, 'Verify that the correct number of weeks is returned');
        assert.strictEqual(gh.utils.getWeeksInTerm(require('gh.core').config.terms['2014'][2]), 7, 'Verify that the correct number of weeks is returned');
    });

    // Test the 'getFirstLectureDayOfTerm' functionality
    QUnit.test('getFirstLectureDayOfTerm', function(assert) {
        // Verify that a valid term name needs to be provided
        assert.throws(function() {
            gh.utils.getFirstLectureDayOfTerm(null);
        }, 'Verify that a valid term name needs to be provided');

        // Use the first day of Michaelmas to test with
        var expectedDate = moment('2014-10-09', 'YYYY-MM-DD');
        var firstLectureDay = moment(gh.utils.getFirstLectureDayOfTerm('michaelmas'), 'YYYY-MM-DD');
        assert.strictEqual(firstLectureDay.format('DD'), expectedDate.format('DD'), 'Verify that the correct day is returned');
        assert.strictEqual(firstLectureDay.format('MM'), expectedDate.format('MM'), 'Verify that the correct month is returned');
        assert.strictEqual(firstLectureDay.format('YYYY'), expectedDate.format('YYYY'), 'Verify that the correct year is returned');
    });

    // Test the 'getDateByWeekAndDay' functionality
    QUnit.test('getDateByWeekAndDay', function(assert) {
        // Verify that a valid term name needs to be provided
        assert.throws(function() {
            gh.utils.getDateByWeekAndDay(null, 1, 1);
        }, 'Verify that a valid term name needs to be provided');

        // Verify that a valid week number needs to be provided
        assert.throws(function() {
            gh.utils.getDateByWeekAndDay('michaelmas', null, 1);
        }, 'Verify that a valid term name needs to be provided');

        // Verify that a valid day number needs to be provided
        assert.throws(function() {
            gh.utils.getDateByWeekAndDay('michaelmas', 1, null);
        }, 'Verify that a valid term name needs to be provided');

        // Perform a few manual assertions, both before and after DST
        // The following object holds the first 4 weeks of the Michaelmas term. Each inner object
        // maps the day of the week (1=Monday, 2=Tuesday, ..) to the expected date for that termweek
        var michaelmasDates = {
            '1': {
                '4': new Date('Thu Oct 09 2014 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri Oct 10 2014 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat Oct 11 2014 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun Oct 12 2014 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon Oct 13 2014 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue Oct 14 2014 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed Oct 15 2014 00:00:00 GMT+0100 (BST)')
            },
            '2': {
                '4': new Date('Thu Oct 16 2014 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri Oct 17 2014 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat Oct 18 2014 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun Oct 19 2014 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon Oct 20 2014 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue Oct 21 2014 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed Oct 22 2014 00:00:00 GMT+0100 (BST)')
            },
            '3': {
                '4': new Date('Thu Oct 23 2014 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri Oct 24 2014 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat Oct 25 2014 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun Oct 26 2014 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon Oct 27 2014 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Oct 28 2014 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Oct 29 2014 00:00:00 GMT+0000 (GMT)')
            },
            '4': {
                '4': new Date('Thu Oct 30 2014 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Oct 31 2014 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Nov 01 2014 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Nov 02 2014 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Nov 03 2014 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Nov 04 2014 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Nov 05 2014 00:00:00 GMT+0000 (GMT)')
            }
        };
        checkDateByWeekAndDay(michaelmasDates, 'michaelmas');

        var lentDates = {
            '1': {
                '4': new Date('Thu Jan 15 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Jan 16 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Jan 17 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Jan 18 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Jan 19 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Jan 20 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Jan 21 2015 00:00:00 GMT+0000 (GMT)')
            },
            '2': {
                '4': new Date('Thu Jan 22 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Jan 23 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Jan 24 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Jan 25 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Jan 26 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Jan 27 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Jan 28 2015 00:00:00 GMT+0000 (GMT)')
            },
            '3': {
                '4': new Date('Thu Jan 29 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Jan 30 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Jan 31 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Feb 01 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Feb 02 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Feb 03 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Feb 04 2015 00:00:00 GMT+0000 (GMT)')
            },
            '4': {
                '4': new Date('Thu Feb 05 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Feb 06 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Feb 07 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Feb 08 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Feb 09 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Feb 10 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Feb 11 2015 00:00:00 GMT+0000 (GMT)')
            },
            '5': {
                '4': new Date('Thu Feb 12 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Feb 13 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Feb 14 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Feb 15 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Feb 16 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Feb 17 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Feb 18 2015 00:00:00 GMT+0000 (GMT)')
            },
            '6': {
                '4': new Date('Thu Feb 19 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Feb 20 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Feb 21 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Feb 22 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Feb 23 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Feb 24 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Feb 25 2015 00:00:00 GMT+0000 (GMT)')
            },
            '7': {
                '4': new Date('Thu Feb 26 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Feb 27 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Feb 28 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Mar 01 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Mar 02 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Mar 03 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Mar 04 2015 00:00:00 GMT+0000 (GMT)')
            },
            '8': {
                '4': new Date('Thu Mar 05 2015 00:00:00 GMT+0000 (GMT)'),
                '5': new Date('Fri Mar 06 2015 00:00:00 GMT+0000 (GMT)'),
                '6': new Date('Sat Mar 07 2015 00:00:00 GMT+0000 (GMT)'),
                '7': new Date('Sun Mar 08 2015 00:00:00 GMT+0000 (GMT)'),
                '1': new Date('Mon Mar 09 2015 00:00:00 GMT+0000 (GMT)'),
                '2': new Date('Tue Mar 10 2015 00:00:00 GMT+0000 (GMT)'),
                '3': new Date('Wed Mar 11 2015 00:00:00 GMT+0000 (GMT)')
            }
        };
        checkDateByWeekAndDay(lentDates, 'lent');

        var easterDates = {
            '1': {
                '4': new Date('Thu Apr 23 2015 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri Apr 24 2015 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat Apr 25 2015 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun Apr 26 2015 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon Apr 27 2015 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue Apr 28 2015 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed Apr 29 2015 00:00:00 GMT+0100 (BST)')
            },
            '2': {
                '4': new Date('Thu Apr 30 2015 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri May 01 2015 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat May 02 2015 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun May 03 2015 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon May 04 2015 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue May 05 2015 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed May 06 2015 00:00:00 GMT+0100 (BST)')
            },
            '3': {
                '4': new Date('Thu May 07 2015 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri May 08 2015 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat May 09 2015 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun May 10 2015 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon May 11 2015 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue May 12 2015 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed May 13 2015 00:00:00 GMT+0100 (BST)')
            },
            '4': {
                '4': new Date('Thu May 14 2015 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri May 15 2015 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat May 16 2015 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun May 17 2015 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon May 18 2015 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue May 19 2015 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed May 20 2015 00:00:00 GMT+0100 (BST)')
            },
            '5': {
                '4': new Date('Thu May 21 2015 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri May 22 2015 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat May 23 2015 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun May 24 2015 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon May 25 2015 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue May 26 2015 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed May 27 2015 00:00:00 GMT+0100 (BST)')
            },
            '6': {
                '4': new Date('Thu May 28 2015 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri May 29 2015 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat May 30 2015 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun May 31 2015 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon Jun 01 2015 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue Jun 02 2015 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed Jun 03 2015 00:00:00 GMT+0100 (BST)')
            },
            '7': {
                '4': new Date('Thu Jun 04 2015 00:00:00 GMT+0100 (BST)'),
                '5': new Date('Fri Jun 05 2015 00:00:00 GMT+0100 (BST)'),
                '6': new Date('Sat Jun 06 2015 00:00:00 GMT+0100 (BST)'),
                '7': new Date('Sun Jun 07 2015 00:00:00 GMT+0100 (BST)'),
                '1': new Date('Mon Jun 08 2015 00:00:00 GMT+0100 (BST)'),
                '2': new Date('Tue Jun 09 2015 00:00:00 GMT+0100 (BST)'),
                '3': new Date('Wed Jun 10 2015 00:00:00 GMT+0100 (BST)')
            }
        };
        checkDateByWeekAndDay(easterDates, 'easter');

        function checkDateByWeekAndDay(testDates, termName) {
            _.each(testDates, function(days, week) {
                week = parseInt(week, 10);
                _.each(days, function(expectedDate, dayOfTheWeek){
                    dayOfTheWeek = parseInt(dayOfTheWeek, 10);
                    var date = gh.utils.getDateByWeekAndDay(termName, week, dayOfTheWeek);
                    assert.strictEqual(date.getTime(), expectedDate.getTime(), 'Verify week ' + week + ' day ' + dayOfTheWeek + ' in ' + termName + ' returns the correct time');
                });
            });
        }
    });

    // Test the 'dateDisplay' functionality
    QUnit.test('dateDisplay', function(assert) {
        var date = '2015-02-18T16:00:00.000Z';

        /* DAY */

        /* Day name */

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay(null).dayName();
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay(9999).dayName();
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay('invalid_date').dayName();
        }, 'Verify that a valid date needs to be provided');

        // Verify that the corret day name is returned
        assert.strictEqual(gh.utils.dateDisplay(date).dayName(), 'Wed', 'Verify that the correct day name is returned');

        /* Day number */

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay(null).dayNumber();
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay(9999).dayNumber();
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay('invalid_date').dayNumber();
        }, 'Verify that a valid date needs to be provided');

        // Verify that the corret day is returned
        assert.strictEqual(gh.utils.dateDisplay(date).dayNumber(), 18, 'Verify that the correct day is returned');

        /* MONTH */

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay(null).monthName();
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay(9999).monthName();
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.dateDisplay('invalid_date').monthName();
        }, 'Verify that a valid date needs to be provided');

        // Verify that the correct month is returned
        assert.strictEqual(gh.utils.dateDisplay(date).monthName(), 'Feb', 'Verify that the correct month is returned');
    });

    // Test the 'fixDateToGMT' functionality
    QUnit.test('fixDateToGMT', function(assert) {

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.fixDateToGMT();
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.fixDateToGMT(9999);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.fixDateToGMT('invalid_date');
        }, 'Verify that a valid date needs to be provided');

        // Verify that a correct date is returned when a GMT+0 date is specified
        assert.strictEqual(gh.utils.fixDateToGMT('2015-02-11T16:00:00.000Z').format(), '2015-02-11T16:00:00+00:00', 'Verify that a correct date is returned when a GMT+0 is specified');

        // Verify that a correct date is returned when a GMT+1 (BST) date is specified
        assert.strictEqual(gh.utils.fixDateToGMT('2014-10-07T10:00:00.000Z').format(), '2014-10-07T11:00:00+01:00', 'Verify that a correct date is returned when a BST+1 is specified');
    });

    // Test the 'fixDatesToGMT' functionality
    QUnit.test('fixDatesToGMT', function(assert) {

        // Verify that an array needs to be provided
        assert.throws(function() {
            gh.utils.fixDatesToGMT();
        }, 'Verify that an array needs to be provided');

        // Verify that a valid parameter needs to be provided
        assert.throws(function() {
            gh.utils.fixDatesToGMT('invalid_parameter');
        }, 'Verify that a valid parameter needs to be provided');

        // Convert some test event dates
        var events = [{
            'start': '2015-02-11T16:00:00.000Z',
            'end': '2014-10-07T10:00:00.000Z'
        }];
        gh.utils.fixDatesToGMT(events);

        // Verify that the dates have been successfully converted
        assert.strictEqual(events[0].start.format(), '2015-02-11T16:00:00+00:00', 'Verify that the start date has been converted successfully');
        assert.strictEqual(events[0].end.format(), '2014-10-07T11:00:00+01:00', 'Verify that the end date has been converted successfully');
    });

    // Test the 'isDateInRange' functionality
    QUnit.test('isDateInRange', function(assert) {

        var date = Date.now();
        var startDate = Date.now() - (60 * 60 * 24 * 7);
        var endDate = Date.now() + (60 * 60 * 24 * 7);

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.utils.isDateInRange(null, startDate, endDate);
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.utils.isDateInRange('invalid_date', startDate, endDate);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a startDate needs to be provided
        assert.throws(function() {
            gh.utils.isDateInRange(date, null, endDate);
        }, 'Verify that a startDate needs to be provided');

        // Verify that a valid startDate needs to be provided
        assert.throws(function() {
            gh.utils.isDateInRange(date, 'invalid_date', endDate);
        }, 'Verify that a valid startDate needs to be provided');

        // Verify that a endDate needs to be provided
        assert.throws(function() {
            gh.utils.isDateInRange(date, startDate, null);
        }, 'Verify that an endDate needs to be provided');

        // Verify that a valid endDate needs to be provided
        assert.throws(function() {
            gh.utils.isDateInRange(date, startDate, 'invalid_date');
        }, 'Verify that a valid endDate needs to be provided');

        // Verify that en error is thrown when the startDate is after the endDate
        assert.throws(function() {
            gh.utils.isDateInRange(date, endDate, startDate);
        }, 'Verify that en error is thrown when the startDate is after the endDate');

        // Verify that true is returned when a date is within a range of dates
        assert.ok(gh.utils.isDateInRange(date, startDate, endDate));

        // Verify that false is returned when a date is outside a range of dates
        assert.ok(!gh.utils.isDateInRange(startDate, date, endDate));
    });

    // Test the 'weeksInDateRange' functionality
    QUnit.test('weeksInDateRange', function(assert) {

        var startDate = Date.now() - (60 * 60 * 24 * 7);
        var endDate = Date.now() + (60 * 60 * 24 * 7);

        // Verify that a startDate needs to be provided
        assert.throws(function() {
            gh.utils.weeksInDateRange(null, endDate);
        }, 'Verify that a startDate needs to be provided');

        // Verify that a valid startDate needs to be provided
        assert.throws(function() {
            gh.utils.weeksInDateRange('invalid_date', endDate);
        }, 'Verify that a valid startDate needs to be provided');

        // Verify that an endDate needs to be provided
        assert.throws(function() {
            gh.utils.weeksInDateRange(startDate, null);
        }, 'Verify that an endDate needs to be provided');

        // Verify that a valid endDate needs to be provided
        assert.throws(function() {
            gh.utils.weeksInDateRange(startDate, 'invalid_date');
        }, 'Verify that a valid endDate needs to be provided');

        // Verify that en error is thrown when the startDate is after the endDate
        assert.throws(function() {
            gh.utils.weeksInDateRange(endDate, startDate);
        }, 'Verify that en error is thrown when the startDate is after the endDate');

        // Verify that the correct number of weeks are returned
        var numWeeks = gh.utils.weeksInDateRange(startDate, endDate);
        assert.equal(2, numWeeks);
    });

    // Test the 'orderEventsByTerm' functionality
    QUnit.test('orderEventsByTerm', function(assert) {
        expect(17);

        // Verify that an error is thrown when no events were provided
        assert.throws(function() {
            gh.utils.orderEventsByTerm();
        }, 'Verify that an error is thrown when no terms were provided');

        // Verify that an error is thrown when an invalid value for events was provided
        assert.throws(function() {
            gh.utils.orderEventsByTerm('invalid_value');
        }, 'Verify that an error is thrown when an invalid value for events was provided');

        // Split the events by term
        var splitEvents = gh.utils.splitEventsByTerm({
            "results": [

                // OT before Michaelmas
                {
                    "end": "2014-10-06T14:00:00.000Z",
                    "start": "2014-10-06T13:00:00.000Z"
                },

                // Michaelmas
                {
                    "end": "2014-10-07T14:00:00.000Z",
                    "start": "2014-10-07T13:00:00.000Z"
                },
                {
                    "end": "2014-12-05T14:00:00.000Z",
                    "start": "2014-12-05T13:00:00.000Z"
                },

                // OT after Michaelmas, before Lent
                {
                    "end": "2015-01-06T14:00:00.000Z",
                    "start": "2015-01-06T13:00:00.000Z"
                },

                // Lent
                {
                    "end": "2015-01-13T11:00:00.000Z",
                    "start": "2015-01-13T10:00:00.000Z"
                },
                {
                    "end": "2015-03-13T11:00:00.000Z",
                    "start": "2015-03-13T10:00:00.000Z"
                },

                // OT after Left, before Easter
                {
                    "end": "2015-03-30T14:00:00.000Z",
                    "start": "2015-03-30T13:00:00.000Z"
                },

                // Easter
                {
                    "end": "2015-04-21T14:00:00.000Z",
                    "start": "2015-04-21T13:00:00.000Z"
                },
                {
                    "end": "2015-06-12T14:00:00.000Z",
                    "start": "2015-06-12T13:00:00.000Z"
                },

                // OT after Easter
                {
                    "end": "2015-06-13T14:00:00.000Z",
                    "start": "2015-06-13T13:00:00.000Z"
                }
            ]
        });

        // Order the events
        var eventsByTerm = gh.utils.orderEventsByTerm(splitEvents);

        // Verify that the events are returned in a correct order
        assert.strictEqual(eventsByTerm.length, 7, 'Verify that the events are returned in a correct order');
        assert.strictEqual(eventsByTerm[0].name, 'OT');
        assert.strictEqual(eventsByTerm[0].events.length, 1);
        assert.strictEqual(eventsByTerm[1].name, 'Michaelmas');
        assert.strictEqual(eventsByTerm[1].events.length, 2);
        assert.strictEqual(eventsByTerm[2].name, 'OT');
        assert.strictEqual(eventsByTerm[2].events.length, 1);
        assert.strictEqual(eventsByTerm[3].name, 'Lent');
        assert.strictEqual(eventsByTerm[3].events.length, 2);
        assert.strictEqual(eventsByTerm[4].name, 'OT');
        assert.strictEqual(eventsByTerm[4].events.length, 1);
        assert.strictEqual(eventsByTerm[5].name, 'Easter');
        assert.strictEqual(eventsByTerm[5].events.length, 2);
        assert.strictEqual(eventsByTerm[6].name, 'OT');
        assert.strictEqual(eventsByTerm[6].events.length, 1);
    });

    // Test the 'splitEventsByTerm' functionality
    QUnit.test('splitEventsByTerm', function(assert) {
        expect(7);

        // Verify that an error is thrown when no events were provided
        assert.throws(function() {
            gh.utils.splitEventsByTerm();
        }, 'Verify that an error is thrown when no events were provided');

        // Verify that an error is thrown when an invalid value for events was provided
        assert.throws(function() {
            gh.utils.splitEventsByTerm('invalid_value');
        }, 'Verify that an error is thrown when an invalid value for events was provided');

        // Mock an Array of events to test with
        var events = {
            "results": [
                // Michaelmas
                {
                    "end": "2014-10-07T14:00:00.000Z",
                    "start": "2014-10-07T13:00:00.000Z"
                },
                {
                    "end": "2014-12-05T12:45:00.000Z",
                    "start": "2014-12-05T11:15:00.000Z"
                },

                // Lent
                {
                    "end": "2015-01-13T11:00:00.000Z",
                    "start": "2015-01-13T10:00:00.000Z"
                },
                {
                    "end": "2015-03-13T16:45:00.000Z",
                    "start": "2015-03-13T14:15:00.000Z"
                },

                // Easter
                {
                    "end": "2015-04-21T:14:00.000Z",
                    "start": "2015-04-21T13:00:00.000Z"
                },
                {
                    "end": "2015-06-12T15:30:00.000Z",
                    "start": "2015-06-12T14:30:00.000Z"
                },

                // Out of term
                {
                    "end": "2015-12-13T13:00:00.000Z",
                    "start": "2015-12-13T11:00:00.000Z"
                },
                {
                    "end": "2015-03-14T14:00:00.000Z",
                    "start": "2015-03-14T13:00:00.000Z"
                },
                {
                    "end": "2015-06-13T14:00:00.000Z",
                    "start": "2015-06-13T13:00:00.000Z"
                }
            ]
        };

        // Split the events by term
        var eventsByTerm = gh.utils.splitEventsByTerm(events);

        // Verify that the returning events were correctly split by term
        assert.ok(eventsByTerm, 'Verify that events can be successfully split by term');
        assert.equal(eventsByTerm['Michaelmas'].events.length, 2, 'Verify that 2 events were triaged into Michaelmas');
        assert.equal(eventsByTerm['Lent'].events.length, 2, 'Verify that 2 events were triaged into Lent');
        assert.equal(eventsByTerm['Easter'].events.length, 2, 'Verify that 2 events were triaged into Easter');
        assert.equal(eventsByTerm['OT'].events.length, 3, 'Verify that 3 event were triaged into OT');
    });


    ///////////////
    //  GENERAL  //
    ///////////////

    // Test the 'setDocumentTitle' functionality
    QUnit.test('setDocumentTitle', function(assert) {
        // Verify that only string values are allowed as a parameter
        assert.throws(function() {
            gh.utils.setDocumentTitle(123);
        }, 'Verify that only string values are allowed as a parameter');

        // Verify that the document title can be set
        gh.utils.setDocumentTitle('QUnit Test');
        assert.equal(document.title, 'My Timetable QUnit Test', 'Verify that the document title can be set');
    });

    // Test the 'generateRandomString' functionality
    QUnit.test('generateRandomString', function(assert) {

        // Verify that only boolean values are allowed as a parameter
        assert.throws(function() {
            gh.utils.generateRandomString('invalid_value');
        }, 'Verify that only boolean values are allowed as a parameter');

        // Verify that the returned string has exactly 10 characters
        assert.strictEqual(gh.utils.generateRandomString().length, 10, 'Verify that the returned string has exactly 10 characters');

        // Verify that the returned string does not contain any uppercase characters when lowercase is specified
        assert.ok((/^[a-z0-9]*$/).test(gh.utils.generateRandomString(true)));

        // Verify that the returned string contains uppercase and/or lowercase characters when lowercase is not specified
        assert.ok((/[A-Z0-9]/g).test(gh.utils.generateRandomString()));
    });

    // Test the 'validateExternalURL' functionality
    QUnit.test('validateExternalURL', function(assert) {

        // Verify that an error is thrown when no url was provided
        assert.throws(function() {
            gh.utils.validateExternalURL();
        }, 'Verify that an error is thrown when no url was provided');

        // Verify that an error is thrown when an invalid url was provided
        assert.throws(function() {
            gh.utils.validateExternalURL(999);
        }, 'Verify that an error is thrown when an invalid url was provided');

        // Verify that a valid url doesn't get prepended with another protocol
        assert.strictEqual(gh.utils.validateExternalURL('http://google.be'), 'http://google.be');

        // Verify that an invalid url is prepended with a protocol
        assert.strictEqual(gh.utils.validateExternalURL('www.google.be'), 'http://www.google.be');

        // Verify that an invalid url is prepended with a protocol
        assert.strictEqual(gh.utils.validateExternalURL('google.be'), 'http://google.be');
    });

    // Test the 'mockRequest' functionality
    QUnit.asyncTest('mockRequest', function(assert) {
        expect(9);

        // The mock request values
        var type = 'GET';
        var url = '/api/mockrequest';

        // The mock response values
        var body = {'code': 400, 'msg': 'Bad Request'};
        var headers = {'Content-Type': 'application/json'};
        var statusCode = 400;

        // Create a mock function
        var mockFunc = function() {};

        // Verify that an error is thrown when no type was provided
        assert.throws(function() {
            gh.utils.mockRequest(null, url, statusCode, headers, body, mockFunc);
        }, 'Verify that an error is thrown when no type was provided');

        // Verify that an error is thrown when no url was provided
        assert.throws(function() {
            gh.utils.mockRequest(type, null, statusCode, headers, body, mockFunc);
        }, 'Verify that an error is thrown when no url was provided');

        // Verify that an error is thrown when no statusCode was provided
        assert.throws(function() {
            gh.utils.mockRequest(type, url, null, headers, body, mockFunc);
        }, 'Verify that an error is thrown when no statusCode was provided');

        // Verify that an error is thrown when no headers were provided
        assert.throws(function() {
            gh.utils.mockRequest(type, url, statusCode, null, body, mockFunc);
        }, 'Verify that an error is thrown when no headers were provided');

        // Verify that an error is thrown when no body was provided
        assert.throws(function() {
            gh.utils.mockRequest(type, url, statusCode, headers, null, mockFunc);
        }, 'Verify that an error is thrown when no body was provided');

        // Verify that an error is thrown when no function was provided
        assert.throws(function() {
            gh.utils.mockRequest(type, url, statusCode, headers, body, null);
        }, 'Verify that an error is thrown when no function was provided');

        // Verify that a request can be successfully mocked
        gh.utils.mockRequest(type, url, statusCode, headers, body, function() {
            $.ajax({
                'type': type,
                'url': url,
                'success': function(data) {
                    assert.fail('The success function should not be invoked');
                },
                'error': function(jqXHR, textStatus) {
                    assert.strictEqual(jqXHR.status, 400);
                    assert.strictEqual(jqXHR.responseJSON.code, 400);
                    assert.strictEqual(jqXHR.responseJSON.msg, 'Bad Request');
                }
            });

            QUnit.start();
        });
    });

    // Test the 'sortByDisplayName' functionality
    QUnit.test('sortByDisplayName', function(assert) {
        var testArr = [{
            'displayName': 'ZZZ'
        }, {
            'displayName': '1234'
        }, {
            'displayName': 'aaa'
        }, {
            'displayName': 'a1z2'
        }, {
            'displayName': 'aaa'
        }];

        testArr.sort(gh.utils.sortByDisplayName);

        var sorted1 = testArr[0].displayName === '1234';
        var sorted2 = testArr[1].displayName === 'a1z2';
        var sorted3 = testArr[2].displayName === 'aaa';
        var sorted4 = testArr[3].displayName === 'aaa';
        var sorted5 = testArr[4].displayName === 'ZZZ';

        assert.ok(sorted1 && sorted2 && sorted3 && sorted4 && sorted5, 'Verify that the Array of objects is properly sorted on the displayName property');
    });

    // Test the 'sortByHost' functionality
    QUnit.test('sortByHost', function(assert) {
        var testArr = [{
            'host': 'ZZZ'
        }, {
            'host': '1234'
        }, {
            'host': 'aaa'
        }, {
            'host': 'a1z2'
        }, {
            'host': 'aaa'
        }];

        testArr.sort(gh.utils.sortByHost);

        var sorted1 = testArr[0].host === '1234';
        var sorted2 = testArr[1].host === 'a1z2';
        var sorted3 = testArr[2].host === 'aaa';
        var sorted4 = testArr[3].host === 'aaa';
        var sorted5 = testArr[4].host === 'ZZZ';

        assert.ok(sorted1 && sorted2 && sorted3 && sorted4 && sorted5, 'Verify that the Array of objects is properly sorted on the host property');
    });


    ///////////////////
    // LOCAL STORAGE //
    ///////////////////

    // Test the 'get' functionality
    QUnit.test('get', function(assert) {

        // Stora a local test value
        gh.utils.localDataStorage().store('foo', 'bar');

        // Verify that an error is thrown when no key was provided
        assert.throws(function() {
            gh.utils.localDataStorage().get();
        });

        // Verify that an error is thrown when an invalid key was provided
        assert.throws(function() {
            gh.utils.localDataStorage().get({'invalid': 'value'});
        });

        // Verify that a value can be retrieved successfully
        assert.strictEqual('bar', gh.utils.localDataStorage().get('foo'));
    });

    // Test the 'remove' functionality
    QUnit.test('remove', function(assert) {

        // Stora a local test value
        gh.utils.localDataStorage().store('some_crazy_key', 'some_crazy_value');

        // Verify that an error is thrown when no key was provided
        assert.throws(function() {
            gh.utils.localDataStorage().remove();
        }, 'Verify that an error is thrown when no key was provided');

        // Verify that an error is thrown when an invalid value for key was provided
        assert.throws(function() {
            gh.utils.localDataStorage().remove({'invalid': 'value'});
        }, 'Verify that an error is thrown when an invalid value for \'key\' was provided');

        // Verify that an entry can be removed without errors
        assert.ok('undefined', gh.utils.localDataStorage().remove('some_crazy_key'), 'Verify that an entry can be removed without errors');
    });

    // Test the 'store' functionality
    QUnit.test('store', function(assert) {

        // Verify that an error is thrown when no key was provided
        assert.throws(function() {
            gh.utils.localDataStorage().store(null, 'bar');
        }, 'Verify that an error is thrown when no key was provided');

        // Verify that an error is thrown when an invalid value was provided
        assert.throws(function() {
            var foo = {};
            foo.bar = foo;
            gh.utils.localDataStorage().store('some_key', foo);
        }, 'Verify that an error is thrown when an invalid value was provided');

        // Verify that a value can be stored locally
        assert.ok('undefined', gh.utils.localDataStorage().store('some_key', 'bar'), 'Verify that a value can be stored locally');
    });


    ///////////////////
    // NOTIFICATIONS //
    ///////////////////

    // Test the 'notification' functionality
    QUnit.test('notification', function(assert) {
        // Verify that a message for the notification needs to be provided
        assert.throws(function() {
            gh.utils.notification(null, 'msg', function() {});
        }, 'Verify that a title for the notification needs to be provided');

        // Verify that a notification can be triggered with only a message
        assert.ok(gh.utils.notification('Notification title', null), 'Verify that a notification can be triggered with only a title');

        // Verify that a notification can be triggered with a title and a message
        assert.ok(gh.utils.notification('Notification title', 'Notification message'), 'Verify that a notification can be triggered with a title and a message');

        // Verify that a notification can be triggered with a title, a message and an ID
        assert.ok(gh.utils.notification('Notification title', 'Notification message', 'info', 'test-message'), 'Verify that a notification can be triggered with a title, a message and an ID');

        // Verify that a notification with the same ID can't be triggered
        assert.ok(!gh.utils.notification('Notification title', 'Notification message', 'info', 'test-message'), 'Verify that a notification with the same ID can\'t be triggered');

        // Verify that a notification with the same ID won't be shown twice
        assert.ok($('#test-message').length === 1, 'Verify that a notification with the same ID won\'t be shown twice');
    });


    /////////////////
    //  TEMPLATES  //
    /////////////////

    // Test the 'renderTemplate' functionality
    QUnit.asyncTest('renderTemplate', function(assert) {
        expect(6);

        // Add a template to the page
        $('body').append('<script id="qunit-template" type="text/template">Hi, <%- name %></script>');
        // Create the data to use in the template
        var templateData = {
            'name': 'Mathieu'
        };
        // Add a target container to the page
        $('body').append('<div id="qunit-template-target" style="display: none;"></div>');

        // Verify that a template needs to be provided
        assert.throws(function() {
            gh.utils.renderTemplate(null, templateData, $('#qunit-template-target'));
        }, 'Verify that a template needs to be provided');

        // Verify that a data needs to be provided in the form of an object
        assert.throws(function() {
            gh.utils.renderTemplate('qunit-basic-test', 'incorrect template data', $('#qunit-template-target'));
        }, 'Verify that data needs to be provided in the form of an object');

        // Verify that a $target needs to be provided in the form of an object
        assert.throws(function() {
            gh.utils.renderTemplate('qunit-basic-test', null, 1);
        }, 'Verify that a $target needs to be provided in the form of an object or string');

        // Verify that template data is optional
        gh.utils.renderTemplate('qunit-basic-test', null, $('#qunit-template-target'), function(template) {
            assert.ok(template, 'Verify that template data is optional');

            // Verify that the template renders in the target container
            gh.utils.renderTemplate('qunit-basic-test', templateData, $('#qunit-template-target'));
            assert.equal($('#qunit-template-target').text().trim(), 'Hi, Mathieu.', 'Verify the template HTML is rendered in the target container when specified');

            // Verify that the rendered HTML is returned when no target is specified
            var returnedHTML = gh.utils.renderTemplate('qunit-basic-test', templateData);
            assert.equal(returnedHTML.trim(), 'Hi, Mathieu.', 'Verify the rendered HTML returns when no target container is specified');

            QUnit.start();
        });
    });

    // Test the 'RenderTemplate - Partials' functionality
    QUnit.asyncTest('renderTemplate - Partials', function(assert) {
        expect(2);
        // Append a container to the body to render the template in
        $('body').append('<div id="qunit-partial-test-container" style="display: none;"></div>');
        // Create the data to use in the template
        var data = {
            'data': {
                'gh': gh
            }
        };
        // Verify that the template renders in the target container
        gh.utils.renderTemplate('qunit-partial-test', data, $('#qunit-partial-test-container'), function(template) {
            setTimeout(function() {
                assert.equal($('#qunit-partial-test-container').text().trim(), 'Hi, Mathieu.', 'Verify the template partial HTML is rendered in the target container');

                // Verify that rendering a non-existing template throws an error
                assert.throws(function() {
                    _.partial('non-existing-partial');
                }, 'Verify that an error is thrown when a non-existing partial is rendered');

                QUnit.start();
            }, 1000);
        });
    });

    // Test the 'renderHierarchyString' functionality
    QUnit.asyncTest('renderHierarchyString', function(assert) {
        expect(6);

        // Retrieve the tripos structure for the test app
        var testApp = testAPI.getTestApp();
        gh.utils.getTriposStructure(testApp.id, false, function(err, data) {
            assert.ok(!err);

            // Find an organisational unit that has parents
            var orgUnitWithParents = _.find(data.parts, function(orgUnit) {
                return orgUnit.ParentId !== null;
            });

            // Verify that an error is thrown when no orgUnit was provided
            assert.throws(function() {
                gh.utils.renderHierarchyString(null, '>');
            }, 'Verify that an error is thrown when no orgUnit was provided');

            // Verify that an error is thrown when an invalid orgUnit was provided
            assert.throws(function() {
                gh.utils.renderHierarchyString('invalid_object', '>');
            }, 'Verify that an error is thrown when an invalid orgUnit was provided');

            // Verify that an error is thrown when no separater was provided
            assert.throws(function() {
                gh.utils.renderHierarchyString(orgUnitWithParents, null);
            }, 'Verify that an error is thrown when no separator was provided');

            // Verify that an error is thrown when an invalid separator was provided
            assert.throws(function() {
                gh.utils.renderHierarchyString(orgUnitWithParents, 9999);
            }, 'Verify that an error is thrown when an invalid separator was provided');

            // Verify that the hierarchy string is returned when all the parameters have been provided
            assert.ok(gh.utils.renderHierarchyString(orgUnitWithParents, ' > '));

            QUnit.start();
        });
    });


    ////////////////
    //  TRIPOSES  //
    ////////////////

    // Test the 'decorateBorrowedSeriesWithParentInfo' functionality
    QUnit.asyncTest('decorateBorrowedSeriesWithParentInfo', function(assert) {
        expect(2);

        // Retrieve the tripos structure for the test app
        var testApp = testAPI.getTestApp();

        // Retrieve and cache the tripos structure
        gh.utils.getTriposStructure(testApp.id, false, function(err, data) {
            assert.ok(!err);

            // Retrieve the parts for the test application
            orgUnitAPI.getOrgUnits(testApp.id, true, false, null, ['part'], function(err, data) {
                assert.ok(!err);

                // Retrieve the organisational units that have series
                var orgUnitsWithSeries = _.filter(data.results, function(orgUnit) { return orgUnit.Series.length; });
                if (orgUnitsWithSeries && orgUnitsWithSeries.length >= 2) {

                    var sourceOrgUnit = _.first(orgUnitsWithSeries);
                    var targetOrgUnit = _.last(orgUnitsWithSeries);

                    var originalSeries = _.sample(sourceOrgUnit.Series);

                    // Borrow a series from the source organisational unit
                    orgUnitAPI.addOrgUnitSeries(targetOrgUnit.id, originalSeries.id, function(err, data) {
                        if (err) {
                            assert.fail('Error while borrowing an event series from the source organisational unit');
                        }

                        // Retrieve the organisational units for the test app
                        orgUnitAPI.getOrgUnits(testApp.id, true, false, null, ['module', 'part'], function(err, data) {
                            if (err) {
                                assert.fail('Error while fetching the organisational units for the test app');
                            }

                            // Retrieve the organisational unit where the series were borrowed in
                            var _targetOrgUnit = _.find(data.results, function(orgUnit) { return orgUnit.id === targetOrgUnit.id; });

                            // Decorate the borrowed series in the organisation unit with their parent information
                            if (_targetOrgUnit.Series && _targetOrgUnit.Series.length) {
                                gh.utils.decorateBorrowedSeriesWithParentInfo(_targetOrgUnit.Series);

                                // Verify that all the borrowed series were decorated with their parent information, if any
                                _.each(_targetOrgUnit.Series, function(serie) {
                                    if (serie.borrowedFrom) {

                                        // Verify that an organisational unit is not decorated with a parent object when it doesn't have a parent
                                        if (!serie.borrowedFrom.ParentId && serie.borrowedFrom.Parent) {
                                            assert.fail('A serie without a parent id shouldn\'t be decorated with a parent object');

                                        // Verify that the organisational unit is decorated with its parent object
                                        } else if (serie.borrowedFrom.ParentId && !serie.borrowedFrom.Parent) {
                                            assert.fail('A serie with a parent id should be decorated with its parent object');
                                        }

                                        // Validate the decorated organisational unit's parent object
                                        if (serie.borrowedFrom.Parent) {

                                            /**
                                             * Validate the parent of an organisational unit
                                             *
                                             * @param  {Object}    _orgUnit
                                             * @private
                                             */
                                            var _validateParent = function(_orgUnit) {
                                                if (_orgUnit.ParentId && _orgUnit.ParentId !== _orgUnit.Parent.id) {
                                                    assert.fail('The organisational unit\'s parent object doesn\'t correspond with the parent ID');
                                                }

                                                if (_orgUnit.Parent) {
                                                    _validateParent(_orgUnit.Parent);
                                                }
                                            };

                                            // Start validating the tree
                                            _validateParent(serie.borrowedFrom);
                                        }
                                    }
                                });
                            }

                            QUnit.start();
                        });
                    });

                } else {
                    QUnit.start();
                }
            });
        });
    });

    // Test the 'addParentInfoToOrgUnit' functionality
    QUnit.asyncTest('addParentInfoToOrgUnit', function(assert) {
        expect(1);

        // Retrieve the tripos structure for the test app
        var testApp = testAPI.getTestApp();
        gh.utils.getTriposStructure(testApp.id, false, function(err, data) {
            assert.ok(!err);

            // Verify that all the parts that have a parent are decorated with their parent
            _.each(data.parts, function(part) {
                if (part.ParentId && part.ParentId !== part.Parent.id) {
                    assert.fail('Verify that the organisational unit is decorated with its correct parent');
                }
            });
            QUnit.start();
        });
    });

    // Test the 'getTriposStructure' functionality
    QUnit.asyncTest('getTriposStructure', function(assert) {
        expect(10);

        // Verify that an error is thrown when an invalid value for app id was provided
        assert.throws(function() {
            gh.utils.getTriposStructure('invalid_app_id', false, function() {});
        }, 'Verify that an error is thrown when an invalid value for app id was provided');

        // Verify that an error is thrown when no value for includePermissions was provided
        assert.throws(function() {
            gh.utils.getTriposStructure(null, null, function() {});
        }, 'Verify that an error is thrown when an invalid value for includePermissions was provided');

        // Verify that an error is thrown when no value for includePermissions was provided
        assert.throws(function() {
            gh.utils.getTriposStructure(null, 'invalid_value', function() {});
        }, 'Verify that an error is thrown when an invalid value for includePermissions was provided');

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.utils.getTriposStructure(null, false);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.utils.getTriposStructure(null, false, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Retrieve the tripos structure for the test application
        var testApp = testAPI.getTestApp();
        gh.utils.getTriposStructure(testApp.id, false, function(err, data) {
            assert.ok(!err, 'Verify that the tripos structure can be requested without errors');
            assert.ok(data, 'Verify that the tripos structure is returned');

            // Retrieve the tripos structure when the application ID was set in the `me` object
            gh.data.me.AppId = testApp.id;
            gh.utils.getTriposStructure(null, false, function(err, data) {
                assert.ok(!err, 'Verify that the tripos structure can be requested without errors');
                assert.ok(data, 'Verify that the tripos structure is returned');

                // Remove the application ID from the `me` object
                if (gh.data.me.AppId) {
                    delete gh.data.me.AppId;
                }

                // Retrieve the tripos structure when no application ID was set
                gh.utils.getTriposStructure(null, false, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no application ID is set');
                    QUnit.start();
                });
            });
        });
    });

    // Test the 'triposData' functionality
    QUnit.test('triposData', function(assert) {
        expect(3);
        var _triposData = gh.utils.triposData();
        assert.ok(_triposData);
        assert.ok(_triposData.subjects);
        assert.ok(_triposData.parts);
    });

    // Test the 'getPartById' functionality
    QUnit.asyncTest('getPartById', function(assert) {
        expect(5);

        // Retrieve the tripos structure for the test application and cache it
        var testApp = testAPI.getTestApp();
        gh.utils.getTriposStructure(testApp.id, false, function(err, data) {
            assert.ok(!err, 'Verify that the tripos structure can be requested without errors');

            // Get a part by its id
            var part = gh.utils.getPartById(3);
            assert.ok(part);
            assert.ok(part.id);
            assert.ok(part.GroupId);

            // Getting a part with an unknown id should return null
            part = gh.utils.getPartById(7324234);
            assert.ok(!part);
            QUnit.start();
        });
    });


    //////////////////
    //  BATCH EDIT  //
    //////////////////

    // Test the 'getOrganiserObjects' functionality
    QUnit.test('getOrganiserObjects', function(assert) {
        // Append a test container with hidden fields to the body
        var hiddenFields = '<td class="gh-event-organisers-fields hide"><input type="hidden" name="gh-event-organiser" value="Bert Pareyn" data-add="true" data-id="1"><input type="hidden" name="gh-event-organiser" value="Mathieu Decoene" data-add="true"></td>';
        $('body').append(hiddenFields);
        // Select the hidden fields container
        var $hiddenFields = $('.gh-event-organisers-fields');
        // Verify that an error is thrown when no $hiddenFields was provided
        assert.throws(function() {
            gh.utils.getOrganiserObjects();
        }, 'Verify that an error is thrown when no $hiddenFields was provided');
        // Verify that the $hiddenFields can be successfully returned as user objects
        var organisers = gh.utils.getOrganiserObjects($hiddenFields);
        assert.equal(organisers[0].displayName, 'Bert Pareyn', 'Verify that the first user has the correct displayName');
        assert.equal(organisers[0].id, '1', 'Verify that the first user has the correct ID');
        assert.equal(organisers[1].displayName, 'Mathieu Decoene', 'Verify that the second user has the correct displayName');
        assert.equal(organisers[1].id, undefined, 'Verify that the second user has no ID');
    });

    testAPI.init();
});
