/**
 * @module  point-cluster
 */

'use strict';

var kdtree = require('kdgrass');
var extend = require('object-assign');
var clamp = require('clamp')

module.exports = PointCluster;


function PointCluster(points, options) {
    if (!(this instanceof PointCluster)) return new PointCluster(points, options)

    this.points = points
    this.tree = kdtree(points, 64)

    return this
}


PointCluster.prototype.getPoints = function (radius) {
    var points = this.points, tree = this.tree
    var result = []

    //TODO: in order to reduce scale search, we can limit radius by known data bounds

    //object is way faster than Set for .has testing on big number of items
    var marked = {}

    for (var i = 0, l = points.length/2; i < l; i++) {
        var id = i

        // if we've already visited the point at this zoom level, skip it
        if (marked[id]) {
            continue;
        }
        marked[id] = true

        var x = points[id*2]
        var y = points[id*2+1]

        // exclude neighbours from processing
        var neighborIds = tree.within(x, y, radius);

        for (var j = 0; j < neighborIds.length; j++) {
            var b = neighborIds[j];
            if (marked[b]) {
                continue;
            }
            marked[b] = true;
        }

        // put point for the level
        result.push(id)
    }

    return result;
}

