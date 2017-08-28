'use strict'

const cluster = require('./')
const random = require('gauss-random')
const getBounds = require('array-bounds')
const fit = require('canvas-fit')
const snap = require('snap-points-2d')

//render points
let N = 1e4
let pts = Array(N*2)

for (let i = 0; i < N; i++) {
	pts[i*2] = random()
	pts[i*2+1] = random()
}

const drawPoints = require('../regl-scatter2d')({color: 'rgba(0,0,0,.15)', size: 5, points: pts})


//create canvas for rects
let canvas = document.body.appendChild(document.createElement('canvas'))
let ctx = canvas.getContext('2d')

fit(canvas)

let w = canvas.width;
let h = canvas.height;

let bounds = getBounds(pts, 2)



//cluster points
console.time(1)
let index = cluster(pts, quadsection)
console.timeEnd(1)

// console.time(2)
// snap(pts)
// console.timeEnd(2)


function kdsection (ids, points, node) {

}







function quadsection (ids, points, node) {
	let box

	//parent box are data box
	if (!node.parent) {
		box = getBounds(points, 2)
	}
	//child box are parent box
	else {
		//ignore unchanged leafs
		if (node.parent.end === node.end && node.parent.start === node.start) return

		box = node.parent.childBox[node.id]
	}


	// debugger;
	drawPoints({ids: ids})

	//render rect
	let boxdim = [box[2] - box[0], box[3] - box[1]]
	let range = [bounds[2] - bounds[0], bounds[3] - bounds[1]]
	ctx.fillStyle = 'rgba(0, 0, 0, .15)'
	ctx.fillRect(
		w * ((box[0] - bounds[0]) / range[0]) || 0,
		h - (h * ((box[1] - bounds[1]) / range[1]) || 0) - h * boxdim[1] / range[1],
		w * boxdim[0] / range[0],
		h * boxdim[1] / range[1]
	)
	ctx.fillStyle = 'rgba(0,0,127,.9)'
	ctx.textBaseline = 'bottom'
	// ctx.fillText(
	// 	ids.length,//.toFixed(2),
	// 	w * ((box[0] - bounds[0]) / range[0] || 0),
	// 	h - h * ((box[1] - bounds[1]) / range[1] || 0)
	// )

	if (ids.length <= 16) return

	let mid = [(box[2] + box[0]) * .5, (box[3] + box[1]) * .5]

	node.childBox = [
		[box[0], box[1], mid[0], mid[1]],
		[mid[0], box[1], box[2], mid[1]],
		[box[0], mid[1], mid[0], box[3]],
		[mid[0], mid[1], box[2], box[3]]
	]

	//collect tl/tr/bl/br parts
	let groups = [
		collectPointsInRect(ids, points, node.childBox[0]),
		collectPointsInRect(ids, points, node.childBox[1]),
		collectPointsInRect(ids, points, node.childBox[2]),
		collectPointsInRect(ids, points, node.childBox[3])
	]

	return groups
}

function collectPointsInRect (ids, points, rect) {
	let result = []

	for (let i = 0, l = ids.length; i < l; i++) {
		let id = ids[i]
		if (id < 0) continue

		let x = points[id * 2]
		let y = points[id * 2 + 1]

		//TODO: replace with proper module
		if (pointInRect(x, y, rect)) {
			result.push(id)
			ids[i] = -1
		}
	}

	if (!result.length) return null;

	return result
}

function pointInRect (x, y, rect) {
	return (x >= rect[0] && y >= rect[1] && x <= rect[2] && y <= rect[3])
}





//render lines
// ctx.beginPath()
// ctx.moveTo(0, h/2)
// ctx.lineTo(w, h/2)
// ctx.strokeStyle = 'black'
// ctx.lineWidth = 1
// ctx.stroke()
