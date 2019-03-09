"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var sass = require("node-sass");
var modifyFilename = require("modify-filename");
var path_1 = require("path");
var fangSass = function (options) { return function (fang) {
    fang.files.map(function (file) {
        var indentedSyntax = path_1.basename(file.path).endsWith(".sass");
        var folder = path_1.dirname(file.path);
        file.content = sass.renderSync(__assign({ data: file.content.toString(), indentedSyntax: indentedSyntax, includePaths: [folder] }, options)).css;
        file.path = modifyFilename(file.path, function (filename, extension) { return filename + ".css"; });
        return file;
    });
    return fang;
}; };
module.exports = fangSass;
