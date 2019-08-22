import fs from 'fs';
import getCss from './getCss';
import optimize from '@bitsy/optimizer';
import optimizeOptions from './input/optimization';

const fsp = fs.promises;

const fontName = 'ascii_small';

async function build() {
	const title = await fsp.readFile('./input/title.txt');
	const gamedata = await fsp.readFile('./input/gamedata.txt', 'utf8');
	
	const template = await fsp.readFile('./node_modules/Bitsy/editor/shared/other/exportTemplate.html', 'utf8');
	const bitsy = await fsp.readFile('./node_modules/Bitsy/editor/shared/script/bitsy.js');
	const font = await fsp.readFile('./node_modules/Bitsy/editor/shared/script/font.js');
	const dialog = await fsp.readFile('./node_modules/Bitsy/editor/shared/script/dialog.js');
	const script = await fsp.readFile('./node_modules/Bitsy/editor/shared/script/script.js');
	const color_util = await fsp.readFile('./node_modules/Bitsy/editor/shared/script/color_util.js');
	const transition = await fsp.readFile('./node_modules/Bitsy/editor/shared/script/transition.js');
	const renderer = await fsp.readFile('./node_modules/Bitsy/editor/shared/script/renderer.js');
	const fontData = await fsp.readFile(`./node_modules/Bitsy/editor/shared/bitsyfont/${fontName}.bitsyfont`);

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
		'</head>': ['<script>', hacks, '</script>', '</head>'].join('\n'),
	};

	const html = Object.entries(config)
		.reduce(
			(result, [key, value]) => result.replace(key, value),
			template
		);
	await fsp.writeFile('./index.html', html);
}

build()
	.then(() => console.log('👍'))
	.catch(err => console.error('👎\n', err));
