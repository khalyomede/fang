const expect = require("chai").expect;
const fang = require("../lib/main");
const { cpus } = require("os");
const { resolve } = require("path");

describe("fang", () => {
	describe("errors", () => {
		it("should throw an error if no options is given", () => {
			expect(function() {
				fang.run();
			}).to.throw(Error);
		});

		it("should throw an error if no task name is given", () => {
			expect(function() {
				fang.run({});
			}).to.throw(Error);
		});

		it("should throw an error if the task could not be found", () => {
			expect(function() {
				fang.run({
					taskName: "not found"
				});
			}).to.throw(Error);
		});

		it("should throw an error message if no options is given", () => {
			expect(function() {
				fang.run();
			}).to.throw("the options should be an object (got: undefined)");
		});

		it("should throw an error message if no task name is given", () => {
			expect(function() {
				fang.run({});
			}).to.throw("the task name is missing");
		});

		it("should throw an error message if the task could not be found", () => {
			expect(function() {
				fang.run({
					taskName: "not found"
				});
			}).to.throw(`task "not found" not found`);
		});
	});

	describe("from", () => {
		it("should return a Fang instance", () => {
			const expected = fang;
			const actual = fang.from("example/src/js/**/*.js");

			expect(actual).to.be.an.instanceof(expected);
		});

		it("should return an empty option list", () => {
			const expected = {
				maxCore: cpus().length,
				tasksPath: resolve(__dirname + "/../fang.js"),
				taskName: "not found"
			};
			const actual = fang.from("example/src/js/**/*.js").options;

			expect(actual).to.be.deep.equal(expected);
		});
	});

	describe("save", () => {
		it("should return a promise", () => {
			const expected = Promise;
			const actual = new fang().save();

			expect(actual).to.be.an.instanceof(expected);
		});
	});
});
