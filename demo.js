'use strict'

const createCluster = require('./')
const getContext = require('get-canvas-context')
const panZoom = require('pan-zoom')
const createLoop = require('canvas-loop')


//data points
let N = 1e3
let points = Array(N*2).fill(null).map(_ => [Math.random(), Math.random()])


//create cluster
let cluster = createCluster(points)


//rendering loop
let ctx = getContext('2d')
let canvas = ctx.canvas
document.body.appendChild(canvas)

let app = createLoop(canvas)

app.start()

app.on('tick', dt => {
})

app.on('resize', _ => {
	render()
})
render()


function render () {
	let w = canvas.width
	let h = canvas.height

	ctx.fillStyle = 'rgba(0,100,200,.75)';
	let diameter = 10

	for (let i = 0; i < N; i++) {
		let x = points[i][0]
		let y = points[i][1]

		ctx.beginPath()
		ctx.arc(x * w, y * h, diameter/2, 0, 2 * Math.PI)
		ctx.closePath()

		ctx.fill();
	}

}
