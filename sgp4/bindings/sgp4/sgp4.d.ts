export type Result<T, E> = { tag: "ok", val: T } | { tag: "err", val: E };
/**
* underlying structs and variants for errors
*/
export type ErrorTleWhat = ErrorTleWhatBadChecksum | ErrorTleWhatBadLength | ErrorTleWhatBadFirstCharacter | ErrorTleWhatExpectedFloat | ErrorTleWhatExpectedFloatWithAssumedDecimalPoint | ErrorTleWhatExpectedInteger | ErrorTleWhatExpectedSpace | ErrorTleWhatExpectedString | ErrorTleWhatFloatWithAssumedDecimalPointTooLong | ErrorTleWhatNoradIdMismatch | ErrorTleWhatUnknownClassification | ErrorTleWhatFromYoOptFailed | ErrorTleWhatFromNumSecondsFromMidnightFailed;
export interface ErrorTleWhatBadChecksum {
  tag: "bad-checksum",
}
export interface ErrorTleWhatBadLength {
  tag: "bad-length",
}
export interface ErrorTleWhatBadFirstCharacter {
  tag: "bad-first-character",
}
export interface ErrorTleWhatExpectedFloat {
  tag: "expected-float",
}
export interface ErrorTleWhatExpectedFloatWithAssumedDecimalPoint {
  tag: "expected-float-with-assumed-decimal-point",
}
export interface ErrorTleWhatExpectedInteger {
  tag: "expected-integer",
}
export interface ErrorTleWhatExpectedSpace {
  tag: "expected-space",
}
export interface ErrorTleWhatExpectedString {
  tag: "expected-string",
}
export interface ErrorTleWhatFloatWithAssumedDecimalPointTooLong {
  tag: "float-with-assumed-decimal-point-too-long",
}
export interface ErrorTleWhatNoradIdMismatch {
  tag: "norad-id-mismatch",
}
export interface ErrorTleWhatUnknownClassification {
  tag: "unknown-classification",
}
export interface ErrorTleWhatFromYoOptFailed {
  tag: "from-yo-opt-failed",
}
export interface ErrorTleWhatFromNumSecondsFromMidnightFailed {
  tag: "from-num-seconds-from-midnight-failed",
}
export type ErrorTleLine = ErrorTleLineLine1 | ErrorTleLineLine2 | ErrorTleLineBoth;
export interface ErrorTleLineLine1 {
  tag: "line1",
}
export interface ErrorTleLineLine2 {
  tag: "line2",
}
export interface ErrorTleLineBoth {
  tag: "both",
}
export interface OutOfRangeEpochEccentricity {
  eccentricity: number,
}
export interface OutOfRangeEccentricity {
  eccentricity: number,
  t: number,
}
export interface OutOfRangePerturbedEccentricity {
  eccentricity: number,
  t: number,
}
export interface NegativeSemiLatusRectum {
  t: number,
}
export interface Tle {
  what: ErrorTleWhat,
  line: ErrorTleLine,
  start: number,
  end: number,
}
/**
* main error variant
*/
export type Error = ErrorOutOfRangeEpochEccentricity | ErrorOutOfRangeEccentricity | ErrorOutOfRangePerturbedEccentricity | ErrorNegativeBrouwerMeanMotion | ErrorNegativeKozaiMeanMotion | ErrorNegativeSemiLatusRectum | ErrorTle | ErrorJsonParse;
export interface ErrorOutOfRangeEpochEccentricity {
  tag: "out-of-range-epoch-eccentricity",
  val: OutOfRangeEpochEccentricity,
}
export interface ErrorOutOfRangeEccentricity {
  tag: "out-of-range-eccentricity",
  val: OutOfRangeEccentricity,
}
export interface ErrorOutOfRangePerturbedEccentricity {
  tag: "out-of-range-perturbed-eccentricity",
  val: OutOfRangePerturbedEccentricity,
}
export interface ErrorNegativeBrouwerMeanMotion {
  tag: "negative-brouwer-mean-motion",
}
export interface ErrorNegativeKozaiMeanMotion {
  tag: "negative-kozai-mean-motion",
}
export interface ErrorNegativeSemiLatusRectum {
  tag: "negative-semi-latus-rectum",
  val: NegativeSemiLatusRectum,
}
export interface ErrorTle {
  tag: "tle",
  val: Tle,
}
export interface ErrorJsonParse {
  tag: "json-parse",
  val: string,
}
export interface UnixTimestamp {
  secs: bigint,
  nsecs: number,
}
/**
* # Variants
* 
* ## `"unclassified"`
* 
* ## `"classified"`
* 
* ## `"secret"`
*/
export type Classification = "unclassified" | "classified" | "secret";
/**
* Geopotential Struct
*/
export interface Geopotential {
  ae: number,
  ke: number,
  j2: number,
  j3: number,
  j4: number,
}
/**
* Orbit Struct
*/
export interface Orbit {
  inclination: number,
  rightAscension: number,
  eccentricity: number,
  argumentOfPerigee: number,
  meanAnomaly: number,
  meanMotion: number,
}
/**
* Prediction Struct
*/
export interface Prediction {
  position: [number, number, number],
  velocity: [number, number, number],
}
/**
* # Variants
* 
* ## `"afspc"`
* 
* ## `"iau"`
*/
export type EpochToSiderealTimeAlgorithm = "afspc" | "iau";
export class Sgp4 {
  
  /**
  * The WebAssembly instance that this class is operating with.
  * This is only available after the `instantiate` method has
  * been called.
  */
  instance: WebAssembly.Instance;
  
  /**
  * Constructs a new instance with internal state necessary to
  * manage a wasm instance.
  *
  * Note that this does not actually instantiate the WebAssembly
  * instance or module, you'll need to call the `instantiate`
  * method below to "activate" this class.
  */
  constructor();
  
  /**
  * This is a low-level method which can be used to add any
  * intrinsics necessary for this instance to operate to an
  * import object.
  *
  * The `import` object given here is expected to be used later
  * to actually instantiate the module this class corresponds to.
  * If the `instantiate` method below actually does the
  * instantiation then there's no need to call this method, but
  * if you're instantiating manually elsewhere then this can be
  * used to prepare the import object for external instantiation.
  */
  addToImports(imports: any): void;
  
  /**
  * Initializes this object with the provided WebAssembly
  * module/instance.
  *
  * This is intended to be a flexible method of instantiating
  * and completion of the initialization of this class. This
  * method must be called before interacting with the
  * WebAssembly object.
  *
  * The first argument to this method is where to get the
  * wasm from. This can be a whole bunch of different types,
  * for example:
  *
  * * A precompiled `WebAssembly.Module`
  * * A typed array buffer containing the wasm bytecode.
  * * A `Promise` of a `Response` which is used with
  *   `instantiateStreaming`
  * * A `Response` itself used with `instantiateStreaming`.
  * * An already instantiated `WebAssembly.Instance`
  *
  * If necessary the module is compiled, and if necessary the
  * module is instantiated. Whether or not it's necessary
  * depends on the type of argument provided to
  * instantiation.
  *
  * If instantiation is performed then the `imports` object
  * passed here is the list of imports used to instantiate
  * the instance. This method may add its own intrinsics to
  * this `imports` object too.
  */
  instantiate(
  module: WebAssembly.Module | BufferSource | Promise<Response> | Response | WebAssembly.Instance,
  imports?: any,
  ): Promise<void>;
  orbitFromKozaiElements(geopotential: Geopotential, inclination: number, rightAscension: number, eccentricity: number, argumentOfPerigee: number, meanAnomaly: number, kozaiMeanMotion: number): Result<Orbit, Error>;
  /**
  * Constant WGS72
  */
  wgs72(): Geopotential;
  /**
  * Constant WGS84
  */
  wgs84(): Geopotential;
  afspcEpochToSiderealTime(epoch: number): number;
  iauEpochToSiderealTime(epoch: number): number;
  parse2les(tles: string): Result<Elements[], Error>;
  parse3les(tles: string): Result<Elements[], Error>;
}

export class Elements {
  // Creates a new strong reference count as a new
  // object.  This is only required if you're also
  // calling `drop` below and want to manually manage
  // the reference count from JS.
  //
  // If you don't call `drop`, you don't need to call
  // this and can simply use the object from JS.
  clone(): Elements;
  
  // Explicitly indicate that this JS object will no
  // longer be used. If the internal reference count
  // reaches zero then this will deterministically
  // destroy the underlying wasm object.
  //
  // This is not required to be called from JS. Wasm
  // destructors will be automatically called for you
  // if this is not called using the JS
  // `FinalizationRegistry`.
  //
  // Calling this method does not guarantee that the
  // underlying wasm object is deallocated. Something
  // else (including wasm) may be holding onto a
  // strong reference count.
  drop(): void;
  static fromTle(sgp4: Sgp4, objectName: string | null, line1: string, line2: string): Result<Elements, Error>;
  static fromJson(sgp4: Sgp4, json: string): Result<Elements, Error>;
  epoch(): number;
  epochAfspcCompatibilityMode(): number;
  getObjectName(): string | null;
  getInternationalDesignator(): string | null;
  getNoradId(): bigint;
  getClassification(): Classification;
  getDatetime(): UnixTimestamp;
  getMeanMotionDot(): number;
  getMeanMotionDdot(): number;
  getDragTerm(): number;
  getElementSetNumber(): bigint;
  getInclination(): number;
  getRightAscension(): number;
  getEccentricity(): number;
  getArgumentOfPerigee(): number;
  getMeanAnomaly(): number;
  getMeanMotion(): number;
  getRevolutionNumber(): bigint;
  getEphemerisType(): number;
}

export class ResonanceState {
  // Creates a new strong reference count as a new
  // object.  This is only required if you're also
  // calling `drop` below and want to manually manage
  // the reference count from JS.
  //
  // If you don't call `drop`, you don't need to call
  // this and can simply use the object from JS.
  clone(): ResonanceState;
  
  // Explicitly indicate that this JS object will no
  // longer be used. If the internal reference count
  // reaches zero then this will deterministically
  // destroy the underlying wasm object.
  //
  // This is not required to be called from JS. Wasm
  // destructors will be automatically called for you
  // if this is not called using the JS
  // `FinalizationRegistry`.
  //
  // Calling this method does not guarantee that the
  // underlying wasm object is deallocated. Something
  // else (including wasm) may be holding onto a
  // strong reference count.
  drop(): void;
  t(): number;
}

export class Constants {
  // Creates a new strong reference count as a new
  // object.  This is only required if you're also
  // calling `drop` below and want to manually manage
  // the reference count from JS.
  //
  // If you don't call `drop`, you don't need to call
  // this and can simply use the object from JS.
  clone(): Constants;
  
  // Explicitly indicate that this JS object will no
  // longer be used. If the internal reference count
  // reaches zero then this will deterministically
  // destroy the underlying wasm object.
  //
  // This is not required to be called from JS. Wasm
  // destructors will be automatically called for you
  // if this is not called using the JS
  // `FinalizationRegistry`.
  //
  // Calling this method does not guarantee that the
  // underlying wasm object is deallocated. Something
  // else (including wasm) may be holding onto a
  // strong reference count.
  drop(): void;
  static new(sgp4: Sgp4, geopotential: Geopotential, epochToSiderealTime: EpochToSiderealTimeAlgorithm, epoch: number, dragItem: number, orbit0: Orbit): Result<Constants, Error>;
  static fromElements(sgp4: Sgp4, elements: Elements): Result<Constants, Error>;
  static fromElementsAfspcCompatibilityMode(sgp4: Sgp4, elements: Elements): Result<Constants, Error>;
  initialState(): ResonanceState | null;
  propagateFromState(t: number, state: ResonanceState | null, afspcCompatibilityMode: boolean): Result<Prediction, Error>;
  propagate(t: number): Result<Prediction, Error>;
  propagateAfspcCompatibilityMode(t: number): Result<Prediction, Error>;
}
