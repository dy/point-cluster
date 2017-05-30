'use strict';

var kdbush = require('kdbush');
var extend = require('object-assign');
var clamp = require('clamp')

module.exports = PointCluster;

function PointCluster(points, options) {
    if (!(this instanceof PointCluster)) return new PointCluster(points, options)

    this.options = extend(Object.create(this.options), options);
    this.trees = new Array(this.options.maxZoom + 1);

    this.load(points)
}

PointCluster.prototype.options = {
    minZoom: 0,   // min zoom to generate clusters on
    maxZoom: 16,  // max zoom level to cluster the points on
    radius: 0.1,   // cluster radius in pixels
    nodeSize: 64 // size of the KD-tree leaf node, affects performance
}

PointCluster.prototype.load = function (points) {
    // generate a cluster object for each point and index input points into a KD-tree
    var clusters = this.points = Array(points.length)
    for (var i = 0, l = points.length; i < l; i++) {
        clusters[i] = {
            x: points[i][0], // projected point coordinates
            y: points[i][1],
            zoom: Infinity, // the last zoom the point was processed at
            id: i, // index of the source feature in the original input array
            parentId: -1, // parent cluster id
            numPoints: 0
        }
    }
    this.trees[this.options.maxZoom + 1] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);

    // cluster points on max zoom, then cluster the results on previous zoom, etc.;
    // results in a cluster hierarchy across zoom levels
    for (var z = this.options.maxZoom; z >= this.options.minZoom; z--) {
        // create a new set of clusters for the zoom and index them with a KD-tree
        clusters = this._cluster(clusters, z);
        this.trees[z] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);
    }

    return this;
}

PointCluster.prototype.getClusters = function (bbox, zoom) {
    zoom = Math.round(zoom)
    var tree = this.trees[clamp(zoom, this.options.minZoom, this.options.maxZoom + 1)];
    var ids = tree.range(bbox[0], bbox[1], bbox[0] + bbox[2], bbox[1] + bbox[3]);
    var clusters = [];
    for (var i = 0; i < ids.length; i++) {
        var c = tree.points[ids[i]];
        //FIXME: optimize this
        if (!c.cluster && c.numPoints) c.cluster = true
        clusters.push(c.numPoints ? c : this.points[c.id]);
    }
    return clusters;
}

PointCluster.prototype.getChildren = function (clusterId, clusterZoom) {
    var origin = this.trees[clusterZoom + 1].points[clusterId];
    var r = this.options.radius / Math.pow(2, clusterZoom);
    var ids = this.trees[clusterZoom + 1].within(origin.x, origin.y, r);
    var children = [];
    for (var i = 0; i < ids.length; i++) {
        var c = this.trees[clusterZoom + 1].points[ids[i]];
        if (c.parentId === clusterId) {
            //FIXME: optimize this
            if (!c.cluster && c.numPoints) c.cluster = true
            children.push(c.numPoints ? c : this.points[c.id]);
        }
    }
    return children;
}

PointCluster.prototype.getLeaves = function (clusterId, clusterZoom, limit, offset) {
    limit = limit || 10;
    offset = offset || 0;

    var leaves = [];
    this._appendLeaves(leaves, clusterId, clusterZoom, limit, offset, 0);

    return leaves;
}

PointCluster.prototype.getClusterExpansionZoom = function (clusterId, clusterZoom) {
    while (clusterZoom < this.options.maxZoom) {
        var children = this.getChildren(clusterId, clusterZoom);
        clusterZoom++;
        if (children.length !== 1) break;
        clusterId = children[0].id;
    }
    return clusterZoom;
}

PointCluster.prototype._appendLeaves = function (result, clusterId, clusterZoom, limit, offset, skipped) {
    var children = this.getChildren(clusterId, clusterZoom);

    for (var i = 0; i < children.length; i++) {
        var node = children[i];

        if (node.cluster) {
            if (skipped + node.numPoints <= offset) {
                // skip the whole cluster
                skipped += node.numPoints;
            } else {
                // enter the cluster
                skipped = this._appendLeaves(
                    result, node.id, clusterZoom + 1, limit, offset, skipped);
                // exit the cluster
            }
        } else if (skipped < offset) {
            // skip a single point
            skipped++;
        } else {
            // add a single point
            result.push(children[i]);
        }
        if (result.length === limit) break;
    }

    return skipped;
}

PointCluster.prototype._cluster = function (points, zoom) {
    var clusters = [];
    var r = this.options.radius / Math.pow(2, zoom);

    // loop through each point
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        // if we've already visited the point at this zoom level, skip it
        if (p.zoom <= zoom) continue;
        p.zoom = zoom;

        // find all nearby points
        var tree = this.trees[zoom + 1];
        var neighborIds = tree.within(p.x, p.y, r);

        var numPoints = p.numPoints || 1;
        var wx = p.x * numPoints;
        var wy = p.y * numPoints;

        for (var j = 0; j < neighborIds.length; j++) {
            var b = tree.points[neighborIds[j]];
            // filter out neighbors that are already processed
            if (b.zoom <= zoom) continue;
            b.zoom = zoom; // save the zoom (so it doesn't get processed twice)

            var numPoints2 = b.numPoints || 1;
            wx += b.x * numPoints2; // accumulate coordinates for calculating weighted center
            wy += b.y * numPoints2;

            numPoints += numPoints2;
            b.parentId = i;
        }

        if (numPoints === 1) {
            clusters.push(p);
        } else {
            p.parentId = i;
            clusters.push({
                x: wx / numPoints,
                y: wy / numPoints,
                id: i,
                zoom: Infinity, // the last zoom the cluster was processed at
                parentId: -1, // parent cluster id
                numPoints: numPoints
            });
        }
    }

    return clusters;
}

function getX(p) {
    return p.x;
}
function getY(p) {
    return p.y;
}
