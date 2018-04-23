/**
 * Undo.js
 * by Mark Vasilkov, http://mvasilkov.name/
 * License: MIT
 */

define(["diff-match-patch"], function (lib) {
    "use strict"

    var utils = new lib.diff_match_patch

    function exchange(obj, a, b) {
        var aa = obj[a]
        obj[a] = obj[b]
        obj[b] = aa
    }

    function makePatch(a, b) {
        var diff = utils.diff_main(b, a)

        if (diff.length > 2) {
            utils.diff_cleanupEfficiency(diff)
        }

        return utils.patch_make(b, diff)
    }

    function applyPatch(a, patch, reverse) {
        if (reverse) {
            patch.forEach(function (p) {
                p.diffs.forEach(function (d) {
                    if (d[0]) d[0] = -d[0]
                })

                exchange(p, "start1", "start2")
                exchange(p, "length1", "length2")
            })
        }

        return utils.patch_apply(patch, a)[0]
    }

    function Undo() {
        this.stack = Array()
        this.p = 0
        this.level = 0
    }

    Undo.prototype.rec = function (obj, fun) {
        if (this.level++) {
            fun(obj)
            --this.level
            return
        }

        var a = JSON.stringify(obj),
            b = JSON.stringify(fun(obj) || obj),
            patch = makePatch(a, b)

        --this.level

        if (!patch.length) return

        if (this.stack.length > this.p) {
            this.stack.length = this.p
        }

        console.assert(this.p === this.stack.length)

        this.stack.push(JSON.stringify(patch))
        ++this.p
    }

    Undo.prototype.canUndo = function () {
        return !!this.p
    }

    Undo.prototype.canRedo = function () {
        return this.stack.length > this.p
    }

    Undo.prototype.undo = function (obj) {
        if (!this.p) return obj

        var patch = this.stack[--this.p],
            a = JSON.stringify(obj),
            b = applyPatch(a, JSON.parse(patch))

        return JSON.parse(b)
    }

    Undo.prototype.redo = function (obj) {
        if (this.stack.length <= this.p) return obj

        var patch = this.stack[this.p++],
            a = JSON.stringify(obj),
            b = applyPatch(a, JSON.parse(patch), true)

        return JSON.parse(b)
    }

    Undo.prototype.reset = function () {
        Undo.call(this)
    }

    return Undo
})
