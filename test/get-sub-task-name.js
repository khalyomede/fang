const expect = require("chai").expect;
const fang = require("./../lib/main");
const cliColor = require("cli-color");

describe("_getSubTaskName", () => {
	it('should return "?" if the subtask has no name', () => {
		fang._subTask = {};

		const expected = "?";
		const actual = fang._getSubTaskName();

		expect(actual).to.be.equal(expected);
	});

	it("should return the task name if the subtask has a name", () => {
		fang._subTask = { name: "sass" };

		const expected = "sass";
		const actual = fang._getSubTaskName();

		expect(actual).to.be.equal(expected);
	});
});
