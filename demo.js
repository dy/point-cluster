'use strict'

const cluster = require('./')
const random = require('gauss-random')
const getBounds = require('array-bounds')
const fit = require('canvas-fit')
const snap = require('../snap-points-2d')
const regl = require('regl')({extensions: 'oes_element_index_uint'})

//render points
let N = 1e6
let pts = Array(N*2)

for (let i = 0; i < N; i++) {
	pts[i*2] = random()
	pts[i*2 + 1] = random()
}

// pts = [0,0, 1,1, 2,2, 3,3, 4,4, 5,5, 0,1, 0,2, 0,3, 0,4, 1,1, 1,2, 1,3, 1,4]

// window.pts = pts
// pts = require('./pts')


const drawPoints = require('../regl-scatter2d')( regl, {
	color: 'rgba(0,0,255,.15)', size: 5, points: pts, snap: false
})


//create canvas for rects
let canvas = document.body.appendChild(document.createElement('canvas'))
let ctx = canvas.getContext('2d')

fit(canvas)

let w = canvas.width;
let h = canvas.height;

let bounds = getBounds(pts, 2)
let range = [bounds[2] - bounds[0], bounds[3] - bounds[1]]

let c = 0

let cx = (bounds[0] + bounds[2]) * .5
let cy = (bounds[1] + bounds[3]) * .5
let d = Math.max(bounds[2] - bounds[0], bounds[3] - bounds[1])
let r = d / 2
let x = bounds[0]
let y = bounds[1]

console.time(1)
let index = cluster(pts)
console.timeEnd(1)
let {levels, ids} = index


// console.time(2)
// let {levels, ids} = snap(pts)
// console.timeEnd(2)

for (let i = 0, l = levels.length; i < l; i++) {
	// if (i < 9) continue;

	let lvl = levels[i]

	drawPoints.update({color: `rgba(${255*i/l},${255*i/l},${255*i/l},.5)`})
	drawPoints.draw(ids.slice(lvl.offset, lvl.offset + lvl.count))
}


function snapSplit (ids, points, done) {
	let x = ids.x || bounds[0],
		y = ids.y || bounds[1],
		r = ids.r || d / 2,
		r2 = r * .5

	if (c++ > 20) throw 'rec'

	drawPoints({ids: ids, color: 'rgba(0,0,0,.25)'})


	let offset = 0

	for(var a=0; a<2; a++) {
      for(var b=0; b<2; b++) {
        var lox = x + a*r
        var loy = y + b*r
        var hix = lox + r
        var hiy = loy + r

        ctx.fillStyle = 'rgba(255, 0, 0, .05)'

		ctx.fillRect(
			w * ((x - bounds[0]) / range[0]) || 0,
			h - (h * ((y - bounds[1]) / range[1]) || 0) - h * r / range[1],
			w * r / range[0],
			h * r / range[1]
		)

        //partition - put points within the box to the left
        var mid = offset, i = offset, l = ids.length
        for(; i<l; i++) {
          var id  = ids[i]
          var px  = points[2*id]
          var py  = points[2*id+1]

          if(lox <= px && px <= hix &&
             loy <= py && py <= hiy) {
            if (i > mid) {
              ids[i] = ids[mid]
              ids[mid] = id
            }
            mid++
          }
        }

        if(mid === 0) {
        	continue
        }

        let subids = ids.subarray(offset, mid)
        subids.x = lox
        subids.y = loy
        subids.r = r2
        subids.d = r

	    done(subids)

        // snapRec(lox, loy, diam_2, offset, mid, level+1)
        offset = mid
      }
    }
}

function kdsection (ids, points, node) {

}

function quadsection (ids, points) {
	let box
	// if(c++ > 40) throw Error('recursion')


	// let div = ids.length*.25

	// let groups = [
	// 	ids.slice(0, ~~div), ids.slice(~~div, ~~(div*2)), ids.slice(~~(div*2), ~~(div*3)), ids.slice(~~(div*3))
	// ]

	// return groups


	//parent box is data box
	if (!node.parent) {
		box = getBounds(points, 2)
	}
	//child box is parent box
	else {
		box = node.parent.childBox[node.id]
	}


	// drawPoints({ids: ids})

	// let boxdim = [box[2] - box[0], box[3] - box[1]]
	// ctx.fillStyle = 'rgba(255, 0, 0, .15)'
	// ctx.fillRect(
	// 	w * ((box[0] - bounds[0]) / range[0]) || 0,
	// 	h - (h * ((box[1] - bounds[1]) / range[1]) || 0) - h * boxdim[1] / range[1],
	// 	w * boxdim[0] / range[0],
	// 	h * boxdim[1] / range[1]
	// )

	// ctx.fillStyle = 'rgba(0,0,127,.9)'
	// ctx.textBaseline = 'bottom'
	// ctx.fillText(
	// 	ids.length,//.toFixed(2),
	// 	w * ((box[0] - bounds[0]) / range[0] || 0),
	// 	h - h * ((box[1] - bounds[1]) / range[1] || 0)
	// )

	let [l,t,r,b] = box
	let [cx, cy] = [(r + l) * .5, (b + t) * .5]

	node.childBox = [
		[l, t, cx, cy],
		[cx, t, r, cy],
		[l, cy, cx, b],
		[cx, cy, r, b]
	]

	//collect tl/tr/bl/br parts
	let groups = [[], [], [], []]
	for (let i = 0, len = ids.length; i < len; i++) {
		let g = 0
		let id = ids[i]
		let x = points[id<<1]
		let y = points[1 + (id<<1)]
		if (x-l > r-x) g++
		if (y-t > b-y) g+=2
		groups[g].push(id)
	}

	return groups
}



//render lines
// ctx.beginPath()
// ctx.moveTo(0, h/2)
// ctx.lineTo(w, h/2)
// ctx.strokeStyle = 'black'
// ctx.lineWidth = 1
// ctx.stroke()
