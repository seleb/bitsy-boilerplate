import fse from 'fs-extra';
import fetch from 'node-fetch';
import path from 'path';
import prompts from 'prompts';
import bitsyPaths from './bitsy-paths.json' assert { type: "json" };

const bitsySourceUrl = 'https://raw.githubusercontent.com/le-doux/bitsy';
const latest = 'master';
const safeCommit = '5b9a239c74b47b0f6309effc3f6f550727a77cde';

async function fetchFile(url, savePath) {
	console.log(`fetching ${path.basename(savePath)}`);
	let response;
	try {
		response = await fetch(url);
	} catch (err) {
		throw new Error(`${url} is not available\n${err}`);
	}

	if (response.ok) {
		return fse.outputFile(savePath, await response.text());
	} else {
		throw new Error(`couldn't download ${url}\nresponse status code: ${response.status}`);
	}
}

async function fetchBitsyFiles(version = safeCommit) {
	console.log('installing bitsy files');
	const templateExists = await fse.pathExists('./input/template.html');
	if (templateExists) {
		const response = await prompts({
			type: 'confirm',
			name: 'confirmed',
			message: "template.html already exists. do you want to overwrite it?\n  (consider making a backup first if you don't want to lose your work)\n",
		});
		if (!response.confirmed) {
			return;
		}
	}

	// arrays of paths into array of promises
	// reference: https://github.com/le-doux/bitsy/blob/2a36b8d559fe1ccf54704f205f0745e3f947330c/editor/script/exporter.js#L31
	return Promise.all(Object.values(bitsyPaths).map(([repoPath, savePath]) => (
		fetchFile([bitsySourceUrl, version, repoPath].join('/'), savePath)
	)));
}

fetchBitsyFiles(latest)
	.then(() => console.log('😸'))
	.catch(err => {
		console.error('😿');
		console.error(err);
	});
