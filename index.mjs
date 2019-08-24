import fse from 'fs-extra';
import getCss from './getCss';
import optimize from '@bitsy/optimizer';
import optimizeOptions from './input/optimization';
import resolve from 'resolve';
import externalDeps from './external-deps';
import bitsyPaths from './bitsy-paths.json';

const fontName = 'ascii_small';

async function build() {
	const externalDepsSrc = await Promise.all(Object.keys(externalDeps).map(function (dep) {
		try {
			return fse.readFile(resolve.sync(dep));
		} catch {
			try {
				return fse.readFile(resolve.sync(dep, {
					basedir: resolve.sync('@bitsy/hecks')
				}));
			} catch {
				console.log(`couldn't find dependency '${dep}' in node modules\nyou might want to include it manually in html template`);
			}
		}
	}));

	const title = await fse.readFile('./input/title.txt');
	const gamedata = await fse.readFile('./input/gamedata.bitsy', 'utf8');
	const template = await fse.readFile(bitsyPaths.template[1], 'utf8');

	const fontData = await fse.readFile(bitsyPaths[fontName][1]);

	const css = await getCss('./input/style.css');
	const hacks = await fse.readFile(`./.working/hacks.js`);
	const bitsyScripts = await Promise.all(
		Object.entries(bitsyPaths) // get all the bitsy files
		.filter(([key]) => key.startsWith('@@')) // filter out non-scripts
		.map(async ([key, [, path]]) => [key, await fse.readFile(path)]) // convert to map of promises resolving with [key, script]
	);

	const config = {
		'@@T': title,
		'@@D': Object.values(optimizeOptions).includes(true) ? optimize(gamedata, optimizeOptions) : gamedata,
		"@@C": css,
		'@@N': fontName,
		'@@M': fontData,

		...bitsyScripts.reduce((r, [key, file]) => ({
			...r,
			[key]: file,
		}), {}),

		'</head>': `${externalDepsSrc.concat(hacks).map(s => `<script>\n${s}\n</script>`).join('\n')}\n</head>`,
	};

	const html = Object.entries(config)
		.reduce(
			(result, [key, value]) => result.replace(key, value),
			template
		);

	await fse.outputFile('./output/index.html', html);
}

build()
	.then(() => console.log('👍'))
	.catch(err => console.error('👎\n', err));
