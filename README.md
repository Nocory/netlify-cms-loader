## netlify-cms-loader

A webpack loader, that makes it possible to access content from the [Netlify CMS](https://www.netlifycms.org/) in your website or single-page-application.

The output of the loader is an array, consisting of the filename and front-matter of each file belonging to the specified collection.

To get the body of a file you should have your site/app fetch it from the server or use the loaders 'bodyLimit' option to add the body content to the output array during the build process.
By default only very short body strings ( < 128 ) are loaded during the build process.

Depending on the amount of files in the collection and length of the body-markup strings, it might either be more efficient to add them all during the build process or let the app decide which files to fetch later on with additional AJAX requests.

---
#### Using the loader
require() your Netlify CMS config file using the netlify-cms-loader.

You must specify the name of the collection, that you want to retreive information about.

```javascript
const cmsPosts = require('netlify-cms-loader?collection=posts!../admin/config.yml')
```

The loaders output is an array of objects, corresponding to the processed markdown files of the collection.

In addition to each files front-matter, the loader adds two additional properties ***'filePath'*** and ***'hasBody'***.

***filePath*** is the path of the .md file in the build directory and ***hadBody*** indicates, whether there is a body-section present in the .md file.

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
#### Loader options

* **collection** *(required)*
  * Name of the collection you want to retrieve.
* **bodyLimit** *(optional, default 128)*
  * Include markdown body in the results, if body-length is less than specified. This can save HTML requests for small items later on.
* **copyFiles** *(optional, default true)*
  * By default the loader will copy processed .md files and media assets to the build directory
* **outputDirectory** *(optional, default "cms")*
  * If copyFiles is true, then .md files are copied to "[outputDirectory]/[collectionName]/[fileName]"

---
#### Copying CMS files to the build directory

This is no longer necessary. The loader will automatically copy any required files of the CMS to the build directory.

Only the Netlify CMS interface alone should be copied, if you would like to include it in that app.

I recommend to use ***copy-webpack-plugin*** for this.

```javascript
new CopyWebpackPlugin([
  { from: 'src/admin', to: 'admin' }
])
```

---
See a live example of a site built with the loader [here](https://netlify-cms-loader.netlify.com/).

Code example of a Vue component using the loader [here](https://github.com/Nocory/netlify_cms/blob/master/src/components/cms.vue).
