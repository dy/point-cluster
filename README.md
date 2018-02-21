# point-cluster [![Build Status](https://travis-ci.org/dfcreative/point-cluster.svg?branch=master)](https://travis-ci.org/dfcreative/point-cluster)

Point clustering for data-visualization purposes. Implements kdtree, quadtree, ANN tree, rdtree and any other custom tree.

Requirements:

* point radius
* closest/range methods
* z-index order
* no noticeable clustering artifacts
* faster than kd-tree (optionally), as fast as snap-points-2d
* allow appending/removing points (optionally)
* splatting by zoom layers as snap-points-2d
* no memory overuse
* adding points
* keeping visible points in reclustering

```js
const cluster = require('point-cluster')

// build a tree
let tree = cluster(points)


```

## API

### `index = cluster(points, options?)`

Create index tree for the set of points based on options.

`points` is an array of `[x,y, x,y, ...]` or `[[x,y], [x,y], ...]` form.

`split` is a function with the signature:

```js
split(ids) {
	//sort ids in the ascending group order first
	...

	//invoke done callbacks for every subgroup of ids need further secioning
	split(ids.subarray(0, group1))
	split(ids.subarray(group1, group2))
	...
	split(ids.subarray(groupN))
}
```

Option | Default | Description
---|---|---
`data` | `{}` | Provides initial data for root node, like diam, center, data bounds etc.
`traversal` | `'depth'` | `depth`-first or `breadth`-first order of tree sorting. First is a bit faster, second might be more useful for rendering applications as invokes `split` by levels.
`nodeSize` | `1` | Min size of node, bigger values increase performance but may not be suitable for rendering
`xsort` | `false` | Sort output cluster values by x-coordinate, can be useful for faster rendering (splatting, see snap-points-2d)
`reverse` | `false` | Form layers based on last point from the set rather than the first. May be useful to preserve z-order of points

### `tree.level(n)`

Get points belonging to a specific level.

### `tree.range([left, top, right, bottom])`

Get set of points from the rectangular range.

### `tree.radius([x, y], r)`

Get points within defined radius of a coordinate.


### Related

* [snap-points-2d](https://github.com/gl-vis/snap-points-2d) — grouping points by pixels.
* [kdgrass](https://github.com/dfcreative/kdgrass) — minimal kd-tree implementation.
