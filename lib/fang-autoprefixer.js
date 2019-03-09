"use strict";
var postcss = require("postcss");
var autoprefixer = require("autoprefixer");
var fangAutoprefixer = function () { return function (fang) {
    fang.files.map(function (file) {
        file.content = Buffer.from(postcss([autoprefixer]).process(file.content.toString()).css);
        return file;
    });
    return fang;
}; };
module.exports = fangAutoprefixer;
