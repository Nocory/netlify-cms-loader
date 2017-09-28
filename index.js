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

const loaderFnc = function (source) {
	console.time("Netlify-CMS Loader")
	this.cacheable()

	const cmsConfig = yaml.safeLoad(source)
	const options = loaderUtils.getOptions(this)

	if (!options.collection) {
		this.emitError("no collection specified")
	}

	/*** OPTIONS ***
		collection (String: "posts") => specify which collection should be processed 
		bodyLimit (Number: 128) => include markdown body in the results, if length is less than specified
		TODO: sortBy (String: "") => sort objects in result array by this property
		TODO: reverse (Bool: false) => reverse result array
		TODO: itemLimit (Number: 0) => First n items to get from the collection. (this happens after any sorting or reversing)
	***************/

	const collection = cmsConfig.collections.find((el) => el.name === (options.collection || "posts"))

	if (!collection) {
		this.emitError("collection not found in config")
	}

	const collectioneHasBody = checkForBody(collection)

	let result = []

	const filesInCollection = this.fs.readdirSync(collection.folder)
	for (let fileName of filesInCollection) {
		let fileContent = this.fs.readFileSync(path.resolve(collection.folder, fileName), {
			encoding: 'utf8'
		}) //FIXME: encoding not working?? Have to convert to string
		fileContent = fileContent.toString()
		let fmContent = fm(fileContent)
		let cmsEntry = fmContent.attributes

		if (fmContent.body.length < (options.bodyLimit || 128)) {
			cmsEntry.body = fmContent.body
		}

		cmsEntry.filename = fileName
		cmsEntry.hasBody = collectioneHasBody
		result.push(cmsEntry)
	}

	/*
	if (options.sortBy || "") {
		result.sort((a, b) => {
			return a[sortBy] - b[sortBy]
		})
	}

	if (options.reverse || false) {
		result.sort((a, b) => {
			return a[sortBy] - b[sortBy]
		})
	}

	// Trim array if itemlimit is pecified in options
	if (options.itemLimit || 0) {
		result = result.slice(0, options.itemLimit)
	}
	*/

	console.log("======================")
	console.timeEnd("Netlify-CMS Loader")
	console.log("======================")

	return `module.exports = ${JSON.stringify(result)}`
}

module.exports = loaderFnc