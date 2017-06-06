'use strict';

var test = require('tape').test;
var clusterPoints = require('./');
var snap = require('snap-points-2d')

test('huge number of points', t => {
    var pts = []
    for (let i = 0; i < 2e7; i++) {
        pts.push(Math.random())
        pts.push(Math.random())
    }

    console.time('index')
    let cluster = clusterPoints(pts)
    console.timeEnd('index')

    console.time('r=1')
    console.log(cluster.getPoints(1.4).length)
    console.timeEnd('r=1')
})

let positions = [0,0, 1,1, -1,-1, 1,-1, -1,1, 0,1, 0,-1, 1,0, -1,0]
