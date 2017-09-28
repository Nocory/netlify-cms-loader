## netlify-cms-loader

A webpack loader, that makes it possible to access content from the [Netlify CMS](https://www.netlifycms.org/) in your website or single-page-application.

The output of the loader is an array, consisting of the filename and front-matter of each file belonging to the specified collection.

To get the body of a file you should have your site/app fetch it from the server or use the loaders 'bodyLimit' option to add the body content to the output array during the build process.
By default only very short body strings (<128) are loaded during the build process.

Depending on the amount of files in the collection and length of the body-markup strings, it might either be more efficient to add them all during the build process or let the app decide which files to fetch later on with additional AJAX requests.

---
#### Installing the loader
```javascript
npm install netlify-cms-loader
```

---
#### Using the loader
require() your Netlify CMS config file using the netlify-cms-loader.

Specify the name of the collection, that you want to retreive information about.

```javascript
const cmsPosts = require('netlify-cms-loader?collection=posts!../admin/config.yml')
```

---
#### Loader options

* **collection** *(required)*
  * Name of the collection you want to retrieve.
* **bodyLimit** *(optional, default 128)*
  * include markdown body in the results, if body-length is less than specified. This can save HTML requests for small items later on.

---
#### Copying CMS files to the build directory

Since there is no actual build-step involved it is necessary to copy the admin panel, markdown files and (image) uploads to the build directory. I recommend to use ***copy-webpack-plugin*** for this.

The specific paths are up to you.

The loader only outputs info about found markdown files inside a collections directory.

```javascript
new CopyWebpackPlugin([
  { from: 'src/admin', to: 'admin' },
  { from: 'src/uploads', to: 'uploads' },
  { from: 'src/cms', to: 'cms' }
])
```

---
See a live example of a site built with the loader [here](https://netlify-cms-loader.netlify.com/).

Code example of a Vue component using the loader [here](https://github.com/Nocory/netlify_cms/blob/master/src/components/cms.vue).

