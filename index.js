const yaml = require('js-yaml')
const path = require('path')
const fm = require('front-matter')
const marked = require("marked")
//const md = require('markdown-it')()
const loaderUtils = require("loader-utils")

let isMediaCopied = false

const loaderFnc = function(source) {
	this.cacheable()

	const cmsConfig = yaml.safeLoad(source)

	// Merging default and user specified options
	const options = {
		collection: "",
		bodyLimit: 256,
		emitSource: false,
		emitJSON: true,
		parseBody: true,
		sortBy: "",
		reverse: false,
		outputDirectory: "cms"
	}
	Object.assign(options, loaderUtils.getOptions(this))

	// Copy upload/file assets only ONCE to the build directory
	if (!isMediaCopied) {
		console.time("netlify-cms-loader: copied media files")
		const filesInCollection = this.fs.readdirSync(cmsConfig.media_folder)
		for (let fileName of filesInCollection) {
			let fileContent = this.fs.readFileSync(path.resolve(cmsConfig.media_folder, fileName))
			this.emitFile(path.join(cmsConfig.public_folder, fileName), fileContent)
		}
		isMediaCopied = true
		console.timeEnd("netlify-cms-loader: copied media files")
	}

	// Check collection is valid, otherwise exit with error //TODO: improve (see error message)
	if (!options.collection) {
		throw new Error("netlify-cms-loader: no collection specified")
	}
	const collection = cmsConfig.collections.find((el) => el.name === options.collection)
	if (!collection) {
		throw new Error(`netlify-cms-loader: collection '${options.collection}' not found. Available collections are [${cmsConfig.collections.map(x => x.name)}]`)
	}

	console.time(`netlify-cms-loader: finished loading collection '${options.collection}'`)

	const result = []

	const filesInCollection = this.fs.readdirSync(collection.folder)
	for (let fileName of filesInCollection) {
		let fileContent = this.fs.readFileSync(path.resolve(collection.folder, fileName), {
			encoding: 'utf8'
		}) //FIXME: encoding not working?? Have to convert to string
		fileContent = fileContent.toString()
		let fmContent = fm(fileContent)
		let cmsEntry = fmContent.attributes

		if(fmContent.body){
			cmsEntry.hasBody = true
			if (fmContent.body.length < options.bodyLimit) {
				cmsEntry.body = options.parseBody ? marked(fmContent.body) : fmContent.body
			}
		}else{
			cmsEntry.hasBody = false
		}

		// Automatically emit CMS .md files to the build directory as .md and .json, unless specified otherwise by options
		let mdPath = path.join(options.outputDirectory, collection.name, fileName)
		if (options.emitSource) {
			cmsEntry.filePath = mdPath
			this.emitFile(mdPath, fileContent)
		}
		if(options.emitJSON){
			const jsonPath = mdPath.replace(/\.md$/,".json")
			cmsEntry.filePath = jsonPath
			const jsonOut = Object.assign({},cmsEntry)
			if(jsonOut.hasBody && !jsonOut.body) jsonOut.body = options.parseBody ? marked(fmContent.body) : fmContent.body
			this.emitFile(jsonPath, JSON.stringify(jsonOut))
		}

		result.push(cmsEntry)
	}

	if (result.length >= 2 &&
		options.sortBy &&
		result[0][options.sortBy]) {
		//console.log("SORTING")
		let isNumber = Date.parse(result[0][options.sortBy]) || Number(result[0][options.sortBy])
		//console.log("isNumber", isNumber)
		if (isNumber) {
			//console.log("sorting by num")
			result.sort((a, b) => a[options.sortBy] - b[options.sortBy])
		} else {
			//console.log("sorting by str")
			result.sort((a, b) => {
				let nameA = a[options.sortBy].toUpperCase()
				let nameB = b[options.sortBy].toUpperCase()
				if (nameA < nameB) return -1
				if (nameA > nameB) return 1
				return 0
			})
		}
	}

	if (options.reverse) result.reverse()

	console.timeEnd(`netlify-cms-loader: finished loading collection '${options.collection}'`)

	return `module.exports = ${JSON.stringify(result)}`
}

module.exports = loaderFnc