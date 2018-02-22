/**
 * kd-tree based clustering
 *
 * Based on kdbush package
 */

'use strict'


module.exports = function clusterKD (points, ids, levels, weights, options) {
    let ptr = 0
    let n = ids.length
    let nodeSize = 2

    sort(0, 0, 1, 0, n, 0)

    function sort(left, right, depth) {
        if (right - left <= nodeSize) return;

        var m = Math.floor((left + right) / 2);

        select(ids, points, m, left, right, depth % 2);

        sort(left, m - 1, depth + 1);
        sort(m + 1, right, depth + 1);
    }

    function select(k, left, right, inc) {
        while (right > left) {
            if (right - left > 600) {
                var n = right - left + 1;
                var m = k - left + 1;
                var z = Math.log(n);
                var s = 0.5 * Math.exp(2 * z / 3);
                var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
                var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
                var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
                select(ids, points, k, newLeft, newRight, inc);
            }

            var t = points[2 * k + inc];
            var i = left;
            var j = right;

            swapItem(ids, points, left, k);
            if (points[2 * right + inc] > t) swapItem(ids, points, left, right);

            while (i < j) {
                swapItem(ids, points, i, j);
                i++;
                j--;
                while (points[2 * i + inc] < t) i++;
                while (points[2 * j + inc] > t) j--;
            }

            if (points[2 * left + inc] === t) swapItem(ids, points, left, j);
            else {
                j++;
                swapItem(ids, points, j, right);
            }

            if (j <= k) left = j + 1;
            if (k <= j) right = j - 1;
        }
    }

    function swapItem(ids, points, i, j) {
        swap(ids, i, j);
        swap(points, 2 * i, 2 * j);
        swap(points, 2 * i + 1, 2 * j + 1);
    }

    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}


