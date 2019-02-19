## netlify-cms-loader 0.5.2

A webpack loader to require() content from the [Netlify CMS](https://www.netlifycms.org/) in your website or single-page-application.

The loader processes the .md files of a collection and outputs their content and file path as an array of objects.

**Note:** This is a 3rd-party loader. I am in no way affiliated with [Netlify](https://www.netlify.com/), though I wholeheartedly recommend anyone to check them out.

**Breaking changes can occur in minor releases before v1.0.0 and not all CMS use cases are covered in the current version.**

**I do not reccommend to use this in any important production environment.**

---
#### Loader options (and defaults)
* ```collection``` *("", **required**)* Name of the collection you want to retrieve.
* ```bodyLimit``` *(256)* Include body in the loaders output, if body-length is less than specified. This can save http-requests for smaller entries later on.
* ```emitSource``` *(false)* Copy unprocessed .md files to the output directory.
* ```emitJSON``` *(true)* Emit file converted to JSON to the output directory. (you can set this to false if you only need the object returned from the loader)
* ```parseBody``` *(true)* Parse the .md files markdown body and include the resulting HTML in the loaders output and the emitted JSON file.
* ```sortBy``` *("")* Name of widget the output should be sorted by.
* ```reverse``` *(false)* Reverse output array. Useful for sorting by date with newest item coming first.
* ```outputDirectory``` *("cms")* This is where emitted files are written to. The final path is "outputDirectory/collection/filename.(json|md)".

---
#### Using the loader
require() your Netlify CMS config file with the loader inline.

You must at least specify the name of the collection, that you want to retreive information about. The remaining options have fairly sane defaults, but can always be changed to your liking.

```javascript
const cmsPosts = require(`netlify-cms-loader?{
	collection:'posts',
	sortBy:'date',
	reverse:true,
}!admin/config.yml`)
```
Alternatively with deprecated query strings:
```javascript
const cmsPosts = require('netlify-cms-loader?collection=posts&sortBy=date&reverse=true!admin/config.yml')
```

The loaders output is an array of objects, corresponding to the processed markdown files of the collection.

In addition to each files front-matter, the loader adds two additional properties ***filePath*** and ***hasBody*** . (Please make sure, that these don't collide with the fields from your CMS collection. This might be addressed in future versions, if it turns out to be an issue.)

If the `emitJSON` option is true, then ***filePath*** always points to the .json file in the `outputDirectory`. If `emitJSON` is false, but `emitSource` is true, then ***filePath*** will point to the emitted .md file instead.

***hasBody*** indicates, whether the entry has a ***body***. If ***hasBody*** is true, but no ***body*** is present on the object, then this can let the app know, that it should fetch the emitted .json (or .md) file to get the required data.

###### Example output of the loader:
```javascript
require(`netlify-cms-loader?{
	collection:'posts',
	outputDirectory:'cms_alt',
	sortBy:'date',
	reverse:true,
}!admin/config.yml`)
// will make the laoder output the following:
[{
	title: "Long blog post",
	image: "/uploads/hero_image.jpg",
	filePath: "cms_alt/posts/2017-09-20-long-blog-post.json",
	hasBody: true
}, {
	title: "A short story",
	image: "/uploads/placeholder.jpg",
	filePath: "cms_alt/posts/2017-09-22-a-short-story.json",
	hasBody: true,
	body: "This body is short enough to be included right away"
}, {
	title: "A longer story",
	image: "/uploads/test.jpg",
	filePath: "cms_alt/posts/2017-09-23-a-longer-story.json",
	hasBody: true
}]
```
```javascript
require(`netlify-cms-loader?{
	collection:'images',
	emitJSON: false
}!admin/config.yml`)
// will make the laoder output the following:
[{
	title : "Torii",
	image : "/uploads/torii.jpg",
	hasBody : false
}, {
	title : "Forest",
	image : "/uploads/myForestImg.jpg",
	hasBody : false
}, {
	title : "Wave",
	image : "/uploads/a_wave.jpg",
	hasBody : false
}]
```

---
See a live example of a test-site built with the loader [here](https://netlify-cms-loader.netlify.com/).

Code example of a Vue component using the loader [here](https://github.com/Nocory/netlify_cms/blob/master/src/components/cms.vue).