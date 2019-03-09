const { task, src, dest, series, parallel, watch } = require("gulp");
const typescript = require("gulp-typescript");

task("ts", () =>
	src("src/ts/**/*.ts")
		.pipe(typescript())
		.pipe(dest("lib"))
);

task("build", parallel("ts"));
task("watch", () => watch("src/ts/**/*.ts", series("ts")));
