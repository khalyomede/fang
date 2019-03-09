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
var path = require("path");
var pug = require("pug");
var fangPug = function (options) { return function (fang) {
    fang.files.map(function (file) {
        file.content = Buffer.from(pug.render(file.content.toString(), __assign({ filename: path.basename(file.path) }, options)));
        return file;
    });
    return fang;
}; };
module.exports = fangPug;
