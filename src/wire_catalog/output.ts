// The response shape depends entirely on whether `slug` was passed: the
// no-slug call returns a catalog roster ({ catalogs: [...] }-shaped), a
// slug call returns one catalog's full action list with parameter schemas.
// anakin-mcp's src/client.ts types this the same way (`Promise<unknown>`
// for wireCatalog) — modeled here as an open object for the same reason.
export type WireCatalogOutput = Record<string, unknown>;
