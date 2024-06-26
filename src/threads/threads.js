
const {Worker} = require('worker_threads');
const path = require('path');

/**
 * @returns {Promise}
 */

module.exports.createThread = ({fileName, data})=>{
	if(!fileName) return 'file name required';
	return new Promise((resolve, reject)=>{
		const worker = new Worker(path.join(path.resolve(),`src/threads/${fileName}`),{workerData:data});
		worker.on('message', (d)=>{resolve(d);});
		worker.on('error',(e)=>{reject(e);} );
	});   
};


// call example
// const tr = await createThread({fileName:"example.js", data:"user data"})
// console.log( await tr);