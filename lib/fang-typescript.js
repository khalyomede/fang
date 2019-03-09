"use strict";
var typescript = require("typescript");
var modifyFilename = require("modify-filename");
var fangTypescript = function (options) {
    if (options === void 0) { options = {}; }
    return function (fang) {
        fang.files.map(function (file) {
            file.content = Buffer.from(typescript.transpileModule(file.content.toString(), options)
                .outputText);
            file.path = modifyFilename(file.path, function (filename, extension) { return filename + ".js"; });
            return file;
        });
        return fang;
    };
};
module.exports = fangTypescript;
