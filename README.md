# gpii-sort

A library that contains static functions to sort array content using lucene-like syntax.  To ensure [stable sorting](https://en.wikipedia.org/wiki/Sorting_algorithm#Stability),
we use [the `fluid.stableSort` function provided by Infusion](http://docs.fluidproject.org/infusion/development/CoreAPI.html#fluid-stablesort-array-func-).
aaaa
# `gpii.sort(array, sortCriteria)`

* `array`: The array to be sorted.
* `sortCriteria`: An array of sort terms.  These are applied in reverse order (see examples below).
* Returns: The sorted array.

Note that as with [`Array.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort), the order of the original array is modified.

# Usage Examples

The syntax follows the same conventions as [couchdb-lucene](https:github.com/rnewson/couchdb-lucene), namely, a sort
option looks like a field name, and is optionally prefixed with a direction indicator (/ for ascending, \ for
descending order).  If there is no prefix, ascending order is assumed.

We also support type-specific sorting using an optional suffix enclosed in less than an greater than signs.  For
example, `\updated<date>` would sort records by the date when they were updated, in descending order.

As with couchdb-lucene we support sorting by 'float', 'double', 'int', 'long' and 'date'.  If no suffix is specified,
we default to "natural" sorting, i.e. whatever Javascript thinks is appropriate (normally, alphabetical sorting).

Let's say we have data like the following:

```
var myArray = [
    { color: "red", weight: 0.025, name: "Strawberry" },
    { color: "red", weight: 0.1, name: "Apple" },
    { color: "red", weight: 1500, name: "Sports Car" },
    { color: "blue", weight: 0.001, name: "Blueberry" },
    { color: "blue", weight: 0.9, name: "Crab" },
    { color: "blue", weight: 1300, name: "Family Sedan" }
];
```

A simple sort might look like:

```
gpii.sort(myArray, "color");
```

That would return the following:

```
[
    { color: "blue", weight: 0.001, name: "Blueberry" },
    { color: "blue", weight: 0.9, name: "Crab" },
    { color: "blue", weight: 1300, name: "Family Sedan" },
    { color: "red", weight: 0.025, name: "Strawberry" },
    { color: "red", weight: 0.1, name: "Apple" },
    { color: "red", weight: 1500, name: "Sports Car" }
]
```

Note that within each color, the items appear in the same order as in the original array.  Here's a more complex example:

```
gpii.sort(myArray, ["color", "\weight"]);
```

The sort would result in the following order:

```
[
    { color: "blue", weight: 1300, name: "Family Sedan" },
    { color: "blue", weight: 0.9, name: "Crab" },
    { color: "blue", weight: 0.001, name: "Blueberry" },
    { color: "red", weight: 1500, name: "Sports Car" }
    { color: "red", weight: 0.1, name: "Apple" },
    { color: "red", weight: 0.025, name: "Strawberry" },
]
```

Note that as with `Array.sort`, comparisons between types are handled by comparing the string value of each object, as
in the following example:

```
gpii.sort([{ a: false }, { a: 0 }, { a: "a string" }], "a");

// returns [{ a: 0 }, { a: "a string" }, { a: false }]
```

