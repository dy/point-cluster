# point-cluster [![Build Status](https://travis-ci.org/dfcreative/point-cluster.svg?branch=master)](https://travis-ci.org/dfcreative/point-cluster) [![experimental](https://img.shields.io/badge/stability-experimental-yellow.svg)](http://github.com/badges/stability-badges)

Point clustering for 2D spatial indexing. Incorporates optimized quad-tree data structure.

<!--
* [ ] quad-tree, kd-tree, ann-tree and other tree types.
* [x] splatting by zoom layers.
* [x] point selection/hover by range.
* [ ] point radius and weight.
* [ ] reverse z-index order mode to keep visible points in reclustering.
* [ ] appending/removing points.
* [x] no visually noticeable clustering artifacts.
* [x] high performance (faster than [snap-points-2d](https://github.com/gl-vis/snap-points-2d)).
* [x] no memory overuse.

[DEMO](https://github.com/dfcreative/point-cluster)
-->


```js
const cluster = require('point-cluster')

let ids = cluster(points)

// get point ids within the indicated range
let selectedIds = ids.range([10, 10, 20, 20])

// get levels of details: list of ids subranges for rendering purposes
let lod = ids.range([10, 10, 20, 20], { lod: true })
```

## API

### `ids = cluster(points, options?)`

Create index for the set of 2d `points` based on `options`.

`points` is an array of `[x,y, x,y, ...]` or `[[x,y], [x,y], ...]` coordinates.

`ids` is _Uint32Array_ with point ids sorted by zoom levels, suitable for WebGL buffer, subranging or alike.

#### `options`

Option | Default | Description
---|---|---
`bounds` | `auto` | Data bounds, if different from `points` bounds, eg. in case of subdata.
`depth` | `256` | Max number of levels. Points below the indicated level are grouped into single level.
<!-- `node` | `1` | Min size of node, ie. tree traversal is stopped once the node contains less than the indicated number of points. -->
<!-- `sort` | `'z'` | Sort values within levels by `x`-, `y`-coordinate, `z`-curve or `r` - point radius. `z` is the fastest for init, `x` or `y` are faster for `lod` and `r` is the most data-relevant. -->
<!-- `pick` | `'first'` | `'first'`, `'last'` or a function, returning point id for the level. -->


### `result = ids.range(box?, options?)`

Get point ids from the indicated range.

`box` can be any rectangle format, eg. `[l, t, r, b]`, see [parse-rect](https://github.com/dfcreative/parse-rect).

`options.lod` makes result contain list of level details instead of ids, useful for obtaining subranges to render.

`options.d` can indicate the pixel size (number or a `w, h` couple) to search for, to ignore lower levels. Alternately, `options.level` can limit max level.

```js
let levels = ids.range([0,0, 100, 100], { lod: true, d: dataRange / canvas.width })

levels.forEach([from, to] => {
	// offset and count point to range in `ids` array
	render( ids.subarray( from, to ) )
})
```


### Related

* [snap-points-2d](https://github.com/gl-vis/snap-points-2d) − grouping points by pixels.
* [kdgrass](https://github.com/dfcreative/kdgrass) − minimal kd-tree implementation.
* [regl-scatter2d](https://github.com/dfreative/regl-scatter2d) − highly performant scatter2d plot.


## License

© 2017 Dmitry Yv. MIT License

Development supported by [plot.ly](https://github.com/plotly/).
