const fang = require("./lib/main");
const uglify = require("./lib/fang-uglify");
const htmlMinifier = require("./lib/fang-html-minifier");
const cleanCss = require("./lib/fang-clean-css");
const autoprefixer = require("./lib/fang-autoprefixer");
const fangPug = require("./lib/fang-pug");
const typescript = require("./lib/fang-typescript");
const fangSass = require("./lib/fang-sass");
const babel = require("./lib/fang-babel");

const js = () =>
	fang
		.from("example/src/js/**/*.js")
		.do(babel())
		.do(uglify())
		.save("example/dist/js");

const html = () =>
	fang
		.from("example/src/html/**/*.html")
		.do(htmlMinifier())
		.save("example/dist/html");

const css = () =>
	fang
		.from("example/src/css/**/*.css")
		.do(autoprefixer())
		.do(cleanCss())
		.save("example/dist/css");

const pug = () =>
	fang
		.from("example/src/pug/**/*.pug")
		.do(fangPug())
		.save("example/dist/pug");

const ts = () =>
	fang
		.from("example/src/ts/**/*.ts")
		.do(
			typescript({
				target: "ES3"
			})
		)
		.do(babel())
		.save("example/dist/ts");

const sass = () =>
	fang
		.from("example/src/sass/**/*.sass")
		.do(fangSass())
		.save("example/dist/css");

const build = [js, ts, html, pug, css, sass];

module.exports = { build };
