/**
 * @module  point-cluster/quad
 *
 * Bucket based quad tree clustering
 */

'use strict'

const search = require('binary-search-bounds')
const clamp = require('clamp')
const rect = require('parse-rect')
const getBounds = require('array-bounds')
const pick = require('pick-by-alias')
const defined = require('defined')
const flatten = require('flatten-vertex-data')
const isObj = require('is-obj')

module.exports = function cluster (srcPoints, options) {
	if (!options) options = {}

	srcPoints = flatten(srcPoints, 'float64')

	options = pick(options, {
		bounds: 'range bounds dataBox databox',
		maxDepth: 'depth maxDepth maxdepth level maxLevel maxlevel levels',
		// sort: 'sortBy sortby sort',
		// pick: 'pick levelPoint',
		// nodeSize: 'node nodeSize minNodeSize minSize size'
	})

	// let nodeSize = defined(options.nodeSize, 1)
	let maxDepth = defined(options.maxDepth, 255)
	let bounds = defined(options.bounds, getBounds(srcPoints, 2))
	if (bounds[0] === bounds[2]) bounds[2]++
	if (bounds[1] === bounds[3]) bounds[3]++

	let points = normalize(srcPoints, bounds)

	// init variables
	let n = srcPoints.length >>> 1
	let ids = new Uint32Array(n)
	for (let i = 0; i < n; ++i) {
		ids[i] = i
	}

	// point indexes for levels [0: [a,b,c,d], 1: [a,b,c,d,e,f,...], ...]
	let levels = []

	// starting indexes of subranges in sub levels, levels.length * 4
	let sublevels = []

	// unique group ids, sorted in z-curve fashion within levels
	let groups = []


	// sort points
	sort(0, 0, 1, ids, 0, 1)

	// FIXME: it is possible to create one typed array heap and reuse that to avoid memory blow
	function sort (x, y, diam, ids, level, group) {
		if (!ids.length) return null

		// save first point as level representative
		let levelItems = levels[level] || (levels[level] = [])
		let levelGroups = groups[level] || (groups[level] = [])
		let sublevel = sublevels[level] || (sublevels[level] = [])
		let offset = levelItems.length - 1

		level++

		// max depth reached - put all items into a first group
		if (level > maxDepth) {
			for (let i = 0; i < ids.length; i++) {
				levelItems.push(ids[i])
				levelGroups.push(group)
				sublevel.push(null, null, null, null)
			}

			return offset
		}

		levelItems.push(ids[0])
		levelGroups.push(group)

		if (ids.length <= 1) {
			sublevel.push(null, null, null, null)
			return offset
		}


		let d2 = diam * .5
		let cx = x + d2, cy = y + d2

		// distribute points by 4 buckets
		let lolo = [], lohi = [], hilo = [], hihi = []

		for (let i = 1, l = ids.length; i < l; i++) {
			let idx = ids[i],
				x = points[idx * 2],
				y = points[idx * 2 + 1]
			x < cx ? (y < cy ? lolo.push(idx) : lohi.push(idx)) : (y < cy ? hilo.push(idx) : hihi.push(idx))
		}

		group <<= 2
		sublevel.push(
			sort(x, y, d2, lolo, level, group),
			sort(x, cy, d2, lohi, level, group + 1),
			sort(cx, y, d2, hilo, level, group + 2),
			sort(cx, cy, d2, hihi, level, group + 3)
		)

		return offset
	}

	// get all points within the passed range
	function range ( ...args ) {
		let options

		if (isObj(args[args.length - 1])) {
			let arg = args.pop()

			// detect if that was a rect object
			if (!args.length && (arg.x != null || arg.l != null || arg.left != null)) {
				args = [arg]
				options = {}
			}

			options = pick(arg, {
				level: 'level maxLevel',
				d: 'd diam diameter r radius px pxSize pixel pixelSize maxD size minSize',
				lod: 'lod details ranges offsets'
			})
		}
		else {
			options = {}
		}

		if (!args.length) args = bounds

		let box = rect( ...args )

		let [minX, minY, maxX, maxY] = normalize( [ box.x, box.y, box.x + box.width, box.y + box.height ], bounds )

		let maxLevel = defined(options.level, levels.length)

		// limit maxLevel by px size
		if (options.d != null) {
			let d
			if (typeof options.d === 'number') d = [options.d, options.d]
			else if (options.d.length) d = options.d

			maxLevel = Math.min(
				Math.ceil(-Math.log2(d[0] / (bounds[2] - bounds[0]))),
				Math.ceil(-Math.log2(d[1] / (bounds[3] - bounds[1]))),
				maxLevel
			)
		}

		// return levels of details
		if (options.lod) return lod(minX, minY, maxX, maxY, maxLevel)

		let selection = []

		select( 0, 0, 1, 0, 0 )

		function select ( lox, loy, d, level, offset ) {
			let hix = lox + d
			let hiy = loy + d

			// if box does not intersect level - ignore
			if ( minX > hix || minY > hiy || maxX < lox || maxY < loy ) return
			if ( level >= maxLevel ) return

			// if point falls into box range - take it
			let id = ids[levels[level][0]]
			let px = points[ id * 2 ]
			let py = points[ id * 2 + 1 ]

			if ( px > minX && px < maxX && py > minY && py < maxY ) selection.push(id)

			// for every subsection do select
			let offsets = sublevels[level]
			let off0 = offsets[ offset * 4 + 0 ]
			let off1 = offsets[ offset * 4 + 1 ]
			let off2 = offsets[ offset * 4 + 2 ]
			let off3 = offsets[ offset * 4 + 3 ]

			let d2 = d * .5
			let nextLevel = level + 1
			if ( off0 != null ) select( lox, loy, d2, nextLevel, off0)
			if ( off1 != null ) select( lox, loy + d2, d2, nextLevel, off1)
			if ( off2 != null ) select( lox + d2, loy, d2, nextLevel, off2)
			if ( off3 != null ) select( lox + d2, loy + d2, d2, nextLevel, off3)
		}

		return selection
	}

	// get range offsets within levels to render lods appropriate for zoom level
	// TODO: it is possible to store minSize of a point to optimize neede level calc
	function lod (lox, loy, hix, hiy, maxLevel) {
		let offsets = []

		for (let level = 0; level < maxLevel; level++) {
			let levelGroups = groups[level]
			let [from, to] = levels[level]

			let levelGroupStart = group(lox, loy, level)
			let levelGroupEnd = group(hix, hiy, level)

			// FIXME: utilize sublevels to speed up search range here
			let startOffset = search.ge(levelGroups, levelGroupStart)
			let endOffset = search.gt(levelGroups, levelGroupEnd, startOffset, levelGroups.length - 1)

			offsets[level] = [startOffset + from, endOffset + from]
		}

		return offsets
	}

	// get group id closest to the x,y coordinate, corresponding to a level
	function group (x, y, level) {
		let group = 1

		let cx = .5, cy = .5
		let diam = .5

		for (let i = 0; i < level; i++) {
			group <<= 2

			group += x < cx ? (y < cy ? 0 : 1) : (y < cy ? 2 : 3)

			diam *= .5

			cx += x < cx ? -diam : diam
			cy += y < cy ? -diam : diam
		}

		return group
	}


	// return reordered ids with provided methods
	// save level offsets in output buffer
	let offset = 0
	for (let level = 0; level < levels.length; level++) {
		ids.set(levels[level], offset)
		let nextOffset = offset + levels[level].length
		levels[level] = [offset, nextOffset]
		offset = nextOffset
	}

	ids.levels = levels
	ids.range = range

	return ids
}


// normalize points by bounds
function normalize (pts, bounds) {
	let [lox, loy, hix, hiy] = bounds
	let scaleX = 1.0 / (hix - lox)
	let scaleY = 1.0 / (hiy - loy)
	let result = new Array(pts.length)

	for (let i = 0, n = pts.length / 2; i < n; i++) {
		result[2*i] = clamp((pts[2*i] - lox) * scaleX, 0, 1)
		result[2*i+1] = clamp((pts[2*i+1] - loy) * scaleY, 0, 1)
	}

	return result
}
