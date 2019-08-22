import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import base from "@bitsy/hecks/rollup.config.base";

const external = {};

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
