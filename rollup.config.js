//@ts-check

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import fs from 'fs';


// import { minify } from "terser";
// import { minify } from "uglify-js";



const buildOptions =  {
    input: './sources/index.js',
    output: [
        {
            file: './build/app.js',
            format: 'cjs',
            name: "calculableMacros",
        },
        {
            file: './build/module.js',
            format: 'es',
            name: "calculableMacros",
        }
    ],
    plugins: [
        resolve({
            browser: true
        }),
        commonjs(),
        // typescript({
        //     // module: 'CommonJS', 
        //     // tsconfig: false, 
        //     lib: ["es6", "dom"], //es5
        //     target: "es5",
        //     sourceMap: true
        // }),
    ]
};

if (!~globalThis.process.argv.indexOf('-c')) {
    import("rollup").then(function({rollup}) {
        
        //@ts-ignore
        rollup(buildOptions).then(bundle => {
            // console.log(bundle);
            for (const _output of buildOptions.output) {
                //@ts-ignore
                bundle.generate(_output).then(function ({output}) {
                    // console.log(outputs);
                    fs.writeFileSync(_output.file, output[0].code)
                })
            }
        }).catch(er => {
            console.warn(er);
        })
    })
}

export default buildOptions;