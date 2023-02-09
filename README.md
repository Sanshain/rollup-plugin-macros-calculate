## Installation

```
npm i rollup-plugin-macros-calculate -D
```

## Motivation

<details>
    <summary>Let's look at the following example:</summary>

#### Source code: 

Let's say we have the following piece of code:

```js
let results = (function() {

    let fs = require('fs')
    let dir = __dirname + '/replacements/'

    let filenames = fs.readdirSync(dir)

    return filenames.map(function (filename) {
      return require(dir + filename)
    })
})()
```

And let's say that our task is to leave this code still executed in common js format, but we need to assemble it into one iife bundle that will works on browser. Of course, we can use **@rollup/plugin-commonjs** with the `dynamicRequireTargets` option like this:

```js
commonjs({
    dynamicRequireTargets: [`${packagespath}/*.js`],
}),
```

This option will allow you to shove dynamic imported packages into the bundle at the compile time, as we wanted. The source fragment will be generated in the following code:

```js
let results = (function() {

    let fs = require$$0;
    let dir = __dirname + '/replacements/';

    let filenames = fs.readdirSync(dir);

    return filenames.map(function (filename) {
      return createCommonjsRequire("/lib")(dir + filename)
    })

})();
```

Its miraculous! However, we see that the commonjs plugin has left us a lot of work. 

First of all, **fs** is not defined, because **fs** does not exists in browser and if you do nothing, then roll up will expect corresponding to external module in `output.globals`. This will cause an error. Dragging `browserfs` package here is redundant and doesn't make sense. Secondly, the `__dirname` variable also exists only in the nodejs runtime and has no meaning in the browser. The `dynamicRequireTargets` option will generate the `getDynamicModules` function, which will help `createCommonjsRequire` load modules during iteration in a loop, and it looks something like this:


```js
  function getDynamicModules() {
  	return dynamicModules || (dynamicModules = {
        // ...
  		"/lib/replacements/important.js": requireImportant,
  		"/lib/replacements/interpolation.js": requireInterpolation,
  		"/lib/replacements/nth.js": requireNth,
  		"/lib/replacements/rgba.js": requireRgba,
  		"/lib/replacements/unquote.js": requireUnquote,
  		"/lib/replacements/variables.js": requireVariables,
        // ...
  	});
  }
```

 We don't need either fs or `__dirname` anymore. But they are still present in the code and will cause an error in runtime. It turns out that we need to write a plugin ourselves that removes them (well, or use **rollup-plugin-replace**, for example). However, this will not solve the problem, because we need to get the filenames array from somewhere else, which should contain the module names for the dynamic require. And here we are faced with the need to write some kind of macro that should set this array of names to filenames in compile time. 
 
 
 </details>
 
 ## Usage
 
 And `rollup-plugin-macros-calculate` comes to our aid. Write config:

`rollup.config.js`:

```js
import fs from "fs";
import path from 'path';
import { calculableMacros } from 'rollup-plugin-macros-calculate';
// ...

export default {
    input: './src/index.js',
    output: {
        file: './build/bundle.js',
        format: 'iife'
    },
    plugins: [
        // ...
        calculableMacros({
            externalPackages: { path, fs },
            onReplace: ar => `return [${ar.map(w => "'" + w + "'")}]`,
            macroses: {
                'fs.readdirSync': (function (_path) {
                    let dir = path.dirname(path.relative(process.cwd(), file))
                    return fs.readdirSync(dir + _path)
                }).toString(),
                '__dirname +': '', 
            }
        }),
        // ...
    ]
};
```

some minimal changes in source code. Change: 

`source`:

```js
let dir = __dirname + '/replacements/';

return fs.readdirSync(dir)
```

to

```js
      
/** MACRO `fs.readdirSync, __dirname +` */

let dir = __dirname + '/replacements/';

return fs.readdirSync(dir)

/** END_MACRO */

````

Start `rollup -c` and we get the following output result:

`output`:

```js
let results = (function () {

      let filenames = () => {
        return [
          "important.js",
          "interpolation.js",
          "nth.js",
          "rgba.js",
          "unquote.js",
          "variables.js",
          // ...
        ];
      };

      return filenames.map(function (filename) {
        return createCommonjsRequire("/lib")(dir + filename);
      });
})();
```

And we also see that var fs = require("fs") also disappeared. It didn't even require any additional actions, because rollup is able to do tree shaking. Excellent!


## Advantages: 

- Preserving the structure of the source code
- This is not a simple replacement of a piece of code. This is the execution of the source code with hot substitution of fragments in compile time in such a way that a logical connection remains between the replaced fragments


Look up usage another example [here](https://github.com/Sanshain/less-plugin-sass2less) (browser branch)



