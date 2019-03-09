import * as htmlMinifier from "html-minifier";

const defaultOptions = {
	collapseBooleanAttributes: true,
	collapseInlineTagWhitespace: true,
	collapseWhitespace: true,
	removeAttributeQuotes: true,
	removeComments: true,
	removeEmptyAttributes: true,
	removeRedundantAttributes: true,
	useShortDoctype: true
};

const fangHtmlMinifier = (options = defaultOptions) => fang => {
	fang.files.map(file => {
		file.content = Buffer.from(
			htmlMinifier.minify(file.content.toString(), options)
		);

		return file;
	});

	return fang;
};

export = fangHtmlMinifier;
