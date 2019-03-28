const fang = require("./lib/main");
const fangPug = require("./example/plugin/fang-pug");

const pug = () =>
	fang
		.from("example/src/pug/**/*.pug")
		.do(fangPug())
		.save("example/dist/pug");

const build = [pug];

module.exports = { build };
