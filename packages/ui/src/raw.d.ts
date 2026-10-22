// Vite serves a module's own source as a string when the import ends in ?raw.
//
// Used by the test that keeps the filter rules on the server side of the
// client boundary. Reading the file through node:fs is not an option there:
// the unit tests run in a browser environment where import.meta.url is not a
// file URL.
declare module '*?raw' {
  const source: string;
  export default source;
}
