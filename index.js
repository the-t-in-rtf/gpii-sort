"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.module.register("gpii-sort", __dirname, require);

require("./src/js/sort.js");