// es6 import syntax doesn't work with request-promise-native at the moment
// https://github.com/request/request-promise-native/issues/1
const fse = require('fs-extra');
const path = require('path');
const rp = require('request-promise-native');
const prompts = require('prompts');

const bitsySourceUrl = 'https://raw.githubusercontent.com/le-doux/bitsy';
const latest = 'master';
const safeCommit = '5b9a239c74b47b0f6309effc3f6f550727a77cde';

async function fetchFile(url, savePath) {
	console.log(`fetching ${path.basename(savePath)}`);
	const requestOptions = {
		method: 'GET',
		uri: url,
		resolveWithFullResponse: true
	}

	let response;
	try {
		response = await rp(requestOptions);
	}
	catch (err) {
		throw new Error(`${url} is not available\n${err.error}`);
	}

	if (response && response.statusCode == 200) {
		return fse.outputFile(savePath, response.body);
	} else {
		throw new Error(`couldn't download ${url}\nresponse status code: ${response && response.statusCode}`);
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

	const paths = JSON.parse(await fse.readFile('./bitsy-paths.json'));
	// arrays of paths into array of promises
	return Promise.all(Object.values(paths).map(([repoPath, savePath]) => (
		fetchFile([bitsySourceUrl, version, repoPath].join('/'), savePath)
	)));
}

fetchBitsyFiles(latest)
	.then(x => console.log('😸'))
	.catch(err => {
		console.error('😿');
		console.error(err);
	});
