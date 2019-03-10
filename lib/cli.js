#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var fang = require("./main");
var cli = require("cli");
var os = require("os");
var path_1 = require("path");
var packageJson = require("../package.json");
cli.setApp("fang", packageJson.version);
cli.setUsage("fang [options] <task>");
cli.enable("help");
cli.enable("version");
var taskName = process.argv[process.argv.length - 1];
var defaulTaskPath = process.cwd() + path_1.sep + "fang.js";
if (process.argv.includes("--list") || process.argv.includes("-l")) {
    console.log(fang.tasksList().join("\n"));
}
else {
    var options = cli.parse({
        "max-core": [
            "c",
            "The maximum of core to use.",
            "int",
            os.cpus().length
        ],
        "tasks-path": [
            "p",
            "The path to the task file in case you do not use the default path.",
            "string",
            defaulTaskPath
        ],
        debug: [
            "d",
            "Whether or not to display debug information.",
            "boolean",
            false
        ],
        list: ["l", "List all the tasks, and their sub task.", "boolean", false]
    });
    fang.run({
        maxCore: options["max-core"],
        taskName: taskName,
        tasksPath: options["tasks-path"],
        debug: options["debug"]
    });
}
