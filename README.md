# netlify-cms-loader

A webpack loader to require() content from the [Netlify CMS](https://www.netlifycms.org/) in your website or single-page-application.

The loader processes the files of a collection and outputs their content as an array of objects.

If the processed file contains a fields for an image or file widget, then the resource at that path will be copied to your configurations public_folder.

**Note:** This is a 3rd-party loader. I am in no way affiliated with [Netlify](https://www.netlify.com/), though I wholeheartedly recommend anyone to check them out.

>**Breaking changes occur with every minor patch version until 1.0.0**

>**For now I recommend to use this loader only in an experimental way and not in any real production environment**

---
#### Loader options (and defaults)

Option | Default | Description
---|---|---
collection  | ''    | **(required)** Name of the collection you want to retrieve.  
file        | ''    | If specified and `collection` is a file collection, then only this single file will be processed. (Loader output will become a single object instead of an array of objects)
parseBody   | true  | If the entry has a `body` field, then it will be parsed to HTML.
includeBody | false | Include the body in the loaders output? (The body will always be present in the emitted .json file to be fetched by the client on demand)
keys        | []    | Only include these fields in the loaders output. (The emitted .json file always contains all fields)
limit       | 0     | If not 0, limit output to n entries. (The n newest entries, if the entries file name starts with and is derived from the entries creation date)
emitJSON    | true  | Convert CMS files to JSON format and emit them to the output directory. (you can set this to false if you only need the direct loader output and don't intend to fetch any emitted .json files later on)
outputDirectory | 'cms' | Emitted JSON files are written to this directory. The final path is "outputDirectory/collection/filename.json". (this path will be included as the `filePath` property in the loaders output)

---
#### What the loader does
* processes the required collection files
* adds `hasBody` property to the output, if file has a body field
* adds `filePath` property to the output, if a .json file is emitted
* returns collection data as array of objects
* emits processed collection files as JSON to `outputDirectory`

---
#### Setup
Install the loader as a dev dependency
```javascript
npm install netlify-cms-loader --save-dev
```
The loader will only emit its own .json files of processed CMS entries.

It does not copy any static assets, such as the files in the `media_folder` of the CMS. Make sure that those files get copied to the `public_folder` path specified in your config.yml.

You can use the [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) for this.
```javascript
/* config.yml
media_folder: "src/uploads"
public_folder: "uploads"
*/
new CopyWebpackPlugin([
	{ from: 'src/admin', to: 'admin' },
	{ from: 'src/uploads', to: 'uploads' }
])
```

---
#### Using the loader
The loader should be used inline.

```javascript
const allMyPosts = require("netlify-cms-loader?collection=posts!admin/config.yml")
```
While that first example looks a bit unwieldy, with only some configuration it can be made much more concise and easy to read.
```javascript
const allMyPosts = require("cms?posts!")
```
I think the webpack inline loader syntax of question and exclamation marks even makes some good sense here in a coincidental way... ***from the cms? get posts!***

To achieve this I would recommend two things. First create an environment variable called `NETLIFY_CMS_LOADER_CONFIG` and assign it the path to the config.yml file. How the variable should be declared is up to you. This is only one example.
```javascript
//package.json
"scripts": {
	// ...
	"dev": "NODE_ENV=development NETLIFY_CMS_LOADER_CONFIG=src/admin/config.yml webpack-dev-server --config build_config/webpack.config.js"
},
```
This will let you omit the config.yml file from the inline loader.

Second is to create a loader alias to shorten `netlify-cms-loader` to just `cms`
```javascript
//in your webpack config
resolveLoader: {
	modules: [path.resolve('node_modules')],
	alias: {
		"cms": "netlify-cms-loader"
	}
}
```
All done.

You can use the loader either with a query string or an options object. There is also a shorthand version where you specify the name of a collection as the only argument.

Single files of a file collection can also be imported via shorthand by separating the collection and file name with a "/" `require("cms?someCollection/someFilename!")`

By default the body field of a CMS entry is not included in the loaders output. The client can fetch the entries .json file if its body data is needed. Alternatively set `includeBody: true` to always include body content in the loaders output.

---
#### Examples:

Using a query string to fetch the 2 newest items in a collection
```javascript
const latestPosts = require("cms?collection=posts&limit=2!")

// Example output:
[{
	title: "The newest post",
	author: "John Doe",
	image : "/uploads/neatImage.jpg",
	hasBody: true,
	filePath : "cms/posts/2018-08-02_the-newest-post.json",
},{
	title: "A slightly older post",
	author: "John Doe",
	image : "/uploads/greatPicture.jpg",
	hasBody: true,
	filePath : "cms/posts/2018-07-24_slightly-older-post.json",
}]
```
---
Using a template string (notice the backticks \` ... \` ) with an option object to fetch all items of the 'news' collection, but only return the title and date fields.
```javascript
const allNews = require(`cms?{
	collection: 'news',
	fields: ['title','date']
}!`)

// Example output:
[{
	title: "Some Title",
	date : "2017-08-02T02:55:59.161Z",
	hasBody: true,
	filePath: "cms/news/2017-08-02_someNews.json"
},{/*...*/},{/*...*/},{/*...*/},{/*...*/}]
```
---
Fetch all news items by using a shorthand for the collection name. (if only a single query parameter is included, then that will used as argument for the collection name)
```javascript
const allNews = require("cms?news!")

// Example output:
[{
	title: "Some Title",
	author: "John Does",
	tags: ["Festival","Outdoors"],
	date : "2017-08-02T02:55:59.161Z",
	hasBody: true,
	filePath: "cms/news/2017-08-02_someNews.json"
},{/*...*/},{/*...*/},{/*...*/},{/*...*/}]
```
---
Using shorthand to fetch a single file of a file collection. (This will return an object directly instead of an array of objects)
```javascript
const john = require("cms?people/JohnDoe!")

// Example output:
{
	title: "JohnDoe",
	name: "John Doe",
	age: 29,
	location: "Earth",
	filePath: "cms/people/JohnDoe.json"
}
```

---
See a live example of a test-site using the loader to require some content [here](https://netlify-cms-loader.netlify.com/).

Code example of a Vue component using the loader [here](https://github.com/Nocory/netlify_cms/blob/master/src/components/cms.vue).

#### Caveats

* Currently the loader only processes files that contain front-matter and can be directly parsed by the [gray-matter library](https://www.npmjs.com/package/gray-matter/) or are plain .json files.
* The same collection should not be required in multiple places while using different options. Doing so will result in the loader outputting 2 separate arrays, which may have overlapping entries, thus unnecessarily increasing the bundle size.