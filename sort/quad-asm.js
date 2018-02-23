/**
 * Asm.js version of quad-tree
 * Based on snap-points-2d
 */

'use strict'

module.exports = clusterQuad

function clusterQuad (points, ids, levels, weights, options) {
	let ptr = 0
	let n = ids.length

	// put data to heap
	_cluster()

	// read data from heap
}

let N = 1e6
let pointsOffset = 0
let idsOffset = N * 2 * Float64Array.BYTES_PER_ELEMENT
let levelsOffset = idsOffset + N * Uint32Array.BYTES_PER_ELEMENT
let weightsOffset = levelsOffset + N * Uint8Array.BYTES_PER_ELEMENT
let size = weightsOffset + N * Uint32Array.BYTES_PER_ELEMENT
let heap = new ArrayBuffer(size)

let _cluster = createCluster({Math, Float64Array, Uint32Array, Uint8Array}, null, heap)

function createCluster(stdlib, foreign, heap) {
	'use asm'

	let points = new stdlib.Float64Array(heap)
	let ids = new stdlib.Uint32Array(heap)
	let levels = new stdlib.Uint8Array(heap)
	let weights = new stdlib.Uint32Array(heap)

	function sort (left, right, level, x, y, diam) {
		let diam_2 = diam * 0.5

		let offset = left + 1

		weights[ptr] = right - left
		levels[ptr++] = level

		for(let i=0; i < 2; ++i) {
			for(let j=0; j < 2; ++j) {
				let lox = x + i * diam_2
				let loy = y + j * diam_2
				let hix = lox + diam_2
				let hiy = loy + diam_2

				let mid = select(offset, right, lox, loy, hix, hiy)

				if(mid === offset) continue

				sort(offset, mid, level + 1, lox, loy, diam_2)

				offset = mid
			}
		}
	}

	function select (left, right, lox, loy, hix, hiy) {
		let mid = left

		for(let i = left; i < right; ++i) {
			let x  = points[2*i]
			let y  = points[2*i+1]
			let s  = ids[i]

			if(lox <= x && x <= hix &&
			loy <= y && y <= hiy) {
				if(i === mid) {
					mid += 1
				} else {
					points[2*i]     = points[2*mid]
					points[2*i+1]   = points[2*mid+1]
					ids[i]          = ids[mid]
					points[2*mid]   = x
					points[2*mid+1] = y
					ids[mid]        = s
					mid += 1
				}
			}
		}

		return mid
	}
}
