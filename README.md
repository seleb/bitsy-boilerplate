# bitsy-boilerplate

tool for building bitsy games

the idea behind this is sort of like a scripted version of [Borksy](https://ayolland.itch.io/borksy); you can set up hacks and etc once, and then paste gamedata in after changing it in bitsy

## how

1. run `npm i`
	* optionally add path to your local bitsy-hacks repo:
	`npm i /path/to/local/bitsy-hacks && npm run fetch-bitsy`
1. copy-paste your gamedata into `./input/gamedata.bitsy`
1. edit `./input/title.txt` to be what you want the HTML title to be
1. edit `./input/style.css` with custom style
1. edit `./input/hacks.js` with hack inputs/options
1. edit `./input/optimization.js` with optimization options
1. edit `./input/template.html` to add custom html, for example if you need to add audio
1. edit `./external-deps.mjs` to specify what dependencies should be written to the output directly instead of being transpiled by rollup when building the hacks. in case with large libraries like babylonjs used by 3d hack, this will drastically reduce build time
1. run `npm start` or `npm run build`
	- `start` will watch the input files and rebuild automatically when they're changed
	- `build` will run once
1. edit/rebuild as needed
1. copy the generated `./dist/index.html` when you're done

## why

- builds from bitsy repo source
	- i.e. unpublished features
- builds from bitsy-hacks (`@bitsy/hecks`) module
	- easy to combine hacks/customize their `hackOptions`
	- easy setup for writing/testing new hacks
	- smaller output when combining hacks (e.g. kitsy is only ever included once)
- style is run through [autoprefixer](https://github.com/postcss/autoprefixer)
- optionally optimizes gamedata for smaller final builds

caveats:

- builds from bitsy repo source
	- i.e. unpublished bugs
- custom hacks here use absolute imports, whereas ones in the hack repo are relative
	- e.g. `import '@bitsy/hecks/src/bitsymuse';` vs. `import './bitsymuse';`

## examples for editing `./input/hacks.js`

importing a hack from the hack repo:

```js
import '@bitsy/hecks/src/gamepad input';
```

combining hacks:

```js
import '@bitsy/hecks/src/exit-from-dialog';
import '@bitsy/hecks/src/end-from-dialog';
```

customizing hack options:

```js
import { hackOptions as bitsymuse } from '@bitsy/hecks/src/bitsymuse';
import { hackOptions as solidItems } from '@bitsy/hecks/src/solid items';

// customize music for bitsymuse
bitsymuse.musicByRoom = {
	'outdoors': 'bgm',
	'dungeon': 'bgm-dark'
};

// customize solid check to include anything with "SOLID" in the name
solidItems.itemIsSolid = function(item) {
	return item.name.indexOf('SOLID') !== -1;
};
```

writing a custom hack:

```js
import {
	after,
	addDialogTag,
} from "@bitsy/hecks/src/helpers/kitsy-script-toolkit";
import { printDialog } from "@bitsy/hecks/src/helpers/utils";

// save time on start
var startTime;
after('startExportedGame', function() {
	startTime = new Date().toString();
});

// print start time
addDialogTag('startTime', function(environment) {
	printDialog(environment, startTime, onReturn);
});
```
