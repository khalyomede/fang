import * as cluster from "cluster";
import * as os from "os";
import * as fancyLog from "fancy-log";
import * as cliColor from "cli-color";
import * as glob from "glob";
import * as fsExtra from "fs-extra";
import * as commondir from "commondir";
import * as slash from "slash";
const now = require("performance-now");
import { existsSync, readFileSync, writeFile } from "fs";
import { sep, dirname, resolve } from "path";
import { exit } from "cli";

interface Options {
	maxCore?: number;
	tasksPath?: string;
	taskName: string;
	debug: boolean;
}

interface File {
	path: string;
	content: Buffer;
}

class Fang {
	protected files: Array<File>;
	protected options: Object;
	protected baseDirectory: string;

	protected static options: {};

	public constructor() {
		this.files = [];
		this.options = {};
		this.baseDirectory = "";
	}

	public static run(options: Options) {
		Fang.options = options;

		let opts = options;
		let maxCore = 1;

		if ("maxCore" in opts) {
			const typeOfMaxCore = typeof opts.maxCore;
			if (typeOfMaxCore !== "number") {
				throw new TypeError(
					`type of option "maxCore" should be number (got: ${typeOfMaxCore})`
				);
			}

			if (opts.maxCore < 1) {
				throw new RangeError(
					`unable to restrict the number of core of a negative amount (got: ${
						opts.maxCore
					})`
				);
			}

			maxCore = os.cpus().length;

			if (opts.maxCore > maxCore) {
				throw new RangeError(
					`unable to restric the number of core of more than the maximum of core (max: ${maxCore}, got: ${
						opts.maxCore
					})`
				);
			}
		} else {
			opts.maxCore = os.cpus().length;
		}

		if ("tasksPath" in opts) {
			const typeOfTasksPath = typeof opts.tasksPath;

			if (typeOfTasksPath !== "string") {
				throw new TypeError(
					`type of option "tasksPath" should be string (got: ${typeOfTasksPath})`
				);
			}
		} else {
			opts.tasksPath = process.cwd() + sep + "fang.js";
		}

		if (!existsSync(opts.tasksPath)) {
			throw new Error(`${opts.tasksPath} does not exist`);
		}

		if ("taskName" in opts) {
			const typeOfTaskName = typeof opts.taskName;

			if (typeOfTaskName !== "string") {
				throw new TypeError("the task name should be a string");
			}
		} else {
			throw new Error("the task name is missing");
		}

		let tasks = require(opts.tasksPath);

		if (!(opts.taskName in tasks)) {
			fancyLog.error(
				`${cliColor.green("fang")}: task "${opts.taskName}" not found`
			);

			exit(1);
		}

		tasks = tasks[opts.taskName];

		if (cluster.isMaster) {
			Fang.process(tasks, opts);
		} else {
			process.on("message", message => {
				const start = now();
				const task = tasks[message.taskId];
				const name = cliColor.green(task.name);

				fancyLog.info(`${name}: start`);

				try {
					task()
						.then(result => {
							if (typeof result === "function") {
								result();
							}

							const duration = ((now() - start) / 1000).toFixed(
								3
							);
							fancyLog.info(
								`${name}: finished in ${cliColor.yellow(
									duration
								)} sec.`
							);
							fancyLog.info(`${name}: end`);

							process.exit(0);
						})
						.catch(error => {
							const duration = ((now() - start) / 1000).toFixed(
								3
							);

							fancyLog.error(`${name}: error`);
							fancyLog.error(error);
							fancyLog.info(
								`${name}: finished in ${cliColor.yellow(
									duration
								)} sec.`
							);
							fancyLog.info(`${name}: end`);

							process.exit(1);
						});
				} catch (exception) {
					fancyLog.error(`${name}: error`);
					fancyLog.error(exception);

					process.exit(1);
				}
			});
		}
	}

	public static from(path: string): Fang {
		const instance = new this();

		const glb = new glob.Glob(path, {
			sync: true
		});

		instance.files = glb.found.map(path => {
			return {
				path: path,
				content: Buffer.from(readFileSync(path).toString())
			};
		});

		const files = Object.keys(glb.cache);

		if (files.length > 0) {
			instance.baseDirectory = commondir(files);
		}

		instance.options = Fang.options;

		return instance;
	}

	public static process(tasks: Array<Function>, opts: Options): void {
		const appName = cliColor.green("fang");

		fancyLog.info(`${appName}: start`);

		const start = now();
		const tasksCount = tasks.length;
		let remainingTasks = tasks;
		let cpuUsed = 0;
		let workersWorking = 0;
		let taskIndex = 0;

		fancyLog.info(
			`${appName}: using a maximum of ${cliColor.yellow(
				opts.maxCore
			)} cores`
		);

		for (let index = 0; index < tasksCount; index++) {
			const thereIsRemainingCpus = cpuUsed <= opts.maxCore;
			const thereIsTasksToProcess = remainingTasks.length > 0;

			if (thereIsRemainingCpus && thereIsTasksToProcess) {
				const taskId = taskIndex;

				cpuUsed++;
				taskIndex++;
				workersWorking++;
				remainingTasks.shift();

				const worker = cluster.fork();

				worker.send({
					taskId: taskId
				});
			}
		}

		cluster.on("exit", () => {
			workersWorking--;
			cpuUsed--;

			const thereIsTasksToProcess = remainingTasks.length > 0;
			const allTasksCompleted = workersWorking === 0;

			if (allTasksCompleted) {
				const duration = ((now() - start) / 1000).toFixed(3);

				fancyLog.info(
					`${appName}: finished in ${cliColor.yellow(duration)} sec.`
				);
				fancyLog.info(`${appName}: end`);
			}

			if (thereIsTasksToProcess) {
				const worker = cluster.fork();
				const taskId = taskIndex;

				cpuUsed++;
				taskIndex++;
				workersWorking++;
				remainingTasks.shift();

				worker.send({
					taskId: taskId
				});
			}
		});
	}

	public do(callable: Function): Fang {
		return callable(this);
	}

	public save(path: string) {
		const fileCount = this.files.length;

		for (let i = 0; i < fileCount; i++) {
			console.log("before", this.files[i].path);
			console.log("base dir", this.baseDirectory);

			this.files[i].path = slash(resolve(this.files[i].path)).replace(
				this.baseDirectory,
				""
			);

			console.log("after", this.files[i].path);
		}

		return new Promise((resolve, reject) => {
			const promises = [];
			const basePath = process.cwd() + sep + path;

			for (const file of this.files) {
				const filePath = basePath + sep + file.path;
				const directoryPath = dirname(filePath);

				const promise = new Promise((rslv, rjct) => {
					if (!existsSync(directoryPath)) {
						fsExtra.mkdirpSync(directoryPath);
					}

					writeFile(filePath, file.content, error => {
						if (error) {
							rjct(error);
						}

						rslv();
					});
				});

				promises.push(promise);
			}

			Promise.all(promises)
				.then(() => resolve())
				.catch(error => reject(error));
		});
	}

	public static tasksList(): Array<string> {
		let tasks = [];

		const tasksPath = process.cwd() + sep + "fang.js";
		const modules = require(tasksPath);

		for (const moduleName in modules) {
			const subTasks = modules[moduleName];
			let subTasksNames = [];

			for (const subTask of subTasks) {
				subTasksNames.push(subTask.name);
			}

			tasks.push(
				`${cliColor.green(moduleName)}: ${subTasksNames.join(", ")}`
			);
		}

		return tasks;
	}
}

export = Fang;
