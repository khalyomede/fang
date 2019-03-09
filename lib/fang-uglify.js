"use strict";
var uglify = require("uglify-es");
var fangUglify = function () { return function (fang) {
    fang.files = fang.files.map(function (file) {
        file.content = Buffer.from(uglify.minify(file.content.toString()).code);
        return file;
    });
    return fang;
}; };
module.exports = fangUglify;
