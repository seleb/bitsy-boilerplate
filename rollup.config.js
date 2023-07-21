import base from "@bitsy/hecks/rollup.config.base.json" assert { type: "json" };
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import external from "./external-deps.mjs";

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
