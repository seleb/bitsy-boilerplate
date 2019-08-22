import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import base from "@bitsy/hecks/rollup.config.base";

const external = {
	// entries here can be used to separate dependencies from the generated bundle
	// in some cases (e.g. babylonjs for the 3D hack, shown below)
	// this will result in a drastically faster build,
	// but remember that the dependency will need to be included manually after the fact

	// 'babylonjs': 'window.BABYLON',
};

export default {
	...base,
	input: './input/hacks',
	plugins: [
		nodeResolve(),
		commonjs(),
	],
	external: [
		...base.external,
		...Object.keys(external),
	],
	output: {
		...base.output,
		globals: {
			...base.output.globals,
			...external,
		},
		file: './output/hacks.js',
	},
};
