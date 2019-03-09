import * as postcss from "postcss";
import * as autoprefixer from "autoprefixer";

const fangAutoprefixer = () => fang => {
	fang.files.map(file => {
		file.content = Buffer.from(
			postcss([autoprefixer]).process(file.content.toString()).css
		);

		return file;
	});

	return fang;
};

export = fangAutoprefixer;
