/**
 * @module  point-cluster/quad-bucket
 *
 * Bucket based clustering
 */

'use strict'

module.exports = function cluster (points, ids, options) {
	// point indexes for levels [0: [a,b,c,d], 1: [a,b,c,d,e,f,...], ...]
	let levels = []
	let groups = []
	let offsets = []

	console.time('cluster')
	sort(0, 0, 1, ids, 0, 1)
	console.timeEnd('cluster')
	console.log(levels, offsets)

	function sort (x, y, diam, ids, level, group) {
		if (!ids.length) return null

		// save first point as level representative
		let item = ids[0]
		let levelItems = levels[level] || (levels[level] = [])
		levelItems.push(item)
		let groupItems = groups[level] || (groups[level] = [])
		groupItems.push(group)

		let offsetItems = offsets[level] || (offsets[level] = [])
		let offset = levelItems.length - 1
		if (ids.length <= 1) {
			offsetItems.push(null, null, null, null)
			return offset
		}


		// distribute points by 4 buckets
		let lolo = [], lohi = [], hilo = [], hihi = []

		let d2 = diam * .5
		let cx = x + d2, cy = y + d2

		for (let i = 1; i < ids.length; i++) {
			let idx = ids[i],
				x = points[idx * 2],
				y = points[idx * 2 + 1]
			x < cx ? (y < cy ? lolo.push(idx) : lohi.push(idx)) : (y < cy ? hilo.push(idx) : hihi.push(idx))
		}

		level++
		offsetItems.push(sort(x, y, d2, lolo, level, (group << 2) + 0))
		offsetItems.push(sort(x, cy, d2, lohi, level, (group << 2) + 1))
		offsetItems.push(sort(cx, y, d2, hilo, level, (group << 2) + 2))
		offsetItems.push(sort(cx, cy, d2, hihi, level, (group << 2) + 3))

		return offset
	}


	// get points from the range
	// follow groups ids
	function range (lox, loy, hix, hiy) {
		let group = 1
		let level = 0
		let levelItems = levels[level]
		let groupItems = groups[level]

		// get group subsection ids
		let lt = group << 2,
			lb = lt + 1,
			rt = lt + 2,
			rb = lt + 3

		// find real boundaries of subgroups
		// FIXME: add lo/hi  params
		search.le(groupItems, lt)
		search.le(groupItems, rb)

		function traverse () {

		}
	}
}
