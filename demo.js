'use strict'

const cluster = require('./')
const random = require('gauss-random')
const getBounds = require('array-bounds')
const fit = require('canvas-fit')
const snap = require('snap-points-2d')

//render points
let N = 1e6
let pts = Array(N*2)

for (let i = 0; i < N; i++) {
	pts[i*2] = random()
	pts[i*2+1] = random()
}

const drawPoints = require('../regl-scatter2d')({color: 'rgba(0,0,255,.15)', size: 5, points: pts, snap: false})


//create canvas for rects
let canvas = document.body.appendChild(document.createElement('canvas'))
let ctx = canvas.getContext('2d')

fit(canvas)

let w = canvas.width;
let h = canvas.height;

let bounds = getBounds(pts, 2)



let c = 0
//cluster points
console.time(1)
let index = cluster(pts, {
	divide: quadsection,
	nodeSize: 8
})
console.timeEnd(1)

let lod = index.levels
drawPoints({elements: lod.slice(0,1e4), color: 'rgba(0,0,0,.5)'})

console.time(2)
snap(pts)
console.timeEnd(2)


function kdsection (ids, points, node) {

}

function quadsection (ids, points, node) {
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
	// let range = [bounds[2] - bounds[0], bounds[3] - bounds[1]]
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
