import * as sass from "node-sass";
import * as modifyFilename from "modify-filename";
import { basename, dirname } from "path";

const fangSass = options => fang => {
	fang.files.map(file => {
		const indentedSyntax = basename(file.path).endsWith(".sass");
		const folder = dirname(file.path);

		file.content = sass.renderSync({
			data: file.content.toString(),
			indentedSyntax: indentedSyntax,
			includePaths: [folder],
			...options
		}).css;

		file.path = modifyFilename(
			file.path,
			(filename, extension) => filename + ".css"
		);

		return file;
	});

	return fang;
};

export = fangSass;
