import * as babel from "@babel/core";
import { basename } from "path";
import * as fancyLog from "fancy-log";
import * as cliColor from "cli-color";

const fangBabel = (options = {}) => fang => {
	fang.files.map(file => {
		file.content = Buffer.from(
			babel.transformSync(file.content.toString(), options).code
		);

		if (fang.options.debug) {
			const fileName = cliColor.magenta(basename(file.path));

			fancyLog.info(`${fileName}: transpiled`);
		}

		return file;
	});

	return fang;
};

export = fangBabel;
