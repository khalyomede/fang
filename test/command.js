const expect = require("chai").expect;
const { execSync } = require("child_process");

String.prototype.removeAnsiColor = function() {
	return this.replace(
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		""
	);
};

describe("command", () => {
	it("should run the command line without errors", function() {
		this.timeout(10000);

		expect(function() {
			execSync("node lib/cli.js build");
		}).to.not.throw(Error);
	});

	it("should return the list of tasks", function() {
		this.timeout(10000);

		const expected = "build: js, ts, html, pug, css, sass\n";
		const actual = execSync("node lib/cli.js --list")
			.toString()
			.removeAnsiColor();

		expect(actual).to.be.equal(expected);
	});

	it("should return the list of task (with the short option)", function() {
		this.timeout(10000);

		const expected = "build: js, ts, html, pug, css, sass\n";
		const actual = execSync("node lib/cli.js -l")
			.toString()
			.removeAnsiColor();

		expect(actual).to.be.equal(expected);
	});

	it("should return the correct version", () => {
		const version = require("../package.json").version;
		const expected = `fang ${version}`;
		const actual = execSync("node lib/cli.js --version");
	});

	it("should return the correct version (with the short version)", () => {
		const version = require("../package.json").version;
		const expected = `fang ${version}`;
		const actual = execSync("node lib/cli.js -v");
	});

	it("should return the help", () => {
		expect(function() {
			execSync("node lib/cli.js --help");
		}).to.not.throw(Error);
	});

	it("should return the help (with the short option)", () => {
		expect(function() {
			execSync("node lib/cli.js -h");
		}).to.not.throw(Error);
	});
});
