## netlify-cms-loader

A webpack loader, that makes it easier to access content from the [Netlify CMS](https://www.netlifycms.org/) in your website or single-page-application.

The loader processes all .md files of a collection and outputs their content and file path as an array of objects.

Processed .md files and any assets in the "media_folder" are automatically copied to the output directory, so they can be fetched by the app later on.

**Note:** This is a 3rd-party loader. I am in no way affiliated with [Netlify](https://www.netlify.com/), though I wholeheartedly recommend anyone to check them out.

---
#### Loader options

* ```collection``` *("posts", **required**)* Name of the collection you want to retrieve.
* ```bodyLimit``` *(256)* Include markdown body in the results, if body-length is less than specified. This can save http-requests for small items later on.
* ```copyFiles``` *(true)* copy processed .md files to the output directory.
* ```copyMedia``` *(true)* copy all media-files from the media directory to the output directory.
* ```sortBy``` *("")* name of widget the output should be sorted by. Leave empty to skip sorting.
* ```reverse``` *(false)* reverse output array. Useful for sorting by date with newest item coming first.
* ```outputDirectory``` *("cms")* If copyFiles is true, then .md files are copied to "[outputDirectory]/[collectionName]/[fileName]".

---
#### Using the loader
require() your Netlify CMS config file with the loader inline.

You must at least specify the name of the collection, that you want to retreive information about. The remaining options have fairly sane defaults, but can always be changed to your liking.

```javascript
const cmsPosts = require('!netlify-cms-loader?collection=posts!../admin/config.yml')
```

The loaders output is an array of objects, corresponding to the processed markdown files of the collection.

In addition to each files front-matter, the loader adds two additional properties ***'filePath'*** and ***'hasBody'*** . (Please make sure, that these don't collide with the fields from your CMS collection. This might be addressed in future versions, if it turns out to be an issue.)

***filePath*** is the path of the .md file in the build directory and ***hasBody*** indicates, whether there is a body-section present in the .md file.

Depending on the loader-options, a markdown files body may be included in the output array or needs to be fetched later on by the website/app.

###### Example output of the loader:
```javascript
[{
	title: "Long blog post",
	image: "/uploads/hero_image.jpg",
	filePath: "cms/posts/2017-09-20-long-blog-post.md",
	hasBody: true
}, {
	title: "A short story",
	image: "/uploads/placeholder.jpg",
	body: "This body is short enough to be included right away",
	filePath: "cms/posts/2017-09-22-a-short-story.md",
	hasBody: true,
}, {
	title: "A longer story",
	image: "/uploads/test.jpg",
	filePath: "cms/posts/2017-09-23-a-longer-story.md",
	hasBody: true
}]
```

---
See a live example of a test-site built with the loader [here](https://netlify-cms-loader.netlify.com/).

Code example of a Vue component using the loader [here](https://github.com/Nocory/netlify_cms/blob/master/src/components/cms.vue).