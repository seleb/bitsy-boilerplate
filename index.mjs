import fs from 'fs';
import getCss from './getCss';
import optimize from '@bitsy/optimizer';
import optimizeOptions from './input/optimization';
import resolve from 'resolve';
import externalDeps from './external-deps';

const fsp = fs.promises;

const fontName = 'ascii_small';

async function build() {
	const externalDepsSrc = await Promise.all(Object.keys(externalDeps).map(function (dep) {
		try {
			return fsp.readFile(resolve.sync(dep));
		}
		catch {
			try {
				return fsp.readFile(resolve.sync(dep, {basedir: resolve.sync('@bitsy/hecks')}));
			}
			catch {
				console.log(`couldn't find dependency '${dep}' in node modules\nyou might want to include it manually in html template`);
			}
		}
	}));

	const title = await fsp.readFile('./input/title.txt');
	const gamedata = await fsp.readFile('./input/gamedata.bitsy', 'utf8');
	const template = await fsp.readFile('./input/template.html', 'utf8');

	const bitsy = await fsp.readFile('./bitsy-source/scripts/bitsy.js');
	const font = await fsp.readFile('./bitsy-source/scripts/font.js');
	const dialog = await fsp.readFile('./bitsy-source/scripts/dialog.js');
	const script = await fsp.readFile('./bitsy-source/scripts/script.js');
	const color_util = await fsp.readFile('./bitsy-source/scripts/color_util.js');
	const transition = await fsp.readFile('./bitsy-source/scripts/transition.js');
	const renderer = await fsp.readFile('./bitsy-source/scripts/renderer.js');
	const fontData = await fsp.readFile(`./bitsy-source/fonts/${fontName}.bitsyfont`);

	const css = await getCss('./input/style.css');
	const hacks = await fsp.readFile(`./output/hacks.js`);

	const config = {
		'@@T': title,
		'@@D': Object.values(optimizeOptions).includes(true) ? optimize(gamedata, optimizeOptions) : gamedata,
		"@@C": css,
		'@@U': color_util,
		'@@X': transition,
		'@@F': font,
		'@@S': script,
		'@@L': dialog,
		'@@R': renderer,
		'@@E': bitsy,
		'@@N': fontName,
		'@@M': fontData,
		'</head>': ['<script>', externalDepsSrc.join('\n'), hacks, '</script>', '</head>'].join('\n'),
	};

	const html = Object.entries(config)
		.reduce(
			(result, [key, value]) => result.replace(key, value),
			template
		);

	try {
		await fsp.mkdir('./dist');
	}
	catch (err) {
		if (err.code !== 'EEXIST') console.error(err);
	}

	await fsp.writeFile('./dist/index.html', html);
}

build()
	.then(() => console.log('👍'))
	.catch(err => console.error('👎\n', err));
