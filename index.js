/**
 * @module  point-cluster
 */

'use strict';


const types = require('./types')


module.exports = pointCluster


//create index for the set of points based on divider method
function pointCluster(points, options) {
	// if (!redistribute) throw Error('Second argument should be a function or a string')
	// if (typeof redistribute === 'string') {
	// 	redistribute = types[redistribute]

	// 	if (!redistribute) throw Error('Unknown type of cluster: `' + redistribute + '`')
	// }
	let redistribute = options.divide
	let nodeSize = options.nodeSize || 128

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
		depth: 0,
		parent: null,
		start: 0,
		end: count,
		children: null,
		last: true
	}

	let stack = [root]

	while (stack.length) {
		let node = stack.shift()

		let sections = redistribute(ids.subarray(node.start, node.end), points, node)

		if (!sections.length) continue

		let children = []

		for (let i = 0, offset = node.start; i < sections.length; i++) {
			let subids = sections[i]

			if (!subids || !subids.length) {
				continue;
			}

			//unchanged subids means repeated point coords, so ignore leaf
			if (subids.length === ids.length) {
				continue;
			}

			//write subids to ids
			ids.set(subids, offset)

			let end = offset + subids.length;

			children.push({
				id: i,
				depth: node.depth + 1,
				parent: node,
				start: offset,
				end: end,
				children: null,
				last: false
			})

			offset = end
		}

		if (!children.length) continue

		node.children = children
		node.children[node.children.length - 1].last = true

		for (let i = 0; i < node.children.length; i++) {
			let child = node.children[i]

			//divide big enough nodes
			if ((child.end - child.start) > nodeSize) {
				stack.push(child)
			}
		}
	}

	return {
		tree: root,
		id: ids,
		levels: buildLevels
	}

	//TODO: build levels in proper fashion

	//create list with ids ordered by scale levels
	function buildLevels() {
		let lod = new Uint32Array(count)
		let offset = 0
		let stack = [root]

		lod[offset++] = ids[root.end - 1]

		while (stack.length) {
			let node = stack.shift()

			if (!node.children) continue

			//skip used points from the tail, that is number of last parent nodes
			//TODO: There is probably easier z-curve method
			let skip = 1, n = node
			for (let d = node.depth; d--;) {
				if (n.last) skip++
				n = n.parent
			}

			//put kiddos' last points
			for (let i = 0; i < node.children.length; i++) {
				let child = node.children[i]
				if (child.last) skip -= 1

				if (child.children) {
					lod[offset++] = ids[child.end - skip - 1]
				}
				else {
					let subids = ids.subarray(child.start, child.end - skip)
					lod.set(subids, offset)
					offset += subids.length
				}
			}

			//put next layer of children
			for (let i = 0; i < node.children.length; i++) {
				let child = node.children[i]
				if (child.children) stack.push(node.children[i])
			}
		}

		return lod
	}
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
