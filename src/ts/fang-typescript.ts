import * as typescript from "typescript";
import * as modifyFilename from "modify-filename";

const fangTypescript = (options = {}) => fang => {
	fang.files.map(file => {
		file.content = Buffer.from(
			typescript.transpileModule(file.content.toString(), options)
				.outputText
		);

		file.path = modifyFilename(
			file.path,
			(filename, extension) => filename + ".js"
		);

		return file;
	});

	return fang;
};

export = fangTypescript;
