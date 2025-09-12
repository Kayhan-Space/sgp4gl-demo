const { clamp_guest, data_view, to_string, UTF8_DECODER, utf8_encode, utf8_encoded_len, Slab } = require('./intrinsics.js');
class Sgp4 {
  constructor() {
    this._resource0_slab = new Slab();
    this._resource1_slab = new Slab();
    this._resource2_slab = new Slab();
  }
  addToImports(imports) {
    if (!("canonical_abi" in imports)) imports["canonical_abi"] = {};
    
    imports.canonical_abi['resource_drop_elements'] = i => {
      this._resource0_slab.remove(i).drop();
    };
    imports.canonical_abi['resource_clone_elements'] = i => {
      const obj = this._resource0_slab.get(i);
      return this._resource0_slab.insert(obj.clone())
    };
    imports.canonical_abi['resource_get_elements'] = i => {
      return this._resource0_slab.get(i)._wasm_val;
    };
    imports.canonical_abi['resource_new_elements'] = i => {
      const registry = this._registry0;
      return this._resource0_slab.insert(new Elements(i, this));
    };
    
    imports.canonical_abi['resource_drop_resonance-state'] = i => {
      this._resource1_slab.remove(i).drop();
    };
    imports.canonical_abi['resource_clone_resonance-state'] = i => {
      const obj = this._resource1_slab.get(i);
      return this._resource1_slab.insert(obj.clone())
    };
    imports.canonical_abi['resource_get_resonance-state'] = i => {
      return this._resource1_slab.get(i)._wasm_val;
    };
    imports.canonical_abi['resource_new_resonance-state'] = i => {
      const registry = this._registry1;
      return this._resource1_slab.insert(new ResonanceState(i, this));
    };
    
    imports.canonical_abi['resource_drop_constants'] = i => {
      this._resource2_slab.remove(i).drop();
    };
    imports.canonical_abi['resource_clone_constants'] = i => {
      const obj = this._resource2_slab.get(i);
      return this._resource2_slab.insert(obj.clone())
    };
    imports.canonical_abi['resource_get_constants'] = i => {
      return this._resource2_slab.get(i)._wasm_val;
    };
    imports.canonical_abi['resource_new_constants'] = i => {
      const registry = this._registry2;
      return this._resource2_slab.insert(new Constants(i, this));
    };
  }
  
  async instantiate(module, imports) {
    imports = imports || {};
    this.addToImports(imports);
    
    if (module instanceof WebAssembly.Instance) {
      this.instance = module;
    } else if (module instanceof WebAssembly.Module) {
      this.instance = await WebAssembly.instantiate(module, imports);
    } else if (module instanceof ArrayBuffer || module instanceof Uint8Array) {
      const { instance } = await WebAssembly.instantiate(module, imports);
      this.instance = instance;
    } else {
      const { instance } = await WebAssembly.instantiateStreaming(module, imports);
      this.instance = instance;
    }
    this._exports = this.instance.exports;
    this._registry0 = new FinalizationRegistry(this._exports['canonical_abi_drop_elements']);
    this._registry1 = new FinalizationRegistry(this._exports['canonical_abi_drop_resonance-state']);
    this._registry2 = new FinalizationRegistry(this._exports['canonical_abi_drop_constants']);
  }
  orbitFromKozaiElements(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    const memory = this._exports.memory;
    const free = this._exports["canonical_abi_free"];
    const {ae: v0_0, ke: v0_1, j2: v0_2, j3: v0_3, j4: v0_4 } = arg0;
    const ret = this._exports['orbit-from-kozai-elements'](+v0_0, +v0_1, +v0_2, +v0_3, +v0_4, +arg1, +arg2, +arg3, +arg4, +arg5, +arg6);
    
    let variant5;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant5 = { tag: "ok", val: {
          inclination: data_view(memory).getFloat64(ret + 8, true),
          rightAscension: data_view(memory).getFloat64(ret + 16, true),
          eccentricity: data_view(memory).getFloat64(ret + 24, true),
          argumentOfPerigee: data_view(memory).getFloat64(ret + 32, true),
          meanAnomaly: data_view(memory).getFloat64(ret + 40, true),
          meanMotion: data_view(memory).getFloat64(ret + 48, true),
        } };
        break;
      }
      case 1: {
        let variant4;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant4 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant4 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant4 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant4 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant4 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant4 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant1;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant1 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant1 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant1 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant1 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant1 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant1 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant1 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant1 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant1 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant1 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant1 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant1 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant1 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant2;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant2 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant2 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant2 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant4 = {
              tag: "tle",
              val: {
                what: variant1,
                line: variant2,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr3 = data_view(memory).getInt32(ret + 16, true);
            const len3 = data_view(memory).getInt32(ret + 20, true);
            const list3 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr3, len3));
            free(ptr3, len3, 1);
            variant4 = {
              tag: "json-parse",
              val: list3,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant5 = { tag: "err", val: variant4 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant5;
  }
  wgs72() {
    const memory = this._exports.memory;
    const ret = this._exports['wgs72']();
    return {
      ae: data_view(memory).getFloat64(ret + 0, true),
      ke: data_view(memory).getFloat64(ret + 8, true),
      j2: data_view(memory).getFloat64(ret + 16, true),
      j3: data_view(memory).getFloat64(ret + 24, true),
      j4: data_view(memory).getFloat64(ret + 32, true),
    };
  }
  wgs84() {
    const memory = this._exports.memory;
    const ret = this._exports['wgs84']();
    return {
      ae: data_view(memory).getFloat64(ret + 0, true),
      ke: data_view(memory).getFloat64(ret + 8, true),
      j2: data_view(memory).getFloat64(ret + 16, true),
      j3: data_view(memory).getFloat64(ret + 24, true),
      j4: data_view(memory).getFloat64(ret + 32, true),
    };
  }
  afspcEpochToSiderealTime(arg0) {
    const ret = this._exports['afspc-epoch-to-sidereal-time'](+arg0);
    return ret;
  }
  iauEpochToSiderealTime(arg0) {
    const ret = this._exports['iau-epoch-to-sidereal-time'](+arg0);
    return ret;
  }
  parse2les(arg0) {
    const memory = this._exports.memory;
    const realloc = this._exports["canonical_abi_realloc"];
    const free = this._exports["canonical_abi_free"];
    const ptr0 = utf8_encode(arg0, realloc, memory);
    const len0 = utf8_encoded_len();
    const ret = this._exports['parse2les'](ptr0, len0);
    
    let variant6;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        const len1 = data_view(memory).getInt32(ret + 12, true);
        const base1 = data_view(memory).getInt32(ret + 8, true);
        const result1 = [];
        for (let i = 0; i < len1; i++) {
          const base = base1 + i * 4;
          result1.push(this._resource0_slab.remove(data_view(memory).getInt32(base + 0, true)));
        }
        free(base1, len1 * 4, 4);
        
        variant6 = { tag: "ok", val: result1 };
        break;
      }
      case 1: {
        let variant5;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant5 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant5 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant5 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant5 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant5 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant5 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant2;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant2 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant2 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant2 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant2 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant2 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant2 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant2 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant2 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant2 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant2 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant2 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant2 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant2 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant3;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant3 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant3 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant3 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant5 = {
              tag: "tle",
              val: {
                what: variant2,
                line: variant3,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr4 = data_view(memory).getInt32(ret + 16, true);
            const len4 = data_view(memory).getInt32(ret + 20, true);
            const list4 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr4, len4));
            free(ptr4, len4, 1);
            variant5 = {
              tag: "json-parse",
              val: list4,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant6 = { tag: "err", val: variant5 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant6;
  }
  parse3les(arg0) {
    const memory = this._exports.memory;
    const realloc = this._exports["canonical_abi_realloc"];
    const free = this._exports["canonical_abi_free"];
    const ptr0 = utf8_encode(arg0, realloc, memory);
    const len0 = utf8_encoded_len();
    const ret = this._exports['parse3les'](ptr0, len0);
    
    let variant6;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        const len1 = data_view(memory).getInt32(ret + 12, true);
        const base1 = data_view(memory).getInt32(ret + 8, true);
        const result1 = [];
        for (let i = 0; i < len1; i++) {
          const base = base1 + i * 4;
          result1.push(this._resource0_slab.remove(data_view(memory).getInt32(base + 0, true)));
        }
        free(base1, len1 * 4, 4);
        
        variant6 = { tag: "ok", val: result1 };
        break;
      }
      case 1: {
        let variant5;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant5 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant5 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant5 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant5 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant5 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant5 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant2;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant2 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant2 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant2 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant2 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant2 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant2 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant2 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant2 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant2 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant2 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant2 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant2 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant2 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant3;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant3 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant3 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant3 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant5 = {
              tag: "tle",
              val: {
                what: variant2,
                line: variant3,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr4 = data_view(memory).getInt32(ret + 16, true);
            const len4 = data_view(memory).getInt32(ret + 20, true);
            const list4 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr4, len4));
            free(ptr4, len4, 1);
            variant5 = {
              tag: "json-parse",
              val: list4,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant6 = { tag: "err", val: variant5 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant6;
  }
}

class Elements {
  constructor(wasm_val, obj) {
    this._wasm_val = wasm_val;
    this._obj = obj;
    this._refcnt = 1;
    obj._registry0.register(this, wasm_val, this);
  }
  
  clone() {
    this._refcnt += 1;
    return this;
  }
  
  drop() {
    this._refcnt -= 1;
    if (this._refcnt !== 0)
    return;
    this._obj._registry0.unregister(this);
    const dtor = this._obj._exports['canonical_abi_drop_elements'];
    const wasm_val = this._wasm_val;
    delete this._obj;
    delete this._refcnt;
    delete this._wasm_val;
    dtor(wasm_val);
  }
  static fromTle(sgp4, arg0, arg1, arg2) {
    const memory = sgp4._exports.memory;
    const realloc = sgp4._exports["canonical_abi_realloc"];
    const free = sgp4._exports["canonical_abi_free"];
    const variant1 = arg0;
    let variant1_0;
    let variant1_1;
    let variant1_2;
    
    switch (variant1) {
      case null: {
        variant1_0 = 0;
        variant1_1 = 0;
        variant1_2 = 0;
        
        break;
      }
      default: {
        const e = variant1;
        const ptr0 = utf8_encode(e, realloc, memory);
        const len0 = utf8_encoded_len();
        variant1_0 = 1;
        variant1_1 = ptr0;
        variant1_2 = len0;
        
        break;
      }
    }
    const ptr2 = utf8_encode(arg1, realloc, memory);
    const len2 = utf8_encoded_len();
    const ptr3 = utf8_encode(arg2, realloc, memory);
    const len3 = utf8_encoded_len();
    const ret = sgp4._exports['elements::from-tle'](variant1_0, variant1_1, variant1_2, ptr2, len2, ptr3, len3);
    
    let variant8;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant8 = { tag: "ok", val: sgp4._resource0_slab.remove(data_view(memory).getInt32(ret + 8, true)) };
        break;
      }
      case 1: {
        let variant7;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant7 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant7 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant7 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant7 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant7 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant7 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant4;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant4 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant4 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant4 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant4 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant4 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant4 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant4 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant4 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant4 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant4 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant4 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant4 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant4 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant5;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant5 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant5 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant5 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant7 = {
              tag: "tle",
              val: {
                what: variant4,
                line: variant5,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr6 = data_view(memory).getInt32(ret + 16, true);
            const len6 = data_view(memory).getInt32(ret + 20, true);
            const list6 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr6, len6));
            free(ptr6, len6, 1);
            variant7 = {
              tag: "json-parse",
              val: list6,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant8 = { tag: "err", val: variant7 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant8;
  }
  static fromJson(sgp4, arg0) {
    const memory = sgp4._exports.memory;
    const realloc = sgp4._exports["canonical_abi_realloc"];
    const free = sgp4._exports["canonical_abi_free"];
    const ptr0 = utf8_encode(arg0, realloc, memory);
    const len0 = utf8_encoded_len();
    const ret = sgp4._exports['elements::from-json'](ptr0, len0);
    
    let variant5;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant5 = { tag: "ok", val: sgp4._resource0_slab.remove(data_view(memory).getInt32(ret + 8, true)) };
        break;
      }
      case 1: {
        let variant4;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant4 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant4 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant4 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant4 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant4 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant4 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant1;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant1 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant1 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant1 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant1 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant1 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant1 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant1 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant1 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant1 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant1 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant1 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant1 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant1 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant2;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant2 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant2 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant2 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant4 = {
              tag: "tle",
              val: {
                what: variant1,
                line: variant2,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr3 = data_view(memory).getInt32(ret + 16, true);
            const len3 = data_view(memory).getInt32(ret + 20, true);
            const list3 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr3, len3));
            free(ptr3, len3, 1);
            variant4 = {
              tag: "json-parse",
              val: list3,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant5 = { tag: "err", val: variant4 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant5;
  }
  epoch() {
    const obj0 = this;
    const ret = this._obj._exports['elements::epoch'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  epochAfspcCompatibilityMode() {
    const obj0 = this;
    const ret = this._obj._exports['elements::epoch-afspc-compatibility-mode'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getObjectName() {
    const memory = this._obj._exports.memory;
    const free = this._obj._exports["canonical_abi_free"];
    const obj0 = this;
    const ret = this._obj._exports['elements::get-object-name'](this._obj._resource0_slab.insert(obj0.clone()));
    let variant2;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      
      case 0: {
        
        variant2 = null;
        break;
      }
      case 1: {
        const ptr1 = data_view(memory).getInt32(ret + 4, true);
        const len1 = data_view(memory).getInt32(ret + 8, true);
        const list1 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr1, len1));
        free(ptr1, len1, 1);
        
        variant2 = list1;
        break;
      }
      
      default:
      throw new RangeError("invalid variant discriminant for option");
    }
    return variant2;
  }
  getInternationalDesignator() {
    const memory = this._obj._exports.memory;
    const free = this._obj._exports["canonical_abi_free"];
    const obj0 = this;
    const ret = this._obj._exports['elements::get-international-designator'](this._obj._resource0_slab.insert(obj0.clone()));
    let variant2;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      
      case 0: {
        
        variant2 = null;
        break;
      }
      case 1: {
        const ptr1 = data_view(memory).getInt32(ret + 4, true);
        const len1 = data_view(memory).getInt32(ret + 8, true);
        const list1 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr1, len1));
        free(ptr1, len1, 1);
        
        variant2 = list1;
        break;
      }
      
      default:
      throw new RangeError("invalid variant discriminant for option");
    }
    return variant2;
  }
  getNoradId() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-norad-id'](this._obj._resource0_slab.insert(obj0.clone()));
    return BigInt.asUintN(64, ret);
  }
  getClassification() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-classification'](this._obj._resource0_slab.insert(obj0.clone()));
    let enum1;
    switch (ret) {
      case 0: {
        enum1 = "unclassified";
        break;
      }
      case 1: {
        enum1 = "classified";
        break;
      }
      case 2: {
        enum1 = "secret";
        break;
      }
      default: {
        throw new RangeError("invalid discriminant specified for Classification");
      }
    }
    return enum1;
  }
  getDatetime() {
    const memory = this._obj._exports.memory;
    const obj0 = this;
    const ret = this._obj._exports['elements::get-datetime'](this._obj._resource0_slab.insert(obj0.clone()));
    return {
      secs: data_view(memory).getBigInt64(ret + 0, true),
      nsecs: data_view(memory).getInt32(ret + 8, true) >>> 0,
    };
  }
  getMeanMotionDot() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-mean-motion-dot'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getMeanMotionDdot() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-mean-motion-ddot'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getDragTerm() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-drag-term'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getElementSetNumber() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-element-set-number'](this._obj._resource0_slab.insert(obj0.clone()));
    return BigInt.asUintN(64, ret);
  }
  getInclination() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-inclination'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getRightAscension() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-right-ascension'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getEccentricity() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-eccentricity'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getArgumentOfPerigee() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-argument-of-perigee'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getMeanAnomaly() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-mean-anomaly'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getMeanMotion() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-mean-motion'](this._obj._resource0_slab.insert(obj0.clone()));
    return ret;
  }
  getRevolutionNumber() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-revolution-number'](this._obj._resource0_slab.insert(obj0.clone()));
    return BigInt.asUintN(64, ret);
  }
  getEphemerisType() {
    const obj0 = this;
    const ret = this._obj._exports['elements::get-ephemeris-type'](this._obj._resource0_slab.insert(obj0.clone()));
    return clamp_guest(ret, 0, 255);
  }
}

class ResonanceState {
  constructor(wasm_val, obj) {
    this._wasm_val = wasm_val;
    this._obj = obj;
    this._refcnt = 1;
    obj._registry1.register(this, wasm_val, this);
  }
  
  clone() {
    this._refcnt += 1;
    return this;
  }
  
  drop() {
    this._refcnt -= 1;
    if (this._refcnt !== 0)
    return;
    this._obj._registry1.unregister(this);
    const dtor = this._obj._exports['canonical_abi_drop_resonance-state'];
    const wasm_val = this._wasm_val;
    delete this._obj;
    delete this._refcnt;
    delete this._wasm_val;
    dtor(wasm_val);
  }
  t() {
    const obj0 = this;
    const ret = this._obj._exports['resonance-state::t'](this._obj._resource1_slab.insert(obj0.clone()));
    return ret;
  }
}

class Constants {
  constructor(wasm_val, obj) {
    this._wasm_val = wasm_val;
    this._obj = obj;
    this._refcnt = 1;
    obj._registry2.register(this, wasm_val, this);
  }
  
  clone() {
    this._refcnt += 1;
    return this;
  }
  
  drop() {
    this._refcnt -= 1;
    if (this._refcnt !== 0)
    return;
    this._obj._registry2.unregister(this);
    const dtor = this._obj._exports['canonical_abi_drop_constants'];
    const wasm_val = this._wasm_val;
    delete this._obj;
    delete this._refcnt;
    delete this._wasm_val;
    dtor(wasm_val);
  }
  static new(sgp4, arg0, arg1, arg2, arg3, arg4) {
    const memory = sgp4._exports.memory;
    const free = sgp4._exports["canonical_abi_free"];
    const {ae: v0_0, ke: v0_1, j2: v0_2, j3: v0_3, j4: v0_4 } = arg0;
    const val1 = to_string(arg1);
    let enum1;
    switch (val1) {
      case "afspc": {
        enum1 = 0;
        break;
      }
      case "iau": {
        enum1 = 1;
        break;
      }
      default: {
        throw new TypeError(`"${val1}" is not one of the cases of epoch-to-sidereal-time-algorithm`);
      }
    }
    const {inclination: v2_0, rightAscension: v2_1, eccentricity: v2_2, argumentOfPerigee: v2_3, meanAnomaly: v2_4, meanMotion: v2_5 } = arg4;
    const ret = sgp4._exports['constants::new'](+v0_0, +v0_1, +v0_2, +v0_3, +v0_4, enum1, +arg2, +arg3, +v2_0, +v2_1, +v2_2, +v2_3, +v2_4, +v2_5);
    
    let variant7;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant7 = { tag: "ok", val: sgp4._resource2_slab.remove(data_view(memory).getInt32(ret + 8, true)) };
        break;
      }
      case 1: {
        let variant6;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant6 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant6 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant6 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant6 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant6 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant6 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant3;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant3 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant3 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant3 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant3 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant3 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant3 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant3 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant3 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant3 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant3 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant3 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant3 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant3 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant4;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant4 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant4 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant4 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant6 = {
              tag: "tle",
              val: {
                what: variant3,
                line: variant4,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr5 = data_view(memory).getInt32(ret + 16, true);
            const len5 = data_view(memory).getInt32(ret + 20, true);
            const list5 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr5, len5));
            free(ptr5, len5, 1);
            variant6 = {
              tag: "json-parse",
              val: list5,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant7 = { tag: "err", val: variant6 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant7;
  }
  static fromElements(sgp4, arg0) {
    const memory = sgp4._exports.memory;
    const free = sgp4._exports["canonical_abi_free"];
    const obj0 = arg0;
    if (obj0 instanceof Elements){
      const ret = sgp4._exports['constants::from-elements'](sgp4._resource0_slab.insert(obj0.clone()));

      let variant5;
      switch (data_view(memory).getUint8(ret + 0, true)) {
        case 0: {

          variant5 = { tag: "ok", val: sgp4._resource2_slab.remove(data_view(memory).getInt32(ret + 8, true)) };
          break;
        }
        case 1: {
          let variant4;
          switch (data_view(memory).getUint8(ret + 8, true)) {
            case 0: {
              variant4 = {
                tag: "out-of-range-epoch-eccentricity",
                val: {
                  eccentricity: data_view(memory).getFloat64(ret + 16, true),
                },
              };
              break;
            }
            case 1: {
              variant4 = {
                tag: "out-of-range-eccentricity",
                val: {
                  eccentricity: data_view(memory).getFloat64(ret + 16, true),
                  t: data_view(memory).getFloat64(ret + 24, true),
                },
              };
              break;
            }
            case 2: {
              variant4 = {
                tag: "out-of-range-perturbed-eccentricity",
                val: {
                  eccentricity: data_view(memory).getFloat64(ret + 16, true),
                  t: data_view(memory).getFloat64(ret + 24, true),
                },
              };
              break;
            }
            case 3: {
              variant4 = {
                tag: "negative-brouwer-mean-motion",
              };
              break;
            }
            case 4: {
              variant4 = {
                tag: "negative-kozai-mean-motion",
              };
              break;
            }
            case 5: {
              variant4 = {
                tag: "negative-semi-latus-rectum",
                val: {
                  t: data_view(memory).getFloat64(ret + 16, true),
                },
              };
              break;
            }
            case 6: {
              let variant1;
              switch (data_view(memory).getUint8(ret + 16, true)) {
                case 0: {
                  variant1 = {
                    tag: "bad-checksum",
                  };
                  break;
                }
                case 1: {
                  variant1 = {
                    tag: "bad-length",
                  };
                  break;
                }
                case 2: {
                  variant1 = {
                    tag: "bad-first-character",
                  };
                  break;
                }
                case 3: {
                  variant1 = {
                    tag: "expected-float",
                  };
                  break;
                }
                case 4: {
                  variant1 = {
                    tag: "expected-float-with-assumed-decimal-point",
                  };
                  break;
                }
                case 5: {
                  variant1 = {
                    tag: "expected-integer",
                  };
                  break;
                }
                case 6: {
                  variant1 = {
                    tag: "expected-space",
                  };
                  break;
                }
                case 7: {
                  variant1 = {
                    tag: "expected-string",
                  };
                  break;
                }
                case 8: {
                  variant1 = {
                    tag: "float-with-assumed-decimal-point-too-long",
                  };
                  break;
                }
                case 9: {
                  variant1 = {
                    tag: "norad-id-mismatch",
                  };
                  break;
                }
                case 10: {
                  variant1 = {
                    tag: "unknown-classification",
                  };
                  break;
                }
                case 11: {
                  variant1 = {
                    tag: "from-yo-opt-failed",
                  };
                  break;
                }
                case 12: {
                  variant1 = {
                    tag: "from-num-seconds-from-midnight-failed",
                  };
                  break;
                }
                default:
                  throw new RangeError("invalid variant discriminant for ErrorTleWhat");
              }
              let variant2;
              switch (data_view(memory).getUint8(ret + 17, true)) {
                case 0: {
                  variant2 = {
                    tag: "line1",
                  };
                  break;
                }
                case 1: {
                  variant2 = {
                    tag: "line2",
                  };
                  break;
                }
                case 2: {
                  variant2 = {
                    tag: "both",
                  };
                  break;
                }
                default:
                  throw new RangeError("invalid variant discriminant for ErrorTleLine");
              }
              variant4 = {
                tag: "tle",
                val: {
                  what: variant1,
                  line: variant2,
                  start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                  end: data_view(memory).getInt32(ret + 24, true) >>> 0,
                },
              };
              break;
            }
            case 7: {
              const ptr3 = data_view(memory).getInt32(ret + 16, true);
              const len3 = data_view(memory).getInt32(ret + 20, true);
              const list3 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr3, len3));
              free(ptr3, len3, 1);
              variant4 = {
                tag: "json-parse",
                val: list3,
              };
              break;
            }
            default:
              throw new RangeError("invalid variant discriminant for Error");
          }

          variant5 = { tag: "err", val: variant4 };
          break;
        }
        default: {
          throw new RangeError("invalid variant discriminant for expected");
        }
      }
      return variant5;
    } //throw new TypeError('expected instance of Elements');
  }
  static fromElementsAfspcCompatibilityMode(sgp4, arg0) {
    const memory = sgp4._exports.memory;
    const free = sgp4._exports["canonical_abi_free"];
    const obj0 = arg0;
    if (!(obj0 instanceof Elements)) throw new TypeError('expected instance of Elements');
    const ret = sgp4._exports['constants::from-elements-afspc-compatibility-mode'](sgp4._resource0_slab.insert(obj0.clone()));
    
    let variant5;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant5 = { tag: "ok", val: sgp4._resource2_slab.remove(data_view(memory).getInt32(ret + 8, true)) };
        break;
      }
      case 1: {
        let variant4;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant4 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant4 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant4 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant4 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant4 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant4 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant1;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant1 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant1 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant1 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant1 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant1 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant1 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant1 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant1 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant1 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant1 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant1 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant1 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant1 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant2;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant2 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant2 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant2 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant4 = {
              tag: "tle",
              val: {
                what: variant1,
                line: variant2,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr3 = data_view(memory).getInt32(ret + 16, true);
            const len3 = data_view(memory).getInt32(ret + 20, true);
            const list3 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr3, len3));
            free(ptr3, len3, 1);
            variant4 = {
              tag: "json-parse",
              val: list3,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant5 = { tag: "err", val: variant4 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant5;
  }
  initialState() {
    const memory = this._obj._exports.memory;
    const obj0 = this;
    const ret = this._obj._exports['constants::initial-state'](this._obj._resource2_slab.insert(obj0.clone()));
    let variant1;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      
      case 0: {
        
        variant1 = null;
        break;
      }
      case 1: {
        
        variant1 = this._obj._resource1_slab.remove(data_view(memory).getInt32(ret + 4, true));
        break;
      }
      
      default:
      throw new RangeError("invalid variant discriminant for option");
    }
    return variant1;
  }
  propagateFromState(arg1, arg2, arg3) {
    const memory = this._obj._exports.memory;
    const free = this._obj._exports["canonical_abi_free"];
    const obj0 = this;
    const variant2 = arg2;
    let variant2_0;
    let variant2_1;
    
    switch (variant2) {
      case null: {
        variant2_0 = 0;
        variant2_1 = 0;
        
        break;
      }
      default: {
        const e = variant2;
        const obj1 = e;
        if (!(obj1 instanceof ResonanceState)) throw new TypeError('expected instance of ResonanceState');
        variant2_0 = 1;
        variant2_1 = this._obj._resource1_slab.insert(obj1.clone());
        
        break;
      }
    }
    const ret = this._obj._exports['constants::propagate-from-state'](this._obj._resource2_slab.insert(obj0.clone()), +arg1, variant2_0, variant2_1, arg3 ? 1 : 0);
    
    let variant7;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant7 = { tag: "ok", val: {
          position: [data_view(memory).getFloat64(ret + 8, true), data_view(memory).getFloat64(ret + 16, true), data_view(memory).getFloat64(ret + 24, true)],
          velocity: [data_view(memory).getFloat64(ret + 32, true), data_view(memory).getFloat64(ret + 40, true), data_view(memory).getFloat64(ret + 48, true)],
        } };
        break;
      }
      case 1: {
        let variant6;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant6 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant6 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant6 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant6 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant6 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant6 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant3;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant3 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant3 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant3 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant3 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant3 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant3 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant3 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant3 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant3 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant3 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant3 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant3 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant3 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant4;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant4 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant4 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant4 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant6 = {
              tag: "tle",
              val: {
                what: variant3,
                line: variant4,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr5 = data_view(memory).getInt32(ret + 16, true);
            const len5 = data_view(memory).getInt32(ret + 20, true);
            const list5 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr5, len5));
            free(ptr5, len5, 1);
            variant6 = {
              tag: "json-parse",
              val: list5,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant7 = { tag: "err", val: variant6 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant7;
  }
  propagate(arg1) {
    const memory = this._obj._exports.memory;
    const free = this._obj._exports["canonical_abi_free"];
    const obj0 = this;
    const ret = this._obj._exports['constants::propagate'](this._obj._resource2_slab.insert(obj0.clone()), +arg1);
    
    let variant5;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant5 = { tag: "ok", val: {
          position: [data_view(memory).getFloat64(ret + 8, true), data_view(memory).getFloat64(ret + 16, true), data_view(memory).getFloat64(ret + 24, true)],
          velocity: [data_view(memory).getFloat64(ret + 32, true), data_view(memory).getFloat64(ret + 40, true), data_view(memory).getFloat64(ret + 48, true)],
        } };
        break;
      }
      case 1: {
        let variant4;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant4 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant4 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant4 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant4 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant4 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant4 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant1;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant1 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant1 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant1 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant1 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant1 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant1 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant1 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant1 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant1 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant1 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant1 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant1 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant1 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant2;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant2 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant2 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant2 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant4 = {
              tag: "tle",
              val: {
                what: variant1,
                line: variant2,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr3 = data_view(memory).getInt32(ret + 16, true);
            const len3 = data_view(memory).getInt32(ret + 20, true);
            const list3 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr3, len3));
            free(ptr3, len3, 1);
            variant4 = {
              tag: "json-parse",
              val: list3,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant5 = { tag: "err", val: variant4 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant5;
  }
  propagateAfspcCompatibilityMode(arg1) {
    const memory = this._obj._exports.memory;
    const free = this._obj._exports["canonical_abi_free"];
    const obj0 = this;
    const ret = this._obj._exports['constants::propagate-afspc-compatibility-mode'](this._obj._resource2_slab.insert(obj0.clone()), +arg1);
    
    let variant5;
    switch (data_view(memory).getUint8(ret + 0, true)) {
      case 0: {
        
        variant5 = { tag: "ok", val: {
          position: [data_view(memory).getFloat64(ret + 8, true), data_view(memory).getFloat64(ret + 16, true), data_view(memory).getFloat64(ret + 24, true)],
          velocity: [data_view(memory).getFloat64(ret + 32, true), data_view(memory).getFloat64(ret + 40, true), data_view(memory).getFloat64(ret + 48, true)],
        } };
        break;
      }
      case 1: {
        let variant4;
        switch (data_view(memory).getUint8(ret + 8, true)) {
          case 0: {
            variant4 = {
              tag: "out-of-range-epoch-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 1: {
            variant4 = {
              tag: "out-of-range-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 2: {
            variant4 = {
              tag: "out-of-range-perturbed-eccentricity",
              val: {
                eccentricity: data_view(memory).getFloat64(ret + 16, true),
                t: data_view(memory).getFloat64(ret + 24, true),
              },
            };
            break;
          }
          case 3: {
            variant4 = {
              tag: "negative-brouwer-mean-motion",
            };
            break;
          }
          case 4: {
            variant4 = {
              tag: "negative-kozai-mean-motion",
            };
            break;
          }
          case 5: {
            variant4 = {
              tag: "negative-semi-latus-rectum",
              val: {
                t: data_view(memory).getFloat64(ret + 16, true),
              },
            };
            break;
          }
          case 6: {
            let variant1;
            switch (data_view(memory).getUint8(ret + 16, true)) {
              case 0: {
                variant1 = {
                  tag: "bad-checksum",
                };
                break;
              }
              case 1: {
                variant1 = {
                  tag: "bad-length",
                };
                break;
              }
              case 2: {
                variant1 = {
                  tag: "bad-first-character",
                };
                break;
              }
              case 3: {
                variant1 = {
                  tag: "expected-float",
                };
                break;
              }
              case 4: {
                variant1 = {
                  tag: "expected-float-with-assumed-decimal-point",
                };
                break;
              }
              case 5: {
                variant1 = {
                  tag: "expected-integer",
                };
                break;
              }
              case 6: {
                variant1 = {
                  tag: "expected-space",
                };
                break;
              }
              case 7: {
                variant1 = {
                  tag: "expected-string",
                };
                break;
              }
              case 8: {
                variant1 = {
                  tag: "float-with-assumed-decimal-point-too-long",
                };
                break;
              }
              case 9: {
                variant1 = {
                  tag: "norad-id-mismatch",
                };
                break;
              }
              case 10: {
                variant1 = {
                  tag: "unknown-classification",
                };
                break;
              }
              case 11: {
                variant1 = {
                  tag: "from-yo-opt-failed",
                };
                break;
              }
              case 12: {
                variant1 = {
                  tag: "from-num-seconds-from-midnight-failed",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleWhat");
            }
            let variant2;
            switch (data_view(memory).getUint8(ret + 17, true)) {
              case 0: {
                variant2 = {
                  tag: "line1",
                };
                break;
              }
              case 1: {
                variant2 = {
                  tag: "line2",
                };
                break;
              }
              case 2: {
                variant2 = {
                  tag: "both",
                };
                break;
              }
              default:
              throw new RangeError("invalid variant discriminant for ErrorTleLine");
            }
            variant4 = {
              tag: "tle",
              val: {
                what: variant1,
                line: variant2,
                start: data_view(memory).getInt32(ret + 20, true) >>> 0,
                end: data_view(memory).getInt32(ret + 24, true) >>> 0,
              },
            };
            break;
          }
          case 7: {
            const ptr3 = data_view(memory).getInt32(ret + 16, true);
            const len3 = data_view(memory).getInt32(ret + 20, true);
            const list3 = UTF8_DECODER.decode(new Uint8Array(memory.buffer, ptr3, len3));
            free(ptr3, len3, 1);
            variant4 = {
              tag: "json-parse",
              val: list3,
            };
            break;
          }
          default:
          throw new RangeError("invalid variant discriminant for Error");
        }
        
        variant5 = { tag: "err", val: variant4 };
        break;
      }
      default: {
        throw new RangeError("invalid variant discriminant for expected");
      }
    }
    return variant5;
  }
}

module.exports = { Sgp4, Elements, ResonanceState, Constants };
