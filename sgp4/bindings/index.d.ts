// @ts-ignore
import { Sgp4 as _Sgp4 } from "./sgp4/sgp4";

/**
 * Options used when initializing the bindings.
 */
export type LoadOptions = {
    /** Additional imports to be provided to the WebAssembly module */
    imports: WebAssembly.Imports,
    /**
     * A user-specified WebAssembly module to use instead of the one bundled
     * with this package.
     */
    module: WebAssembly.Module,
};

export default class Bindings {
    sgp4(options?: Partial<LoadOptions>): Promise<_Sgp4>;
}