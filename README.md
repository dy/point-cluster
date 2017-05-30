# point-cluster [![Simply Awesome](https://img.shields.io/badge/simply-awesome-brightgreen.svg)](https://github.com/mourner/projects) [![Build Status](https://travis-ci.org/dfcreative/point-cluster.svg?branch=master)](https://travis-ci.org/dfcreative/point-cluster)

A very fast JavaScript library for point clustering for browsers and Node.

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


#### `index.getClusters(rect, zoom)`

For the given `rect` array (`[left, top, width, height]`) and integer `zoom`, returns an array of clusters and points `{x, y, numPoints}` objects. The `rect`coordinates are relative of data, `zoom` reflects 2<sup>zoom</sup> number of points per pixel.

#### `index.getChildren(clusterId, clusterZoom)`

Returns the children of a cluster (on the next zoom level) given its id (`cluster_id` value from feature properties) and zoom the cluster was from.

#### `index.getLeaves(clusterId, clusterZoom, limit = 10, offset = 0)`

Returns all the points of a cluster (given its `cluster_id` and zoom), with pagination support:
`limit` is the number of points to return (set to `Infinity` for all points),
and `offset` is the amount of points to skip (for pagination).

#### `index.getClusterExpansionZoom(clusterId, clusterZoom)`

Returns the zoom on which the cluster expands into several children (useful for "click to zoom" feature), given the cluster's `cluster_id` and zoom.
