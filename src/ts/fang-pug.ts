import * as path from "path";
import * as pug from "pug";

const fangPug = (options: object) => fang => {
	fang.files.map(file => {
		file.content = Buffer.from(
			pug.render(file.content.toString(), {
				filename: path.basename(file.path),
				...options
			})
		);

		return file;
	});

	return fang;
};

export = fangPug;
