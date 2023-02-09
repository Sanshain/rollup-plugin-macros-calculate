## example

```js
    plugins: [
        // ...
        calculableMacros({
            prettify: true,
            comments: false,
            externalPackages: {path, fs},            
            macroses: {
                import: (function (_path) {
                    let code = fs.readFileSync(_path).toString()
                    console.log(_path);
                    // try {
                    //     var obj = eval(code)
                    // }
                    // catch (er){
                    
                    // let esCode = `export default (function (_, $, module) {\n\n${code}\n\nreturn module.exports\n})()`

                    let flatCode = code.replace('module.exports = ', '')
                    // console.log(flatCode);
                    let hasCLosingComma = flatCode.trim().slice(-1) === ';'
                    if (hasCLosingComma) {
                        flatCode = flatCode.trim().slice(0, -1)
                    }
                    // var obj = eval('(' + flatCode + ')');
                    
                    // }
                    return flatCode
                }).toString(),
                __dirname: '`${path.dirname(path.relative(process.cwd(), file))}`',
                "let fs = require('fs')": ''
            }
        }),
        // ...
    ]
```