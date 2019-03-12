const expect = require("chai").expect;
const fang = require("./../lib/main");
const cliColor = require("cli-color");

describe("_getColorTask", () => {
	it("should return the colored task with its subtask", () => {
		const tasks = ["js", "ts", "html", "pug", "css", "sass"];

		const expected = `${cliColor.green("build")}: ${tasks.join(", ")}`;
		const actual = fang._getColoredTask("build", tasks);

		expect(actual).to.be.equal(expected);
	});
});
