'use strict'

const cluster = require('./')
const random = require('gauss-random')
const getBounds = require('array-bounds')
const fit = require('canvas-fit')


//render points
let N = 1e3
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
let index = cluster(pts, quadsection)

function quadsection (ids, points, node) {
	if (ids.length <= 1) return

	let box

	//parent box are data box
	if (!node.parent) {
		box = getBounds(points, 2)
	}
	//child box are parent box
	else {
		box = node.parent.childBox[node.id]
	}

	// debugger;

	drawPoints({ids: ids})

	//render rect
	let boxdim = [box[2] - box[0], box[3] - box[1]]
	let range = [bounds[2] - bounds[0], bounds[3] - bounds[1]]
	ctx.strokeStyle = 'rgba(127, 0, 0, .5)'
	ctx.fillStyle = 'rgba(127, 0, 0, .15)'
	ctx.fillRect(
		w * ((box[0] - bounds[0]) / range[0]) || 0,
		h - (h * ((box[1] - bounds[1]) / range[1]) || 0) - h * boxdim[1] / range[1],
		w * boxdim[0] / range[0],
		h * boxdim[1] / range[1]
	)
	ctx.fillStyle = 'rgba(0,0,127,.9)'
	ctx.textBaseline = 'bottom'
	ctx.fillText(
		ids.length,//.toFixed(2),
		w * ((box[0] - bounds[0]) / range[0] || 0),
		h - h * ((box[1] - bounds[1]) / range[1] || 0)
	)

	let mid = [(box[2] + box[0]) * .5, (box[3] + box[1]) * .5]

	node.childBox = [
		[box[0], box[1], mid[0], mid[1]],
		[mid[0], box[1], box[2], mid[1]],
		[box[0], mid[1], mid[0], box[3]],
		[mid[0], mid[1], box[2], box[3]]
	]

	//collect tl/tr/bl/br parts
	return [
		collectPointsInRect(ids, points, node.childBox[0]),
		collectPointsInRect(ids, points, node.childBox[1]),
		collectPointsInRect(ids, points, node.childBox[2]),
		collectPointsInRect(ids, points, node.childBox[3])
	]
}

function collectPointsInRect (ids, points, rect) {
	let result = []

	for (let i = 0, l = ids.length; i < l; i++) {
		let id = ids[i]
		let x = points[id * 2]
		let y = points[id * 2 + 1]

		//TODO: replace with proper module
		if (pointInRect(x, y, rect)) {
			result.push(id)
		}
	}

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
