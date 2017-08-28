# point-cluster [![Build Status](https://travis-ci.org/dfcreative/point-cluster.svg?branch=master)](https://travis-ci.org/dfcreative/point-cluster)

Generic performant point clustering for datavis purposes. Covers kd-tree, quadtree, ANN tree etc.

Requirements:

* point radius
* closest/range methods
* z-index order
* no noticeable clustering artifacts
* faster than kd-tree (optionally)
* allow appending/removing points (optionally)
* splatting
* no memory overuse

```js
var cluster = require('point-cluster')

var index = cluster(points);

index.getClusters([-180, -85, 180, 85], 2);
```

## API

### `index = cluster(points, divide?|type?)`

`points` is an array of `[x,y, x,y, ...]` or `[[x,y], [x,y], ...]` form. `divide` is a function with `(ids, points) => [group1, group2, ...]` signature: it takes list of point identifiers `ids` and expects to return all the ids redistributed by subgroups for sectioning. If no groups returned, the node will be considered final. Alternately `type` can pick one of existing clusters, such as `kd`, `quad`, `ann`.

### `index.closest([x, y])`

Get point closest to the coordinates.

### `index.range([left, top, right, bottom])`

Get set of points from the rectangular range.

### `index.radius([x, y], r)`

Get points within defined radius of a coordinate.


### Related

* [snap-points-2d](https://github.com/gl-vis/snap-points-2d) — grouping points by pixels
* [kdgrass](https://github.com/dfcreative/kdgrass) — minimal kd-tree implementation
