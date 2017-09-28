module.exports = {
	root: true,
	env: {
		"browser": true,
		"commonjs": true,
		"es6": true,
		"node": true
	},
	extends: [
		"eslint:recommended",
		"plugin:vue/recommended"
		//"plugin:vue/recommended"
	],
	parserOptions: {
		"sourceType": "module"
	},
	plugins: [
		//"html",
		//"vue"
	],
	rules: {
		"no-unused-vars": [
			1
		],
		"indent": [
			1,
			"tab"
		],
		"linebreak-style": [
			0,
			"unix"
		],
		"quotes": [
			0,
			"double"
		],
		"semi": [
			1,
			"never"
		],
		"no-console": [
			0
		],
		"no-unexpected-multiline": 1,
		"no-await-in-loop": 1,
		"no-extra-parens": 1
	}
}