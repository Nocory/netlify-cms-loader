###### 0.3.0
- updated readme
- changed effect of option ```copyFiles```: now only copies processed .md files (previously also copied media files)
- added option ```copyMedia```: *default true*, copy all media-files from the media directory to the output directory
- added option ```sortBy```: *default ""*, name of widget the output should be sorted by. (can be string, number or datetime)
- added option ```reverse```: *default false*, reverse output array. Useful for sorting by date with newest item coming first

###### 0.2.3
- changed default of *bodyLimit* option to 256 characters
- updated readme

### 0.2.0
###### Breaking changes... I am new at this
- Added ***copyFiles*** and ***outputDirectory*** options
- Included copying of .md files and media assets in the loader itself
- Added .filePath property to results in the output array

### 0.1.0 - Initial release