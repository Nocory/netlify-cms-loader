/* OPTIONS

	collection (default: "") => specify which collection should be processed 
	bodyLimit (default: 256) => include markdown body in the results, if length is less than specified

	copyFiles (default true) => copy the processed .md files to the output directory
	copyMedia (default true) => copy content from the media folder to the output directory
	sortBy (default "")
	reverse (default false)

	outputDirectory (default: "cms") => .md files are copied to "[outputDirectory]/[collection-name]/[file-name]"

*/
const yaml = require('js-yaml')
const path = require('path')
const fm = require('front-matter')
const loaderUtils = require("loader-utils")

const checkForBody = (collection) => {
	for (let field of collection.fields) {
		if (field.name === "body") return true
	}
	return false
}

let copiedFiles = new Set()
let isMediaCopied = false

const loaderFnc = function(source) {
	console.time("netlify-cms-loader")
	this.cacheable()

	const cmsConfig = yaml.safeLoad(source)

	// Merging default and user specified options
	const options = {
		collection: "posts",
		bodyLimit: 256,
		copyFiles: true,
		copyMedia: true,
		sortBy: "",
		reverse: false,
		outputDirectory: "cms"
	}
	Object.assign(options, loaderUtils.getOptions(this))

	// Copy upload/file assets only ONCE to the build directory
	if (options.copyMedia && !isMediaCopied) {
		const filesInCollection = this.fs.readdirSync(cmsConfig.media_folder)
		for (let fileName of filesInCollection) {
			let fileContent = this.fs.readFileSync(path.resolve(cmsConfig.media_folder, fileName))
			this.emitFile(path.join(cmsConfig.public_folder, fileName), fileContent)
		}
		isMediaCopied = true
	}

	// Check collection is valid, otherwise exit with error //TODO: improve (see error message)
	if (!options.collection) {
		this.emitError("no collection specified")
	}
	const collection = cmsConfig.collections.find((el) => el.name === options.collection)
	if (!collection) {
		this.emitError("collection not found in config")
	}

	/*
		Check if items of the collection have a body. This is assigned to the '.hasBody' property.
		Since not all collections might have markdown bodies, this info can be useful to decide,
		whether the .md file needs to be fetched by the app.
	*/
	const collectionHasBody = checkForBody(collection)

	let result = []

	const filesInCollection = this.fs.readdirSync(collection.folder)
	for (let fileName of filesInCollection) {
		let fileContent = this.fs.readFileSync(path.resolve(collection.folder, fileName), {
			encoding: 'utf8'
		}) //FIXME: encoding not working?? Have to convert to string
		fileContent = fileContent.toString()
		let fmContent = fm(fileContent)
		let cmsEntry = fmContent.attributes

		cmsEntry.hasBody = collectionHasBody
		if (collectionHasBody && fmContent.body.length < options.bodyLimit) {
			cmsEntry.body = fmContent.body
		}

		// Automatically copying CMS .md files to the build directory, unless specified otherwise by options
		let copyPath = path.join(options.outputDirectory, collection.name, fileName)
		if (options.copyFiles && !copiedFiles.has(copyPath)) {
			this.emitFile(copyPath, fileContent)
			copiedFiles.add(copyPath)
			cmsEntry.filePath = copyPath
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

	console.log("======================")
	console.log(`Loaded CMS collection: ${collection.name}`)
	console.timeEnd("netlify-cms-loader")
	console.log("======================")

	return `module.exports = ${JSON.stringify(result)}`
}

module.exports = loaderFnc