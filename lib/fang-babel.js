"use strict";
var babel = require("@babel/core");
var path_1 = require("path");
var fancyLog = require("fancy-log");
var cliColor = require("cli-color");
var fangBabel = function (options) {
    if (options === void 0) { options = {}; }
    return function (fang) {
        fang.files.map(function (file) {
            file.content = Buffer.from(babel.transformSync(file.content.toString(), options).code);
            if (fang.options.debug) {
                var fileName = cliColor.magenta(path_1.basename(file.path));
                fancyLog.info(fileName + ": transpiled");
            }
            return file;
        });
        return fang;
    };
};
module.exports = fangBabel;
