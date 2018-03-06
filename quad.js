/**
 * @module  point-cluster/quad-bucket
 *
 * Bucket based clustering
 */

'use strict'

const PointCluster = require('./cluster')

module.exports = QuadCluster

function QuadCluster(points, options) {
	if (!(this instanceof QuadCluster)) return new QuadCluster(points, options)

	PointCluster.call(this, points, options)

	// point indexes for levels [0: [a,b,c,d], 1: [a,b,c,d,e,f,...], ...]
	let levels = []

	// offsets are starting indexes of subranges in sub levels
	let offsets = []

	// keep track of cx/cy
	let params = []

	// console.time('cluster')
	sort(0, 0, 1, this.ids, 0, 1)
	// console.timeEnd('cluster')
	// console.log(levels, offsets)


	function sort (x, y, diam, ids, level) {
		if (!ids.length) return null

		let d2 = diam * .5
		let cx = x + d2, cy = y + d2

		// save first point as level representative
		let item = ids[0]
		let levelItems = levels[level] || (levels[level] = [])
		levelItems.push(item)

		let paramItems = params[level] || (params[level] = [])
		paramItems.push(cx, cy)

		let offsetItems = offsets[level] || (offsets[level] = [])
		let offset = levelItems.length - 1
		if (ids.length <= 1) {
			offsetItems.push(null, null, null, null)
			return offset
		}

		// distribute points by 4 buckets
		let lolo = [], lohi = [], hilo = [], hihi = []

		for (let i = 1; i < ids.length; i++) {
			let idx = ids[i],
				x = points[idx * 2],
				y = points[idx * 2 + 1]
			x < cx ? (y < cy ? lolo.push(idx) : lohi.push(idx)) : (y < cy ? hilo.push(idx) : hihi.push(idx))
		}

		level++
		offsetItems.push(
			sort(x, y, d2, lolo, level),
			sort(x, cy, d2, lohi, level),
			sort(cx, y, d2, hilo, level),
			sort(cx, cy, d2, hihi, level)
		)

		return offset
	}
}

QuadCluster.prototype = Object.create(PointCluster.prototype)

QuadCluster.prototype.closest = function (x, y, level=0) {

}

QuadCluster.prototype.range = function (l, t, r, b, level=0) {

}

QuadCluster.prototype.radius = function (x, y, r, level=0) {

}

QuadCluster.prototype.offsets = function (l, t, r, b, level=0) {
	let [lox, loy, hix, hiy] = range

	let diam = Math.max(bounds[2] - bounds[0], bounds[3] - bounds[1])

	for (let level = levels.length; level--;) {
		let levelItems = levels[level]

		let levelPixelSize = diam * Math.pow(0.5, level)

		// FIXME: use minSize-adaptive coeff here, if makes sense, mb we need dist tho
		if (levelPixelSize && levelPixelSize < currPixelSize && level > 1) {
			continue
		}

		let startOffset = search.ge(levelItems, range, (id, range) => {
			let x = positions[id * 2]
			let y = positions[id * 2 + 1]
			let dx = x - range[0]
			let dy = y - range[1]
			return Math.max(dx, dy)
		})
		let endOffset = search.lt(x, range[2], startOffset, levelItems.length - 1) + 1

		if (endOffset <= startOffset) continue
	}
}

