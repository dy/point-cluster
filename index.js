/**
 * @module  point-cluster
 */

'use strict';

var kdtree = require('kdgrass');
var extend = require('object-assign');
var clamp = require('clamp')
var getBounds = require('array-bounds')
var snap = require('snap-points-2d')

module.exports = pointCluster;


function pointCluster(points) {
    var tree = kdtree(points, 1)
    var dataBounds = getBounds(points, 2)

    return cluster

    //returns points belonging to certain scale (that is kdtree level)
    function cluster (dist, bounds) {
        if (!bounds) bounds = dataBounds

        var result = []
        var r = dist/2, r2 = r*r, pr2 = Math.PI * r2
        var box = dataBounds.slice()

        let maxDepth = 25
        getPoints(tree, 0, tree.ids.length - 1, 0, box, 0)

        function getPoints(tree, from, to, axis, box, depth) {
            var coords = tree.coords, ids = tree.ids, nodeSize = tree.nodeSize
            var range = to - from;
            //median
            var m = Math.floor((from + to) / 2);

            //if bottom reached - include every point
            if (range <= nodeSize) {
                // for (var id = from; id <= to; id++) {
                    // var x = coords[2 * id];
                    // var y = coords[2 * id + 1];
                    // if (x >= bounds[0] && x <= bounds[2] && y >= bounds[1] && y <= bounds[3])
                    // addPoint(id)
                // }
                // addPoint(m)
                //pick single random from the range
                // var id = Math.floor(Math.random() * (from - to) + from)
                result.push(ids[m]);
                return
            }

            var x = coords[2 * m];
            var y = coords[2 * m + 1];
            // result.push(ids[m]);


            //if required radius larger than cluster span - exit
            if (sq(box) <= pr2) {
                //TODO: mark points belonging to radius as covered
                result.push(ids[m]);
                return;
            }

            // if (x >= bounds[0] && x <= bounds[2] && y >= bounds[1] && y <= bounds[3]) {
                // var id = Math.floor(Math.random() * range + from)
               // result.push(ids[m]);
            // }

            //go deeper
            axis = (axis + 1) % 2;
            depth++

            if (depth <= maxDepth) {
                getPoints(tree, from, m-1, axis, [box[0], box[1], axis ? x : box[2], axis ? box[3] : y], depth)
                getPoints(tree, m+1, to, axis, [axis ? x : box[0], axis ? box[1] : y, box[2], box[3]], depth)
            }
            else {
                throw 'Max depth reached'
            }
        }

        return result
    }

    function sq(box) {
        var dx = box[2]-box[0]
        var dy = box[3]-box[1]
        return dx*dy
    }

    function maxDist(box) {
        var max = Math.max(box[2]-box[0],box[3]-box[1])
        return max*max
    }

    function sqDist(box) {
        var dx = box[2]-box[0]
        var dy = box[3]-box[1]
        return dx*dx + dy*dy
    }

    //get points covering the area with defined radius
    function cover (radius) {
        var result = []

        //TODO: in order to reduce scale search, we can limit radius by known data bounds
        //TODO: point radius may vary for different points, so take that in account, like id => r

        //object is way faster than Set for .has testing on big number of items
        var marked = {}
        var ids = tree.ids;

        for (var i = 0, l = ids.length; i < l; i++) {
            var id = ids[i]

            // if we've already visited the point at this zoom level, skip it
            if (marked[id]) {
                continue;
            }
            marked[id] = true

            var x = points[id*2]
            var y = points[id*2+1]

            // exclude neighbours from processing
            var neighborIds = tree.within(x, y, radius);
            // var neighborIds = tree.range(x-r, y-r, x+r, y+r);

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
}

