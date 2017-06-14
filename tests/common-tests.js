"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var jqUnit = jqUnit || require("node-jqunit");

if (!gpii.sort) { require("../"); }


fluid.registerNamespace("gpii.tests.sort");

// Function to test many variations on input and sort criteria.
gpii.tests.sort.runSingleTest = function (testDef) {
    jqUnit.test(testDef.message, function () {
        var dataToSort = fluid.copy(testDef.input);
        gpii.sort(dataToSort, testDef.sortCriteria);

        jqUnit.assertDeepEq("The results should be in the correct order...", testDef.expected, dataToSort);
    });
};

// Tests that don't follow the common pattern used by `gpii.tests.sort.runSingleTest`...
gpii.tests.sort.runExtraTests = function () {

    jqUnit.test("Test isEmpty function...", function () {
        jqUnit.assertTrue("`null` should be treated as empty...", gpii.sort.isEmpty(null));
        jqUnit.assertTrue("`undefined` should be treated as empty...", gpii.sort.isEmpty(undefined));
        jqUnit.assertTrue("An empty string should be treated as empty...", gpii.sort.isEmpty(""));
        jqUnit.assertTrue("A string that trims to nothing should be treated as empty...", gpii.sort.isEmpty("    "));

        jqUnit.assertFalse("The number zero should not be treated as empty...", gpii.sort.isEmpty(0));
        jqUnit.assertFalse("A non-empty string should not be treated as empty...", gpii.sort.isEmpty("foobar "));
        jqUnit.assertFalse("A date should not be treated as empty...", gpii.sort.isEmpty(new Date()));
    });

    jqUnit.test("Test sorting with bad data and good parameters...", function () {
        var params = [];

        // We are only confirming that none of these throw an error, there are no implicit assertions.
        jqUnit.expect(0);
        gpii.sort(null,      params);
        gpii.sort(undefined, params);
        gpii.sort({},        params);
    });


    jqUnit.test("Test date sorting...", function () {
        var noLaterDate = new Date();

        // Our function should be able to work with any value that new Date() would accept.
        //
        // In this case, `0` resolves to the earliest available data, i.e. the beginning of "the epoch", and we provide a
        // ISO 8601 string for a date between now and the epoch.  As in all cases, we expect the original data not be
        // altered by the sort "casting".
        var baseData = [ {foo: "1972-05-09"}, { foo: noLaterDate }, { foo: 0 } ];
        var expectedAscendingData = [ { foo: 0 }, {foo: "1972-05-09"}, { foo: noLaterDate } ];
        var expectedDescendingData = fluid.copy(expectedAscendingData).reverse();

        var baseParam = "foo<date>";
        var descParam = "\\" + baseParam;

        var ascendingData = fluid.copy(baseData);
        gpii.sort(ascendingData, baseParam);
        jqUnit.assertDeepEq("Data sorted by field type 'date' should match the expected results...", expectedAscendingData, ascendingData);

        var descendingData = fluid.copy(baseData);
        gpii.sort(descendingData, descParam);
        jqUnit.assertDeepEq("Data sorted by field type 'date' (desc) should match the expected results...", expectedDescendingData, descendingData);
    });
};

fluid.defaults("gpii.tests.sort.allTests", {
    gradeNames: ["fluid.component"],
    testDefs: [
        {
            message:  "Test sorting with no sort criteria...",
            input:    [{ foo: "bar"}, { foo: "baz"} ],
            expected: [{ foo: "bar"}, { foo: "baz"} ]
        },
        {
            message:      "Test sorting with an empty array as the sort criteria...",
            input:        [{ foo: "bar"}, { foo: "baz"} ],
            expected:     [{ foo: "bar"}, { foo: "baz"} ],
            sortCriteria: []
        },
        {
            message:      "Test sorting with an empty object as the sort criteria...",
            input:        [{ foo: "bar"}, { foo: "baz"} ],
            expected:     [{ foo: "bar"}, { foo: "baz"} ],
            sortCriteria: {}
        },
        {
            message:      "Test ascending sorting...",
            input:        [ {foo: "qux"}, { foo: "bar"}, { foo: "baz"} ],
            expected:     [ { foo: "bar"}, { foo: "baz"}, {foo: "qux"} ],
            sortCriteria: "/foo"
        },
        {
            message:      "Test descending sorting...",
            input:        [ {foo: "qux"}, { foo: "bar"}, { foo: "baz"} ],
            expected:     [ {foo: "qux"}, { foo: "baz"}, { foo: "bar"} ],
            sortCriteria: "\\foo"
        },
        {
            message:      "Confirm that `ascending` order is the default when no slash is provided...",
            input:        [ {foo: "qux"}, { foo: "bar"}, { foo: "baz"} ],
            expected:     [ { foo: "bar"}, { foo: "baz"}, {foo: "qux"} ],
            sortCriteria: "foo"
        },
        {
            message:      "Confirm that sorting by a nonexistent field has no effect...",
            input:        [ {foo: "qux"}, { foo: "bar"}, { foo: "baz"} ],
            expected:     [ {foo: "qux"}, { foo: "bar"}, { foo: "baz"} ],
            sortCriteria: "bogus"
        },
        {
            message:      "Confirm that the original order in the array is preserved...",
            input:        [ { a: 1, b: 1}, { a: 2, b: 1}, { a: 1, b: 0}, { a: 2, b: 0}],
            expected:     [ { a: 1, b: 1}, { a: 1, b: 0}, { a: 2, b: 1}, { a: 2, b: 0}],
            sortCriteria: "a"
        },
        {
            message:      "Confirm that sorting of equal values has no effect...",
            input:        [{ a: 1, b: 1}, { a: 1, b: 0}, { a: 1, b: 2 }],
            expected:     [{ a: 1, b: 1}, { a: 1, b: 0}, { a: 1, b: 2 }],
            sortCriteria: "a"
        },
        {
            message:      "Confirm that descending sorting of equal values has no effect...",
            input:        [{ a: 1, b: 1}, { a: 1, b: 0}, { a: 1, b: 2 }],
            expected:     [{ a: 1, b: 1}, { a: 1, b: 0}, { a: 1, b: 2 }],
            sortCriteria: "\\a"
        },
        {
            message:      "Test natural sorting of multi-type data...",
            input:        [{ a: true}, { a: "b"}, { a: 1}, { a: "a"}, { a: 0 }, { a: "true"}],
            expected:     [{ a: 0}, { a: 1 }, { a: "a"}, { a: "b"}, { a: true }, { a: "true"}],
            sortCriteria: "a"
        },
        {
            message: "Test sorting by multiple parameters...",
            input: [
                { color: "red", weight: 0.025, name: "Strawberry" },
                { color: "red", weight: 0.1, name: "Apple" },
                { color: "red", weight: 1500, name: "Sports Car" },
                { color: "blue", weight: 0.001, name: "Blueberry" },
                { color: "blue", weight: 0.9, name: "Crab" },
                { color: "blue", weight: 1300, name: "Family Sedan" }
            ],
            expected: [
                { color: "blue", weight: 1300, name: "Family Sedan" },
                { color: "blue", weight: 0.9, name: "Crab" },
                { color: "blue", weight: 0.001, name: "Blueberry" },
                { color: "red", weight: 1500, name: "Sports Car" },
                { color: "red", weight: 0.1, name: "Apple" },
                { color: "red", weight: 0.025, name: "Strawberry" }
            ],
            sortCriteria: ["color", "\\weight"]
        },
        {
            message:      "Test float sorting (ascending)...",
            input:        [ { foo: 5.2}, { foo: 1}, {foo: 5.1} ],
            expected:     [ { foo: 1 }, {foo: 5.1}, { foo: 5.2} ],
            sortCriteria: "foo<float>"
        },
        {
            message:      "Test double sorting (ascending)...",
            input:        [ {foo: 5.1}, { foo: 5.2}, { foo: 1} ],
            expected:     [ { foo: 1 }, {foo: 5.1}, { foo: 5.2} ],
            sortCriteria: "foo<double>"
        },
        {
            message:      "Test double sorting (ascending)...",
            input:        [ {foo: 5.1}, { foo: 5.2}, { foo: 1} ],
            expected:     [ { foo: 1 }, {foo: 5.1}, { foo: 5.2} ],
            sortCriteria: "foo<long>"
        },
        {
            message:      "Test float sorting (descending)...",
            input:        [ {foo: 5.1}, { foo: 5.2}, { foo: 1} ],
            expected:     [ { foo: 5.2 }, {foo: 5.1}, { foo: 1} ],
            sortCriteria: "\\foo<float>"
        },
        {
            message:      "Test double sorting (descending)...",
            input:        [ {foo: 5.1}, { foo: 5.2}, { foo: 1} ],
            expected:     [ { foo: 5.2 }, {foo: 5.1}, { foo: 1} ],
            sortCriteria: "\\foo<double>"
        },
        {
            message:      "Test double sorting (descending)...",
            input:        [ {foo: 5.1}, { foo: 5.2}, { foo: 1} ],
            expected:     [ { foo: 5.2 }, {foo: 5.1}, { foo: 1} ],
            sortCriteria: "\\foo<long>"
        },
        {
            message:      "Test typed sorting with multiple fields....",
            input:        [ { a: 3, b: "a" }, { a: 5, b: "b" }, { a: 1, b: "a" }, { a: 7, b: "c" }, { a: 7, b: "a" } ],
            expected:     [ { a: 7, b: "a" }, { a: 7, b: "c" }, { a: 5, b: "b" }, { a: 3, b: "a" }, { a: 1, b: "a" } ],
            sortCriteria: ["\\a<int>", "b"]
        },
        {
            message:      "Test case-insensitive sorting (ascending)...",
            input:        [ { a: "A" }, { a: "E" }, { a: "C" }, { a: "b" }, { a: "d" } ],
            expected:     [ { a: "A" }, { a: "b" }, { a: "C" }, { a: "d" }, { a: "E" } ],
            sortCriteria: ["a"]
        },
        {
            message:      "Test case-insensitive sorting (descending)...",
            input:        [ { a: "A" }, { a: "E" }, { a: "C" }, { a: "b" }, { a: "d" } ],
            expected:     [ { a: "E" }, { a: "d" }, { a: "C" }, { a: "b" }, { a: "A" } ],
            sortCriteria: ["\\a"]
        },
        {
            message:      "Test sorting of null, undefined, and empty values...",
            input:        [ { a: null, b: "c" }, { a: "", b: "a" }, { a: undefined, b: "b" }, { a: null, b: null }, { a: "a", b: "z"} ],
            expected:     [ { a: "a", b: "z" }, { a: "", b: "a" }, { a: undefined, b: "b" }, { a: null, b: "c" }, { a: null, b: null }],
            sortCriteria: ["a", "b"]
        },
        {
            message:      "Test sorting using a field name with a less than sign...",
            input:        [ { "<bogus>": 5 }, { "<bogus>": 3 }],
            expected:     [ { "<bogus>": 3 }, { "<bogus>": 5 }],
            sortCriteria: "<bogus>"
        }
    ],
    listeners: {
        "onCreate.announceModule": {
            funcName: "jqUnit.module",
            args: ["Testing sort functions..."]
        },
        "onCreate.runCommonTests": {
            funcName: "fluid.each",
            args: ["{that}.options.testDefs", gpii.tests.sort.runSingleTest]
        },
        "onCreate.runExtraTests": {
            funcName: "gpii.tests.sort.runExtraTests"
        }
    }
});

gpii.tests.sort.allTests();
