"use strict";
var CleanCss = require("clean-css");
var defaultOptions = {
    level: {
        1: {
            cleanupCharsets: true,
            normalizeUrls: true,
            optimizeBackground: true,
            optimizeBorderRadius: true,
            optimizeFilter: true,
            optimizeFont: true,
            optimizeFontWeight: true,
            optimizeOutline: true,
            removeEmpty: true,
            removeNegativePaddings: true,
            removeQuotes: true,
            removeWhitespace: true,
            replaceMultipleZeros: true,
            replaceTimeUnits: true,
            replaceZeroUnits: true,
            roundingPrecision: false,
            selectorsSortingMethod: "standard",
            specialComments: "all",
            tidyAtRules: true,
            tidyBlockScopes: true,
            tidySelectors: true,
            semicolonAfterLastProperty: false // controls removing trailing semicolons in rule; defaults to `false` - means remove
        },
        2: {
            mergeAdjacentRules: true,
            mergeIntoShorthands: true,
            mergeMedia: true,
            mergeNonAdjacentRules: true,
            mergeSemantically: false,
            overrideProperties: true,
            removeEmpty: true,
            reduceNonAdjacentRules: true,
            removeDuplicateFontRules: true,
            removeDuplicateMediaBlocks: true,
            removeDuplicateRules: true,
            removeUnusedAtRules: false,
            restructureRules: false // controls rule restructuring; defaults to false
        }
    }
};
var fangCleanCss = function (options) {
    if (options === void 0) { options = defaultOptions; }
    return function (fang) {
        fang.files.map(function (file) {
            file.content = Buffer.from(new CleanCss(options).minify(file.content.toString()).styles);
            return file;
        });
        return fang;
    };
};
module.exports = fangCleanCss;
