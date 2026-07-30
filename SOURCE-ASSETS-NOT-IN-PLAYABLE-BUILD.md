# Source Assets Not Included in the Playable Build

Prototype 2.9A.22 uses compressed WebP fighter atlases at runtime.

The public release intentionally omits:

- duplicate PNG versions of runtime atlases
- Bark and Wade source sprite sheets
- the Sage reference sheet
- atlas-generation Python tools
- obsolete patch-history packages and old build manifests

Keep original source sheets separately before making future atlas edits. They are development inputs, not browser runtime files.
