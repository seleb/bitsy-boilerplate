export default {
	// specify what dependencies should be written to the output directly,
	// instead of being transpiled by rollup when building the hacks
	// in some cases (e.g. babylonjs for the 3D hack, shown below)
	// this will result in a drastically faster build
	// if dependency isn't installed as an npm module,
	// make sure to add it manually to html template

	// 'babylonjs': 'window.BABYLON',
};
