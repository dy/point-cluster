/**
 * @module  point-cluster
 */

'use strict';


const types = require('./types')


module.exports = pointCluster


//create index for the set of points based on divider method
function pointCluster(points, redistribute) {
	if (!redistribute) throw Error('Second argument should be a function or a string')
	if (typeof redistribute === 'string') {
		redistribute = types[redistribute]

		if (!redistribute) throw Error('Unknown type of cluster: `' + redistribute + '`')
	}

	points = unroll(points)

	//create ids
	let count = points.length >>> 1
	let ids = new Int32Array(count)
	for (let i = 0; i < count; i++) {
		ids[i] = i
	}


	//create tree
	let root = {
		id: 0,
		parent: null,
		start: 0,
		end: count,
		children: []
	}

	let c = 0
	let stack = [root]

	while (stack.length) {
		let node = stack.shift()

		divide(node)

		for (let i = 0; i < node.children.length; i++) {
			stack.push(node.children[i])
		}
	}

	//process node
	function divide(node) {
		// c++
		// if (c > 150) throw Error('Recursion')
		let sections = redistribute(ids.subarray(node.start, node.end), points, node)

		if (Array.isArray(sections)) {
			for (let i = 0, offset = node.start; i < sections.length; i++) {
				let subids = sections[i]

				if (!subids || !subids.length) continue;

				let end = offset + subids.length;

				//put new ids by the offset
				ids.set(subids, offset)

				//create subgroup descriptor node
				let subnode = {
					id: i,
					parent: node,
					start: offset,
					end: end,
					children: []
				}

				offset = end

				node.children.push(subnode)
			}
		}
	}

	return root
}


//return flat point set, make sure points are copied
function unroll(points) {
	let unrolled
	if (points[0].length) {
		unrolled = new Float64Array(points.length)
		for (let i = 0, l = points.length; i < l; i++) {
			unrolled[i*2] = points[i][0]
			unrolled[i*2+1] = points[i][1]
		}
	}
	else {
		unrolled = new Float64Array(points.length)
		unrolled.set(points)
	}
	return unrolled
}
