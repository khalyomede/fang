"use strict";
var imagemin = require("imagemin");
var fangImagemin = function () { return function (fang) {
    fang.files.map(function (file) {
        console.log("start", file.path, file.content.length);
        imagemin.buffer(file.content).then(function (buffer) {
            file.content = buffer;
            console.log("end", file.path, file.content.length);
            return file;
        });
        return file;
    });
    return fang;
}; };
module.exports = fangImagemin;
