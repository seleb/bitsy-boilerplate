import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import base from "@bitsy/hecks/rollup.config.base";
import external from "./external-deps";

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
		file: './.working/hacks.js',
	},
};
