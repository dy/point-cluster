/**
 * quad-tree based clustering
 * Based on snap-points-2d
 */

'use strict'

module.exports = function clusterQuad (points, ids, levels, weights, options) {
	let ptr = 0
	let n = ids.length

	sort(0, 0, 1, 0, n, 0)

	function sort (x, y, diam, start, end, level) {
		let diam_2 = diam * 0.5

		// take first point from the section
		let offset = start + 1

		weights[ptr] = end - start
		levels[ptr++] = level

		for(let i=0; i < 2; ++i) {
			for(let j=0; j < 2; ++j) {
				let lox = x+i*diam_2
				let loy = y+j*diam_2
				let hix = lox + diam_2
				let hiy = loy + diam_2

				// sort points in order of belonging to sections (partition)
				let mid = select(offset, end, lox, loy, hix, hiy)

				// last level found
				if(mid === offset) continue

				// sort section internals
				sort(lox, loy, diam_2, offset, mid, level + 1)

				offset = mid
			}
		}
	}

	function select (start, end, lox, loy, hix, hiy) {
		let mid = start

		for(let i = start; i < end; ++i) {
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
