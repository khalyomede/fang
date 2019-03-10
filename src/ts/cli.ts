#!/usr/bin/env node

const fang = require("./main");
import * as cli from "cli";
import * as os from "os";
import { sep } from "path";
import * as cliColor from "cli-color";
const packageJson = require("../package.json");

cli.setApp("fang", packageJson.version);
cli.setUsage("fang [options] <task>");
cli.enable("help");
cli.enable("version");

const taskName = process.argv[process.argv.length - 1];
const defaulTaskPath = process.cwd() + sep + "fang.js";

if (process.argv.includes("--list") || process.argv.includes("-l")) {
	console.log(fang.tasksList().join("\n"));
} else {
	const options = cli.parse({
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
