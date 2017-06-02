# point-cluster [![Build Status](https://travis-ci.org/dfcreative/point-cluster.svg?branch=master)](https://travis-ci.org/dfcreative/point-cluster)

Very fast point clustering for browsers and Node.

```js
var pointCluster = require('point-cluster')

var index = pointCluster(points, {
    radius: 40,
    maxZoom: 16
});
index.getClusters([-180, -85, 180, 85], 2);
```

## Methods

#### `pointCluster(points, options)`

Loads an array `points` of `[[x, y], [x, y], ...]` form. Once loaded, index is immutable.

##### `options`

| Option   | Default | Description                                                       |
|----------|---------|-------------------------------------------------------------------|
| minZoom  | 0       | Minimum zoom level at which clusters are generated.               |
| maxZoom  | 16      | Maximum zoom level at which clusters are generated.               |
| radius   | 0.1      | Cluster radius, in pixels.                                        |
| nodeSize | 64      | Size of the KD-tree leaf node. Affects performance.               |
| log      | false   | Whether timing info should be logged.                             |



### Related

* [snap-points-2d](https://github.com/gl-vis/snap-points-2d) — grouping points by pixels
* [kdgrass](https://github.com/dfcreative/kdgrass) — minimal kd-tree implementation
