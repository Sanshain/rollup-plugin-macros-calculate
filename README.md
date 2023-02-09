## Installation

```
npm i rollup-plugin-macros-calculate -D
```

## Motivation

Let's look at the following example:

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

And let's say that our task is to leave this code still executed in common js format, but we need to assemble it into one iife bundle that will works on browser. Of course, we can use @rollup/plugin-commonjs with the dynamicRequireTargets option like this:

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

However, we see that the common js plugin has left us a lot of work. First of all, **fs** is not defined because fs does not exists in browser and if you do nothing, then roll up will expect corresponding to external module in output.globals. This will cause an error. Dragging browsers here is redundant and doesn't make sense. Secondly, the `__dirname` variable also exists only in the nodejs runtime and has no meaning in the browser. The dynamicRequireTargets option will generate the get Dynamic Modules function, which will help createCommonjsRequire load modules during iteration in a loop, and it looks something like this:


```js
  function getDynamicModules() {
  	return dynamicModules || (dynamicModules = {
        // ...
  		"/lib/replacements/important.js": requireImportant,
  		"/lib/replacements/interpolation.js": requireInterpolation,
  		"/lib/replacements/nth.js": requireNth,
  		"/lib/replacements/rgba.js": requireRgba,
  		"/lib/replacements/unquote.js": requireUnquote,
  		"/lib/replacements/variables.js": requireVariables
  	});
  }
```

 We don't need either fs or __dirname anymore. But they are still present in the code and will cause an error in runtime. It turns out that we need to write a plugin ourselves that removes them (well, or use rollup-plugin-replace, for example). However, this will not solve the problem, because we need to get the filenames array from somewhere else, which should contain the module names for the dynamic require. And here we are faced with the need to write some kind of macro that should set this array of names to filenames in compile time




#### Source code for processing: 


```js
  let results = (function() {
      
    /** MACRO `let fs = require('fs'), import, __dirname` */
    
      let fs = require('fs')
      let dir = __dirname + '/replacements/'

      let filenames = fs.readdirSync(dir)

      /**
       * @type {Array<{order: number, replacement: Function, pattern: RegExp}>}
       */
      return filenames.map(function (filename) {
        return require(dir + filename)
      })
    
    /** END_MACRO */

  })()
```

`rollup.config.js`:

```js

import fs from "fs";
import path from 'path';
import { calculableMacros } from 'rollup-plugin-macros-calculate';

export default {
    input: './src/index.js',
    output: {
        file: './build/bundle.js',
        format: 'iife'
    },
    plugins: [
        
        calculableMacros({
            externalPackages: {path, fs},            
            macroses: {
                import: (function (_path) {
                    let code = fs.readFileSync(_path).toString()

                    let flatCode = code.replace('module.exports = ', '')
                    let hasCLosingComma = flatCode.trim().slice(-1) === ';'
                    if (hasCLosingComma) {
                        flatCode = flatCode.trim().slice(0, -1)
                    }
                    
                    return flatCode
                }).toString(),
                __dirname: '`${path.dirname(path.relative(process.cwd(), file))}`',
                "let fs = require('fs')": ''
            }
        }),
        
    ]
};
```

What does this plugin do? 

The fragment above is commonjs style code. Inside the code 
