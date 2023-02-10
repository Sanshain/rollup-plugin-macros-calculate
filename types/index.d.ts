/**
 * typedef {Object<string, object>} Packages
 * typedef {{[k: string] : object} & Object<string, object>} Packages
 * @typedef {{[k: string] : object}} Packages
 * @typedef {{externalPackages: Packages, value: string}} MacrosDetails
 *
 * @param {{
 *      include?: string,
 *      exclude?: string,
 *      macroses?: {[k: string]: string | MacrosDetails},
 *      prettify?: boolean,
 *      comments?: false,
 *      externalPackages?: Packages,
 *      onReplace?: (s: unknown) => string,
 *      verbose?: boolean
 * }} options
 * @returns {{name: string, transform: Function}}
 */
export function calculableMacros(options?: {
    include?: string;
    exclude?: string;
    macroses?: {
        [k: string]: string | MacrosDetails;
    };
    prettify?: boolean;
    comments?: false;
    externalPackages?: Packages;
    onReplace?: (s: unknown) => string;
    verbose?: boolean;
}): {
    name: string;
    transform: Function;
};
/**
 * typedef {Object<string, object>} Packages
 * typedef {{[k: string] : object} & Object<string, object>} Packages
 */
export type Packages = {
    [k: string]: any;
};
/**
 * typedef {Object<string, object>} Packages
 * typedef {{[k: string] : object} & Object<string, object>} Packages
 */
export type MacrosDetails = {
    externalPackages: Packages;
    value: string;
};
