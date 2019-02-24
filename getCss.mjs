import fs from 'fs';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

export default async function (filename) {
	const rawCss = await new Promise((resolve, reject) => fs.readFile(filename, 'utf8', (err, data) => err ? reject(err) : resolve(data)));
	const css = await postcss([autoprefixer()]).process(rawCss, {
		from: filename,
	});
	return css;
}
