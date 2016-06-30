/*
    
    Static functions to add support for sorting arrays using lucene-like syntax.  See the README.md file for details.

 */
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");

// The main `sort` function.  Works with an array containing maps of values, and the parameter syntax outlined above.
//
// Like `Array.sort()` itself, this will modify the source array.  If you do not want this, you are expected to provide
// a copy of the array yourself, for example, by passing in the output of `fluid.copy(array)`.
gpii.sort = function (array, sortParams) {
    if (Array.isArray(sortParams)) {
        return gpii.sort.sortByArray(array, sortParams);
    }
    else if (typeof sortParams === "string") {
        return gpii.sort.sortByValue(array, sortParams);
    }

    // Anything else fails silently
};

// Process an array of sort parameters.
gpii.sort.sortByArray = function (array, sortParams) {
    // We must apply the search in reverse so that the most significant sorting is applied last.
    var reverseParams = sortParams.reverse();

    fluid.each(reverseParams, function (param) {
        gpii.sort.sortByValue(array, param);
    });
};

// Process a single sort parameter
gpii.sort.sortByValue = function (array, sortParam) {
    var sortFunction = gpii.sort.generateSortFunction(sortParam);
    fluid.stableSort(array, sortFunction);
};

// Returns true if a string is `undefined`, `null`, or an empty (trimmed) string.
//
// Returns true otherwise.
//
gpii.sort.isEmpty = function (value) {
    if (typeof value === "string") {
        return value.trim().length === 0;
    }

    return value === undefined || value === null;
};

gpii.sort.generateSortFunction = function (rawParam) {
    var param     = gpii.sort.getParam(rawParam);
    var direction = gpii.sort.getDirection(rawParam);
    var type      = gpii.sort.getType(rawParam);

    return function (a, b) {
        // Type the comparison variable so that sorting is handled appropriately.
        var typedValueA = a[param], typedValueB = b[param];

        // All of the non-int number types are treated as "float" values.  As we are not likely to be dealing with
        // ultra-fine sorting to multiple decimal places, this is likely to be acceptable.
        if (type === "float" || type === "double" || type === "long") {
            typedValueA = parseFloat(a[param]);
            typedValueB = parseFloat(b[param]);
        }
        else if (type === "int") {
            typedValueA = parseInt(a[param], 10);
            typedValueB = parseInt(b[param], 10);
        }
        else if (type === "date") {
            typedValueA = new Date(a[param]);
            typedValueB = new Date(b[param]);
        }

        var aIsEmpty = gpii.sort.isEmpty(typedValueA);
        var bIsEmpty = gpii.sort.isEmpty(typedValueB);
        if (typedValueA === typedValueB) {
            return 0;
        }
        else if (aIsEmpty && bIsEmpty) {
            return 0;
        }
        else if (!aIsEmpty && bIsEmpty) { return -1 * direction; }
        else if (aIsEmpty && !bIsEmpty) { return  1 * direction; }
        else if (typeof typedValueA === "string" && typeof typedValueB === "string") {
            // We would like to use `localeCompare` here, but it's not correctly supported in node.js
            // Adapted from http://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
            //return typedValueA.localeCompare(typedValueB, "en", {"sensitivity": "base"}) * direction;

            // Instead, we use a more basic approach.
            return (typedValueA.trim().toLowerCase() < typedValueB.trim().toLowerCase() ? -1 : 1) * direction;
        }
        // If the types are the same, we can use a typed comparison
        else if (typeof typedValueA === typeof typedValueB) {
            if (typedValueA < typedValueB) {
                return -1 * direction;
            }

            // We know the values aren't equal because of the check above, and  can safely assume typedValueB > typedValueA.
            return 1 * direction;
        }
        // This emulates the default behavior of `Array.sort`, which is to use comparisons of the output of each object's `toString` method.
        else {
            var stringValueA = typedValueA.toString();
            var stringValueB = typedValueB.toString();
            if (stringValueA < stringValueB) { return -1 * direction; }
            else if (stringValueA > stringValueB) { return  1 * direction; }
            return 0;
        }
    };
};


// Extract the field name from the sort parameter, without including the optional direction and type qualifiers.
gpii.sort.getParam = function (rawParam) {
    var matches = rawParam.match(/^([\\/])?([^<]+)<?.*$/);
    if (matches) {
        return matches[2];
    }

    return rawParam;
};

// Extract the type qualifier, if no type is found, we default to "natural".
gpii.sort.getType = function (rawParam) {
    var matches = rawParam.match(/^.+<(.+)>$/);
    if (matches) {
        return matches[1];
    }

    return "natural";
};

// If we have a slash prepended in front of us, we are descending (-1).  Otherwise, we are ascending (1).
gpii.sort.getDirection = function (rawParam) {
    var matches = rawParam.match(/^\\.+/);
    if (matches) {
        return -1;
    }

    return 1;
};