'use strict'

const createCluster = require('./')
const getContext = require('get-canvas-context')
const panZoom = require('pan-zoom')
const createLoop = require('canvas-loop')
const createFps = require('fps-indicator')


//data points
let N = 1e3
let points = Array(N*2).fill(null).map(_ => [Math.random(), Math.random()])


//create cluster
let cluster = createCluster(points)

console.log(cluster)

//rendering loop
let scale = 1, offset = [0, 0]

let ctx = getContext('2d')
let canvas = ctx.canvas
document.body.appendChild(canvas)

let app = createLoop(canvas)

app.start()

app.on('tick', dt => {
	render()
})

app.on('resize', _ => {
})


let fps = createFps()
fps.element.style.fontFamily = `sans-serif`
fps.element.style.top = `1rem`
fps.element.style.right = `1rem`

//interactions
panZoom(canvas, e => {
	let w = canvas.width
	let h = canvas.height

	offset[0] += e.dx
	offset[1] += e.dy

	let rx = e.x / w
	let ry = e.y / w

	let prevScale = scale
	scale -= scale * e.dz / 1e3

	offset[0] -= rx * w * (scale - prevScale)
	offset[1] -= ry * w * (scale - prevScale)
})


function render () {
	let w = canvas.width
	let h = canvas.height

	ctx.clearRect(0,0,w,h)

	ctx.fillStyle = 'rgba(0,100,200,.75)';
	let diameter = 10

	for (let i = 0; i < N; i++) {
		let x = points[i][0]
		let y = points[i][1]

		ctx.beginPath()
		ctx.arc(x * w * scale + offset[0], y * h * scale + offset[1], diameter/2, 0, 2 * Math.PI)
		ctx.closePath()

		ctx.fill();
	}

}


