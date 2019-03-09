const cluster = require("cluster");
const imagemin = require("imagemin");
const fancyLog = require("fancy-log");
const cliColor = require("cli-color");

const png = () => imagemin(["src/img/**/*.png"], "dist/img");
const jpg = () => imagemin(["src/img/**/*.{jpg,jpeg}"], "dist/img");
const svg = () => imagemin(["src/img/**/*.svg"], "dist/img");
const gif = () => imagemin(["src/img/**/*.gif"], "dist/img");

const tasks = [png, jpg, svg, gif];

if (cluster.isMaster) {
	const start = process.hrtime();
	const desiredMaxCpu = process.argv[2];
	const maxCpuCount = desiredMaxCpu || require("os").cpus().length;
	const tasksCount = tasks.length;
	const name = cliColor.green("fang");
	let remainingTasks = tasks;
	let cpuUsed = 0;
	let workersWorking = 0;
	let taskIndex = 0;

	fancyLog.info(`${name}: start`);
	fancyLog.info(
		`${name}: using a maximum of ${cliColor.yellow(maxCpuCount)} cores`
	);

	for (let index = 0; index < tasksCount; index++) {
		const thereIsRemainingCpus = cpuUsed <= maxCpuCount;
		const thereIsTasksToProcess = remainingTasks.length > 0;

		if (thereIsRemainingCpus && thereIsTasksToProcess) {
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
	}

	cluster.on("exit", () => {
		workersWorking--;
		cpuUsed--;

		const thereIsTasksToProcess = remainingTasks.length > 0;
		const allTasksCompleted = workersWorking === 0;

		if (allTasksCompleted) {
			const duration = process.hrtime(start);

			fancyLog.info(
				`${name}: finished in ${cliColor.yellow(duration)} sec.`
			);
			fancyLog.info(`${name}: end`);
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
} else {
	process.on("message", message => {
		const start = process.hrtime();
		const taskId = message.taskId;
		const task = tasks[taskId];
		const name = cliColor.green(task.name);

		fancyLog.info(`${name}: start`);

		try {
			task()
				.then(result => {
					const duration = process.hrtime(start);
					fancyLog.info(
						`${name}: finished in ${cliColor.yellow(duration)} sec.`
					);
					fancyLog.info(`${name}: end`);

					process.exit(0);
				})
				.catch(error => {
					fancyLog.error(`${name}: error`);
					fancyLog.error(error);
					fancyLog.info(
						`${name}: finished in ${cliColor.yellow(duration)} sec.`
					);
					fancyLog.info(`${name}: end`);

					process.exit(1);
				});
		} catch (exception) {
			fancyLog.error(`${name}: error`);
			fancyLog.error(exception);
		}
	});
}
