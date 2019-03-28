const pug = require("pug");
const rename = require("rename");
const { basename } = require("path");

const fangPug = options => fang => {
	fang.pluginName = "fang-pug";

	fang.files.forEach(file => {
		if (fang.options.debug) {
			fang.info(`rendering ${basename(file.path)}...`);
		}

		file.content = Buffer.from(
			pug.render(file.content.toString(), {
				filename: file.path,
				...options
			})
		);

		file.path = rename(file.path, {
			extname: ".html"
		});

		if (fang.options.debug) {
			fang.info(`rendered ${basename(file.path)}`);
		}

		return file;
	});

	return fang;
};

module.exports = fangPug;
