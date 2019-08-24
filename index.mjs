import fse from 'fs-extra';
import getCss from './getCss';
import optimize from '@bitsy/optimizer';
import optimizeOptions from './input/optimization';
import resolve from 'resolve';
import externalDeps from './external-deps';

const fontName = 'ascii_small';

async function build() {
	const externalDepsSrc = await Promise.all(Object.keys(externalDeps).map(function (dep) {
		try {
			return fse.readFile(resolve.sync(dep));
		}
		catch {
			try {
				return fse.readFile(resolve.sync(dep, {basedir: resolve.sync('@bitsy/hecks')}));
			}
			catch {
				console.log(`couldn't find dependency '${dep}' in node modules\nyou might want to include it manually in html template`);
			}
		}
	}));

	const title = await fse.readFile('./input/title.txt');
	const gamedata = await fse.readFile('./input/gamedata.bitsy', 'utf8');
	const template = await fse.readFile('./input/template.html', 'utf8');

	const bitsy = await fse.readFile('./.working/bitsy/scripts/bitsy.js');
	const font = await fse.readFile('./.working/bitsy/scripts/font.js');
	const dialog = await fse.readFile('./.working/bitsy/scripts/dialog.js');
	const script = await fse.readFile('./.working/bitsy/scripts/script.js');
	const color_util = await fse.readFile('./.working/bitsy/scripts/color_util.js');
	const transition = await fse.readFile('./.working/bitsy/scripts/transition.js');
	const renderer = await fse.readFile('./.working/bitsy/scripts/renderer.js');
	const fontData = await fse.readFile(`./.working/bitsy/fonts/${fontName}.bitsyfont`);

	const css = await getCss('./input/style.css');
	const hacks = await fse.readFile(`./.working/hacks.js`);

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

	await fse.outputFile('./output/index.html', html);
}

build()
	.then(() => console.log('👍'))
	.catch(err => console.error('👎\n', err));
