### 0.7.2
- **changed:** Loader no longer deals with copying media files

### 0.7.1
- **fixed:** initial sorting by file names

### 0.7.0
- **changed:** revamped options
- **new:** added shorthand version
- **new:** possibility for more concise inline string

### 0.5.2
- **new:** the loader now parses markdown bodies to HTML by default
- **new:** processed CMS .md entries are emitted as .json files by default
- updated loader options (see the updated readme)
- better error handling if a collection is not specified

---

***restarted development***

---


### 0.4.1
- actually update readme

### 0.4.0
- readme typo fix
- removed option ```copyMedia```: Turns out, that this option made no sense, since it would have to be set to the same for all required collections. Media files from the CMS are also something you generally always want included in your build.
- improved console output during build process

###### 0.3.1
- readme typo fix

### 0.3.0
- updated readme
- changed effect of option ```copyFiles```: now only copies processed .md files (previously also copied media files)
- added option ```copyMedia```: *default true*, copy all media-files from the media directory to the output directory
- added option ```sortBy```: *default ""*, name of widget the output should be sorted by. (can be string, number or datetime)
- added option ```reverse```: *default false*, reverse output array. Useful for sorting by date with newest item coming first

### 0.2.3
- changed default of *bodyLimit* option to 256 characters
- updated readme

### 0.2.0
###### Breaking changes... I am new at this
- Added ***copyFiles*** and ***outputDirectory*** options
- Included copying of .md files and media assets in the loader itself
- Added .filePath property to results in the output array

### 0.1.0 - Initial release