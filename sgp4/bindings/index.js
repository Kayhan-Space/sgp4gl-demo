const { Sgp4: _Sgp4 } = require("./sgp4/sgp4.js");

class Bindings {
    constructor() {
        this._cache = {}
    }

    /** Lazily fetch and compile the WebAssembly module */
    async _getModule(filename) {
        if (filename in this._cache) {
            return this._cache[filename];
        }

        const wasm = await fetch('/wasm/sgp4.wasm');
        const wasmBuffer = await wasm.arrayBuffer();
        const wasmBufferBytes = new Uint8Array(wasmBuffer);
        this._cache[filename] = await WebAssembly.compile(wasmBufferBytes);
        return this._cache[filename];
    }
    async sgp4(options) {
        const wrapper = new _Sgp4();
        const module = await this._getModule("/wasm/sgp4.wasm");
        const imports = options?.imports || {};

        await wrapper.instantiate(module, imports);

        return wrapper;
    }
}

module.exports = { Bindings };