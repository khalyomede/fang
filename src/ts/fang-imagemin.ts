import * as imagemin from "imagemin";

const fangImagemin = () => fang => {
	fang.files.map(file => {
		console.log("start", file.path, file.content.length);
		imagemin.buffer(file.content).then(buffer => {
			file.content = buffer;

			console.log("end", file.path, file.content.length);
			return file;
		});

		return file;
	});

	return fang;
};

export = fangImagemin;
