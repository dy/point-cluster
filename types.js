'use strict'

const getBounds = require('array-bounds')

/*
module.exports = {
	kd: kdsection,

	quad: quadsection,

	ann: annsection,
}


function kdsection (ids, points) {

}

//
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


function annsection (ids, points) {

}


*/
