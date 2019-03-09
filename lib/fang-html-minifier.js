"use strict";
var htmlMinifier = require("html-minifier");
var defaultOptions = {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    useShortDoctype: true
};
var fangHtmlMinifier = function (options) {
    if (options === void 0) { options = defaultOptions; }
    return function (fang) {
        fang.files.map(function (file) {
            file.content = Buffer.from(htmlMinifier.minify(file.content.toString(), options));
            return file;
        });
        return fang;
    };
};
module.exports = fangHtmlMinifier;
