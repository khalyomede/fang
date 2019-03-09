import * as uglify from "uglify-es";

const fangUglify = () => fang => {
	fang.files = fang.files.map(file => {
		file.content = Buffer.from(uglify.minify(file.content.toString()).code);

		return file;
	});

	return fang;
};

export = fangUglify;
