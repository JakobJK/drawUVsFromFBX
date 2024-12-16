# drawUVsFromFBX

A CLI tool that generate images of the UVs of an FBX mesh written in JavaScript. Uses [Minimist](https://github.com/minimistjs/minimist), [Skia](https://github.com/samizdatco/skia-canvas), and [FBX-parser](https://github.com/picode7/fbx-parser).

There's no reason this cannot run entirely client-side, which is dope.

```bash 
node ./index.mjs --file ./model.fbx --output ./uvs.png
```

![UVs of half a face - scary!](./uvs.png)
