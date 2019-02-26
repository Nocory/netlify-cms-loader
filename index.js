const yaml = require('js-yaml')
const path = require('path')
const matter = require('gray-matter')
const marked = require("marked")
const loaderUtils = require("loader-utils")

const parseFile = (content) => {
	const firstLine = content.substr(0, content.indexOf('\n')).trim()
	
	switch (firstLine) {
	case '---':
		return matter(content)
	case '{':
		const parsedContent = JSON.parse(content)
		//console.log(parsedContent)
		const result = Object.entries(parsedContent).reduce((acc,val) => {
			if(val[0] != "body") acc.data[val[0]] = val[1]
			return acc
		},{
			data: {},
			content: parsedContent.body
		})
		return result
	default:
		throw new Error('netlify-cms-loader: Unrecognized format, when attempting to parse file')
	}
}

const loaderFnc = function(source) {
	this.cacheable(true)
	
	this.addDependency(source || path.resolve(process.env.NETLIFY_CMS_LOADER_CONFIG))

	const cmsConfig = yaml.safeLoad(this.fs.readFileSync(source || path.resolve(process.env.NETLIFY_CMS_LOADER_CONFIG)))

	// Merging default and user specified options
	const options = {
		collection: null,
		file: null,

		parseBody: true,
		includeBody: false,
		fields: [],
		
		reverse: false,
		limit: 0,
		
		emitJSON: true,
		outputDirectory: "cms"
	}
	
	let passedOptions = loaderUtils.getOptions(this)
	if(Object.keys(passedOptions).length == 1 && !passedOptions.collection){
		passedOptions = {collection: Object.keys(passedOptions)[0]}
	}
	[passedOptions.collection,passedOptions.file] = passedOptions.collection.split("/")
	//console.log("passedOptions:",passedOptions)
	Object.assign(options, passedOptions)
	
	// Determine which collection should be processed
	const collection = cmsConfig.collections.find((el) => el.name === options.collection)
	if (!collection) {
		throw new Error(`netlify-cms-loader: collection '${options.collection}' not found. Available collections are [${cmsConfig.collections.map(x => x.name)}]`)
	}

	console.time(`netlify-cms-loader: finished loading collection '${options.collection}'`)
	const result = []
	let filesInCollection = []
	if(collection.folder){
		this.addContextDependency(collection.folder)
		filesInCollection = this.fs.readdirSync(collection.folder).map(x => ({
			srcPath: path.resolve(collection.folder,x),
			name: path.basename(x,path.extname(x))
		}))
	}
	if(collection.files){
		if(options.file){
			const foundItem = collection.files.find((el) => el.name === options.file)
			if (!foundItem) {
				throw new Error(`netlify-cms-loader: file '${options.file}' not found in collection ${collection.name}. Available files are [${collection.files.map(x => x.name)}]`)
			}
			filesInCollection = [{
				srcPath: path.resolve(foundItem.file),
				name: foundItem.name
			}]
		}else{
			filesInCollection = collection.files.map(x => ({
				srcPath: path.resolve(x.file),
				name: x.name,
			}))
		}
	}

	filesInCollection.forEach(x => {
		this.addDependency(x.srcPath)
	})

	filesInCollection.sort((a,b) => {
		if(a.srcPath < b.srcPath) return 1
		if(a.srcPath > b.srcPath) return -1
		return 0
	})
	if (options.reverse) filesInCollection.reverse()
	if (options.limit) filesInCollection = filesInCollection.slice(0,options.limit)

	//console.log("netlify-cms-loader filesInCollection:",filesInCollection)
	for (const fileInfo of filesInCollection) {
		//console.log("fileInfo",fileInfo)
		const fileContent = this.fs.readFileSync(fileInfo.srcPath).toString()
		const matterFile = parseFile(fileContent)
		const cmsEntry = matterFile.data

		if(typeof matterFile.content === "string" && matterFile.content.trim().length){
			cmsEntry.hasBody = true
			if (options.includeBody) {
				cmsEntry.body = options.parseBody ? marked(matterFile.content) : matterFile.content
			}
		}
		
		if(options.emitJSON){
			cmsEntry.filePath = path.join(options.outputDirectory,collection.name,fileInfo.name + ".json")
			const jsonOut = Object.assign({},cmsEntry)
			if(jsonOut.hasBody && !jsonOut.body) jsonOut.body = options.parseBody ? marked(matterFile.content) : matterFile.content
			this.emitFile(cmsEntry.filePath, JSON.stringify(jsonOut, null, "\t"))
		}

		if(options.fields.length){
			const limitedResult = {}
			for(const key in cmsEntry){
				if(options.fields.includes(key)){
					limitedResult[key] = cmsEntry[key]
				}
			}
			if(cmsEntry.hasBody) limitedResult.hasBody = cmsEntry.hasBody
			if(cmsEntry.filePath) limitedResult.filePath = cmsEntry.filePath
			result.push(limitedResult)
		}else{
			result.push(cmsEntry)
		}
	}
	console.timeEnd(`netlify-cms-loader: finished loading collection '${options.collection}'`)

	return `module.exports = ${JSON.stringify(options.file ? result[0] : result)}`
}

module.exports = loaderFnc