import fs from 'fs';
import getCss from './getCss';
import optimize from '@bitsy/optimizer';
import optimizeOptions from './input/optimization';
import resolve from 'resolve';

import {
	build as buildHacks
} from './build-hacks';

const fsp = fs.promises;

const fontName = 'ascii_small';

async function build() {
	const externalDeps = {};

	// specify what dependencies should be written to the output directly,
	// instead of being transpiled by rollup when building the hacks.
	// can reduce build time when dealing with large libraries like babylon (used by 3d hack)
	// further dependencies won't be resolved! only use on libraries that are bundled
	// and don't have any external dependencies on their own.
	// uncomment the following line if you are using 3d hack and need faster build time:
	// externalDeps.babylonjs = 'BABYLON';

	const externalDepsSrc = await Promise.all(Object.keys(externalDeps).map(function (dep) {
		try {
			return fsp.readFile(resolve.sync(dep));
		}
		catch {
			return fsp.readFile(resolve.sync(dep, {basedir: resolve.sync('@bitsy/hecks')}));
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
		'</head>': ['<script>', externalDepsSrc.join('\n'), (await buildHacks(['./input/hacks.js'],[],externalDeps))[0], '</script>', '</head>'].join('\n'),
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
	.then(() => console.log('😸'))
	.catch(err => console.error('😿\n', err));
