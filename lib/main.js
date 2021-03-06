"use strict";
var cluster = require("cluster");
var os = require("os");
var fancyLog = require("fancy-log");
var cliColor = require("cli-color");
var glob = require("glob");
var fsExtra = require("fs-extra");
var commondir = require("commondir");
var slash = require("slash");
var now = require("performance-now");
var fs_1 = require("fs");
var path_1 = require("path");
var Fang = /** @class */ (function () {
    function Fang() {
        this.files = [];
        this.options = {};
        this.baseDirectory = "";
        this.pluginName = "";
    }
    Fang.run = function (options) {
        Fang.options = options;
        var opts = options;
        var maxCore = 1;
        var typeOfOpts = typeof opts;
        if (typeOfOpts !== "object") {
            throw new TypeError("the options should be an object (got: " + typeOfOpts + ")");
        }
        if ("maxCore" in opts) {
            var typeOfMaxCore = typeof opts.maxCore;
            if (typeOfMaxCore !== "number") {
                throw new TypeError("type of option \"maxCore\" should be number (got: " + typeOfMaxCore + ")");
            }
            if (opts.maxCore < 1) {
                throw new RangeError("unable to restrict the number of core of a negative amount (got: " + opts.maxCore + ")");
            }
            maxCore = os.cpus().length;
            if (opts.maxCore > maxCore) {
                throw new RangeError("unable to restric the number of core of more than the maximum of core (max: " + maxCore + ", got: " + opts.maxCore + ")");
            }
        }
        else {
            opts.maxCore = os.cpus().length;
        }
        if ("tasksPath" in opts) {
            var typeOfTasksPath = typeof opts.tasksPath;
            if (typeOfTasksPath !== "string") {
                throw new TypeError("type of option \"tasksPath\" should be string (got: " + typeOfTasksPath + ")");
            }
        }
        else {
            opts.tasksPath = process.cwd() + path_1.sep + "fang.js";
        }
        if (!fs_1.existsSync(opts.tasksPath)) {
            throw new Error(opts.tasksPath + " does not exist");
        }
        if ("taskName" in opts) {
            var typeOfTaskName = typeof opts.taskName;
            if (typeOfTaskName !== "string") {
                throw new TypeError("the task name should be a string");
            }
        }
        else {
            throw new Error("the task name is missing");
        }
        var tasks = require(opts.tasksPath);
        if (!(opts.taskName in tasks)) {
            throw new Error("task \"" + opts.taskName + "\" not found");
        }
        tasks = tasks[opts.taskName];
        if (cluster.isMaster) {
            Fang.process(tasks, opts);
        }
        else {
            process.on("message", function (message) {
                var start = now();
                var task = tasks[message.taskId];
                var name = cliColor.green(task.name);
                fancyLog.info(name + ": start");
                try {
                    task()
                        .then(function (result) {
                        if (typeof result === "function") {
                            result();
                        }
                        var duration = ((now() - start) / 1000).toFixed(3);
                        fancyLog.info(name + ": finished in " + cliColor.yellow(duration) + " sec.");
                        fancyLog.info(name + ": end");
                        process.exit(0);
                    })["catch"](function (error) {
                        var duration = ((now() - start) / 1000).toFixed(3);
                        fancyLog.error(name + ": error");
                        fancyLog.error(error);
                        fancyLog.info(name + ": finished in " + cliColor.yellow(duration) + " sec.");
                        fancyLog.info(name + ": end");
                        process.exit(1);
                    });
                }
                catch (exception) {
                    fancyLog.error(name + ": error");
                    fancyLog.error(exception);
                    process.exit(1);
                }
            });
        }
    };
    /**
     * Use a glob to determine which files to process.
     *
     * @param {String} path The path or the glob.
     * @return {Object}
     * @see https://www.npmjs.com/package/glob#usage For an example of glob.
     */
    Fang.from = function (path) {
        var instance = new this();
        var glb = new glob.Glob(path, {
            sync: true
        });
        instance.files = glb.found.map(function (path) {
            return {
                path: path,
                content: Buffer.from(fs_1.readFileSync(path).toString())
            };
        });
        var files = Object.keys(glb.cache);
        if (files.length > 0) {
            instance.baseDirectory = commondir(files);
        }
        instance.options = Fang.options;
        return instance;
    };
    Fang.process = function (tasks, opts) {
        var appName = cliColor.green("fang");
        fancyLog.info(appName + ": start");
        var start = now();
        var tasksCount = tasks.length;
        var remainingTasks = tasks;
        var cpuUsed = 0;
        var workersWorking = 0;
        var taskIndex = 0;
        fancyLog.info(appName + ": using a maximum of " + cliColor.yellow(opts.maxCore) + " cores");
        for (var index = 0; index < tasksCount; index++) {
            var thereIsRemainingCpus = cpuUsed <= opts.maxCore;
            var thereIsTasksToProcess = remainingTasks.length > 0;
            if (thereIsRemainingCpus && thereIsTasksToProcess) {
                var taskId = taskIndex;
                cpuUsed++;
                taskIndex++;
                workersWorking++;
                remainingTasks.shift();
                var worker = cluster.fork();
                worker.send({
                    taskId: taskId
                });
            }
        }
        cluster.on("exit", function () {
            workersWorking--;
            cpuUsed--;
            var thereIsTasksToProcess = remainingTasks.length > 0;
            var allTasksCompleted = workersWorking === 0;
            if (allTasksCompleted) {
                var duration = ((now() - start) / 1000).toFixed(3);
                fancyLog.info(appName + ": finished in " + cliColor.yellow(duration) + " sec.");
                fancyLog.info(appName + ": end");
            }
            if (thereIsTasksToProcess) {
                var worker = cluster.fork();
                var taskId = taskIndex;
                cpuUsed++;
                taskIndex++;
                workersWorking++;
                remainingTasks.shift();
                worker.send({
                    taskId: taskId
                });
            }
        });
    };
    /**
     * Executes a plugin to the files.
     *
     * @param {Function} callable The plugin to use.
     * @return {Object}
     */
    Fang.prototype["do"] = function (callable) {
        return callable(this);
    };
    /**
     * Save the files to the desired folder.
     *
     * @param {String} path The path to the folder destination.
     * @return {Promise}
     */
    Fang.prototype.save = function (path) {
        var _this = this;
        var fileCount = this.files.length;
        for (var i = 0; i < fileCount; i++) {
            this.files[i].path = slash(path_1.resolve(this.files[i].path)).replace(this.baseDirectory, "");
        }
        return new Promise(function (resolve, reject) {
            var promises = [];
            var basePath = process.cwd() + path_1.sep + path;
            var _loop_1 = function (file) {
                var filePath = basePath + path_1.sep + file.path;
                var directoryPath = path_1.dirname(filePath);
                var promise = new Promise(function (rslv, rjct) {
                    if (!fs_1.existsSync(directoryPath)) {
                        fsExtra.mkdirpSync(directoryPath);
                    }
                    fs_1.writeFile(filePath, file.content, function (error) {
                        if (error) {
                            rjct(error);
                        }
                        rslv();
                    });
                });
                promises.push(promise);
            };
            for (var _i = 0, _a = _this.files; _i < _a.length; _i++) {
                var file = _a[_i];
                _loop_1(file);
            }
            Promise.all(promises)
                .then(function () { return resolve(); })["catch"](function (error) { return reject(error); });
        });
    };
    Fang.tasksList = function () {
        var tasks = [];
        var tasksPath = process.cwd() + path_1.sep + "fang.js";
        var modules = require(tasksPath);
        for (var moduleName in modules) {
            var subTasks = modules[moduleName];
            var subTasksNames = [];
            for (var _i = 0, subTasks_1 = subTasks; _i < subTasks_1.length; _i++) {
                var subTask = subTasks_1[_i];
                this._subTask = subTask;
                if (this._subTaskWellFormed()) {
                    subTasksNames.push(this._getSubTaskName());
                }
            }
            tasks.push(this._getColoredTask(moduleName, subTasksNames));
        }
        return tasks;
    };
    /**
     * Displays the current time and an informational message in console.
     *
     * @param {String} taskName The name of the task that is logging.
     * @param {String} message The message to log.
     * @throws {Error} If the task name is not provided.
     * @throws {Error} If the message is not provided.
     */
    Fang.prototype.info = function (message) {
        if (message === undefined) {
            throw new Error("the message is missing");
        }
        if (typeof message !== "string") {
            throw new TypeError("the message should be a string");
        }
        if (message.trim().length < 1) {
            throw new Error("the message should not be empty");
        }
        fancyLog.info(cliColor.green(this.pluginName) + ": " + message);
    };
    Fang._getColoredTask = function (moduleName, tasksNames) {
        return cliColor.green(moduleName) + ": " + tasksNames.join(", ");
    };
    Fang._subTaskWellFormed = function () {
        return "name" in this._subTask;
    };
    Fang._getSubTaskName = function () {
        return this._subTaskWellFormed() ? this._subTask.name : "?";
    };
    return Fang;
}());
module.exports = Fang;
