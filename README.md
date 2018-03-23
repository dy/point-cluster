# point-cluster [![Build Status](https://travis-ci.org/dfcreative/point-cluster.svg?branch=master)](https://travis-ci.org/dfcreative/point-cluster) [![experimental](https://img.shields.io/badge/stability-experimental-red.svg)](http://github.com/badges/stability-badges)

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
let selected = ids.range(10, 10, 20, 20)
```

## API

### `tree = cluster(points, options?)`

Create index tree for the set of 2d `points` based on `options`.

`points` is an array of `[x,y, x,y, ...]` or `[[x,y], [x,y], ...]` coordinates.

#### `options`

Option | Default | Description
---|---|---
`bounds` | `auto` | Data bounds, if different from `coords` bounds, eg. in case of subdata.
`maxDepth` | `8192` | Max number of levels.
<!-- `nodeSize` | `1` | Min size of node, ie. tree traversal is stopped once the node contains less than the indicated number of points. -->
<!-- `sort` | `false` | Sort output cluster values by x-, y-coordinate or radius. By default is sorted in tree order (z-curve in case of quadtree). Can be useful for faster rendering. -->
<!-- `levelPoint` | `'first'` | `'first'`, `'last'` or a function, returning point id for the level. -->

### `tree.ids`, `tree.levels`

Point ids distributed by zoom levels of details. Handy to form a buffer in WebGL and use `tree.lod` method to get subranges of buffer to render.

### `tree.range(minX, minY, maxX, maxY)`

Get point ids from the indicated range.

### `tree.lod(pxSize, minX, minY, maxX, maxY)`

Get offsets for the points visible at a specific zoom level and range. Returns list of arrays corresponding to `points.levels` ranges, eg. `[[120, 200], [1120, 1540], ...]`. Useful for obtaining subranges to render.



### Related

* [snap-points-2d](https://github.com/gl-vis/snap-points-2d) − grouping points by pixels.
* [kdgrass](https://github.com/dfcreative/kdgrass) − minimal kd-tree implementation.
* [regl-scatter2d](https://github.com/dfreative/regl-scatter2d) − highly performant scatter plot.


## License

© 2017 Dmitry Yv. MIT License

Development supported by [plot.ly](https://github.com/plotly/).
