var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var collections;
    (function (collections) {
        var LinkElement = (function () {
            function LinkElement() {
                this.previous = null;
                this.next = null;
                this.value = null;
            }
            return LinkElement;
        }());
        ;
        var LinkedListIterator = (function () {
            function LinkedListIterator(list, start, change) {
                this.list = list;
                this.change = change;
                this.currentElement = start;
                this.startElement = start;
            }
            LinkedListIterator.prototype.hasNext = function () {
                return this.currentElement.next !== null &&
                    this.currentElement.next.value !== null;
            };
            LinkedListIterator.prototype.next = function () {
                if (this.currentElement.next.value === null) {
                    return null;
                }
                this.currentElement = this.currentElement.next;
                return this.currentElement.value;
            };
            LinkedListIterator.prototype.hasPrevious = function () {
                return this.currentElement.previous !== null &&
                    this.currentElement.value !== null;
            };
            LinkedListIterator.prototype.previous = function () {
                if (this.currentElement.value === null) {
                    return null;
                }
                this.currentElement = this.currentElement.previous;
                return this.currentElement.next.value;
            };
            LinkedListIterator.prototype.remove = function () {
                if (this.currentElement.next.value === null) {
                    return null;
                }
                var ret = this.currentElement.next.value;
                this.currentElement.next = this.currentElement.next.next;
                this.currentElement.next.previous = this.currentElement;
                this.change(-1);
                return ret;
            };
            LinkedListIterator.prototype.insert = function (e) {
                var holder = new LinkElement();
                holder.value = e;
                holder.previous = this.currentElement;
                holder.next = this.currentElement.next;
                holder.previous.next = holder;
                holder.next.previous = holder;
                this.change(1);
            };
            LinkedListIterator.prototype.swap = function (e) {
                var ret = this.currentElement.next.value;
                this.currentElement.next.value = e;
                return ret;
            };
            LinkedListIterator.prototype.reset = function () {
                this.currentElement = this.startElement;
            };
            LinkedListIterator.prototype.clone = function () {
                return new LinkedListIterator(this.list, this.currentElement, this.change);
            };
            return LinkedListIterator;
        }());
        var DescendingLinkedListIterator = (function (_super) {
            __extends(DescendingLinkedListIterator, _super);
            function DescendingLinkedListIterator(list, start, change) {
                _super.call(this, list, start, change);
            }
            DescendingLinkedListIterator.prototype.hasNext = function () {
                return _super.prototype.hasPrevious.call(this);
            };
            DescendingLinkedListIterator.prototype.next = function () {
                return _super.prototype.previous.call(this);
            };
            DescendingLinkedListIterator.prototype.hasPrevious = function () {
                return _super.prototype.hasNext.call(this);
            };
            DescendingLinkedListIterator.prototype.previous = function () {
                return _super.prototype.next.call(this);
            };
            DescendingLinkedListIterator.prototype.remove = function () {
                _super.prototype.previous.call(this);
                return _super.prototype.remove.call(this);
            };
            DescendingLinkedListIterator.prototype.insert = function (e) {
                _super.prototype.previous.call(this);
                _super.prototype.insert.call(this, e);
            };
            DescendingLinkedListIterator.prototype.swap = function (e) {
                _super.prototype.previous.call(this);
                return _super.prototype.swap.call(this, e);
            };
            DescendingLinkedListIterator.prototype.clone = function () {
                return new DescendingLinkedListIterator(this.list, this.currentElement, this.change);
            };
            return DescendingLinkedListIterator;
        }(LinkedListIterator));
        var LinkedList = (function () {
            function LinkedList() {
                this._length = 0;
                var elm1 = new LinkElement();
                var elm2 = new LinkElement();
                elm1.next = elm2;
                elm2.previous = elm1;
                this.first = elm1;
                this.last = elm2;
            }
            LinkedList.prototype.createLengthChanger = function () {
                var _this = this;
                return function (delta) {
                    _this._length += delta;
                };
            };
            LinkedList.prototype.add = function (e) {
                var holder = new LinkElement();
                holder.value = e;
                holder.next = this.last;
                holder.previous = this.last.previous;
                this.last.previous.next = holder;
                this.last.previous = holder;
                this._length++;
            };
            LinkedList.prototype.get = function (e) {
                var elm = this.first.next;
                var i = 0;
                while (i < e) {
                    elm = elm.next;
                    i++;
                }
                return elm.value;
            };
            LinkedList.prototype.remove = function (e) {
                if (typeof e === "number") {
                    var elm = this.first;
                    var i = 0;
                    while (i < e) {
                        elm = elm.next;
                        i++;
                    }
                    elm.previous.next = elm.next;
                    elm.next.previous = elm.previous;
                    this._length--;
                    return elm.value;
                }
                else {
                    var elm = this.first;
                    while (elm.next.value !== null &&
                        elm.value !== e) {
                        elm = elm.next;
                    }
                    elm.previous.next = elm.next;
                    elm.next.previous = elm.previous;
                    this._length--;
                    return elm.value;
                }
            };
            LinkedList.prototype.length = function () {
                return this._length;
            };
            LinkedList.prototype.iterator = function () {
                return new LinkedListIterator(this, this.first, this.createLengthChanger());
            };
            LinkedList.prototype.descendingIterator = function () {
                return new DescendingLinkedListIterator(this, this.last.previous, this.createLengthChanger());
            };
            return LinkedList;
        }());
        collections.LinkedList = LinkedList;
        var FilterIterator = (function () {
            function FilterIterator(iter, filter) {
                this.iter = iter;
                this.filter = filter;
            }
            FilterIterator.prototype.hasNext = function () {
                //this is a problem...
                return true;
            };
            FilterIterator.prototype.next = function () {
                while (this.iter.hasNext()) {
                    var elm = this.iter.next();
                    if (this.filter(elm)) {
                        return elm;
                    }
                }
                return null;
            };
            FilterIterator.prototype.hasPrevious = function () {
                //this is also a problem...
                return true;
            };
            FilterIterator.prototype.previous = function () {
                while (this.iter.hasPrevious()) {
                    var elm = this.iter.previous();
                    if (this.filter(elm)) {
                        return elm;
                    }
                }
                return null;
            };
            FilterIterator.prototype.remove = function () {
                while (this.iter.hasNext()) {
                    var elm = this.iter.next();
                    if (this.filter(elm)) {
                        this.iter.previous();
                        this.iter.remove();
                        break;
                    }
                }
            };
            FilterIterator.prototype.insert = function (e) {
                this.iter.insert(e);
            };
            FilterIterator.prototype.swap = function (e) {
                return this.iter.swap(e);
            };
            FilterIterator.prototype.reset = function () {
                this.iter.reset();
            };
            FilterIterator.prototype.clone = function () {
                return new FilterIterator(this.iter.clone(), this.filter);
            };
            return FilterIterator;
        }());
        collections.FilterIterator = FilterIterator;
        var MergeIterator = (function () {
            function MergeIterator(iter1, iter2) {
                this.iter1 = iter1;
                this.iter2 = iter2;
                iter1.reset();
                iter2.reset();
            }
            MergeIterator.prototype.hasNext = function () {
                return this.iter1.hasNext() || this.iter2.hasNext();
            };
            MergeIterator.prototype.next = function () {
                if (this.iter1.hasNext()) {
                    return this.iter1.next();
                }
                else {
                    return this.iter2.next();
                }
            };
            MergeIterator.prototype.hasPrevious = function () {
                return this.iter1.hasPrevious() || this.iter2.hasPrevious();
            };
            MergeIterator.prototype.previous = function () {
                if (this.iter2.hasPrevious()) {
                    return this.iter2.previous();
                }
                else {
                    return this.iter1.previous();
                }
            };
            MergeIterator.prototype.remove = function () {
                if (this.iter1.hasNext()) {
                    this.iter1.remove();
                }
                else {
                    this.iter2.remove();
                }
            };
            MergeIterator.prototype.insert = function (e) {
                if (this.iter1.hasNext()) {
                    this.iter1.insert(e);
                }
                else {
                    this.iter2.insert(e);
                }
            };
            MergeIterator.prototype.swap = function (e) {
                if (this.iter2.hasPrevious()) {
                    return this.iter2.swap(e);
                }
                else {
                    return this.iter1.swap(e);
                }
            };
            MergeIterator.prototype.reset = function () {
                this.iter1.reset();
                this.iter2.reset();
            };
            MergeIterator.prototype.clone = function () {
                return new MergeIterator(this.iter1.clone(), this.iter2.clone());
            };
            return MergeIterator;
        }());
        collections.MergeIterator = MergeIterator;
        function forPermutations(l1, l2, func) {
            var iter1 = l1.iterator();
            var iter2 = l2.iterator();
            var go = true;
            while (iter1.hasNext() && go) {
                var elm = iter1.next();
                while (iter2.hasNext()) {
                    go = func(elm, iter2.next());
                }
                iter2.reset();
            }
        }
        collections.forPermutations = forPermutations;
        function forEach(list, func) {
            var iter = list.iterator();
            var go = true;
            var index = 0;
            while (iter.hasNext() && go) {
                go = func(iter.next(), index, list);
            }
        }
        collections.forEach = forEach;
        function forCombinations(list, func) {
            var iter1;
            if (isList(list)) {
                iter1 = list.iterator();
            }
            else {
                iter1 = list;
            }
            var go = true;
            var iter2;
            while (iter1.hasNext() && go) {
                var elm = iter1.next();
                iter2 = iter1.clone();
                while (iter2.hasNext() && go) {
                    go = func(elm, iter2.next());
                }
            }
        }
        collections.forCombinations = forCombinations;
        function isList(e) {
            return e.hasOwnProperty("get") &&
                e.hasOwnProperty("add") &&
                e.hasOwnProperty("remove") &&
                e.hasOwnProperty("length") &&
                e.hasOwnProperty("iterator") &&
                e.hasOwnProperty("descendingIterator");
        }
        collections.isList = isList;
        var Dictionary = (function () {
            function Dictionary(dict) {
                this.dict = dict || {};
            }
            Dictionary.prototype.put = function (name, e) {
                this.dict[name] = e;
            };
            Dictionary.prototype.get = function (name) {
                return this.dict[name];
            };
            Dictionary.prototype.has = function (name) {
                return this.dict.hasOwnProperty(name);
            };
            Dictionary.prototype.remove = function (name) {
                var val = this.dict[name];
                delete this.dict[name];
                return val;
            };
            return Dictionary;
        }());
        collections.Dictionary = Dictionary;
    })(collections = exports.collections || (exports.collections = {}));
    var math;
    (function (math) {
        var Vec2 = (function () {
            function Vec2(x, y) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                this.x = x;
                this.y = y;
            }
            Vec2.prototype.addXY = function (other) {
                this.x += other.x;
                this.y += other.y;
                return this;
            };
            Vec2.prototype.subXY = function (other) {
                this.x -= other.x;
                this.y -= other.y;
                return this;
            };
            Vec2.prototype.scaleXY = function (scale) {
                this.x *= scale;
                this.y *= scale;
                return this;
            };
            Vec2.prototype.distXY = function (other) {
                var dx = this.x - other.x;
                var dy = this.y - other.y;
                return Math.sqrt(dx * dx + dy * dy);
            };
            Vec2.prototype.magXY = function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            };
            Vec2.prototype.normXY = function () {
                return this.cloneXY().scaleXY(1 / this.magXY());
            };
            Vec2.prototype.cloneXY = function () {
                return new Vec2(this.x, this.y);
            };
            Vec2.prototype.dotXY = function (other) {
                return this.x * other.x + this.y * other.y;
            };
            Vec2.prototype.scale = function (scalar) {
                this.x *= scalar;
                this.y *= scalar;
                return this;
            };
            Vec2.prototype.dist = function (other) {
                if (other instanceof Vec2) {
                    return this.distXY(other);
                }
                return -1;
            };
            Vec2.prototype.mag = function () {
                return this.magXY();
            };
            Vec2.prototype.norm = function () {
                return this.normXY();
            };
            Vec2.prototype.dot = function (other) {
                if (other instanceof Vec2) {
                    return this.dotXY(other);
                }
                return -1;
            };
            return Vec2;
        }());
        math.Vec2 = Vec2;
        var Vec3 = (function (_super) {
            __extends(Vec3, _super);
            function Vec3(x, y, z) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                if (z === void 0) { z = 0; }
                _super.call(this, x, y);
                this.z = z;
            }
            Vec3.prototype.addXYZ = function (other) {
                this.x += other.x;
                this.y += other.y;
                this.z += other.z;
                return this;
            };
            Vec3.prototype.subXYZ = function (other) {
                this.x -= other.x;
                this.y -= other.y;
                this.z -= other.z;
                return this;
            };
            Vec3.prototype.scaleXYZ = function (scale) {
                this.x *= scale;
                this.y *= scale;
                this.z *= scale;
                return this;
            };
            Vec3.prototype.distXYZ = function (other) {
                var dx = this.x - other.x;
                var dy = this.y - other.y;
                var dz = this.z - other.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            };
            Vec3.prototype.magXYZ = function () {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            };
            Vec3.prototype.normXYZ = function () {
                return this.cloneXYZ().scaleXYZ(1 / this.magXYZ());
            };
            Vec3.prototype.cloneXYZ = function () {
                return new Vec3(this.x, this.y, this.z);
            };
            Vec3.prototype.cross = function (other) {
                var a = this;
                var b = other;
                return new Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
            };
            Vec3.prototype.dotYXZ = function (other) {
                return this.x * other.x + this.y * other.y + this.z * other.z;
            };
            Vec3.prototype.scale = function (scalar) {
                this.scaleXYZ(scalar);
                return this;
            };
            Vec3.prototype.dist = function (other) {
                if (other instanceof Vec3) {
                    return this.distXYZ(other);
                }
                return _super.prototype.dist.call(this, other);
            };
            Vec3.prototype.mag = function () {
                return this.magXYZ();
            };
            Vec3.prototype.norm = function () {
                return this.normXYZ();
            };
            Vec3.prototype.dot = function (other) {
                if (other instanceof Vec3) {
                    return this.dot(other);
                }
                return _super.prototype.dot.call(this, other);
            };
            return Vec3;
        }(Vec2));
        math.Vec3 = Vec3;
        var Vec4 = (function (_super) {
            __extends(Vec4, _super);
            function Vec4(x, y, z, w) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                if (z === void 0) { z = 0; }
                if (w === void 0) { w = 0; }
                _super.call(this, x, y, z);
                this.w = w;
            }
            Vec4.prototype.addXYZW = function (other) {
                this.x += other.x;
                this.y += other.y;
                this.z += other.z;
                this.w += other.w;
                return this;
            };
            Vec4.prototype.subXYZW = function (other) {
                this.x -= other.x;
                this.y -= other.y;
                this.z -= other.z;
                this.w -= other.w;
                return this;
            };
            Vec4.prototype.scaleXYZW = function (scale) {
                this.x *= scale;
                this.y *= scale;
                this.z *= scale;
                this.w *= scale;
                return this;
            };
            Vec4.prototype.distXYZW = function (other) {
                var dx = this.x - other.x;
                var dy = this.y - other.y;
                var dz = this.z - other.z;
                var dw = this.w - other.w;
                return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
            };
            Vec4.prototype.magXYZW = function () {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
            };
            Vec4.prototype.normXYZW = function () {
                return this.cloneXYZW().scaleXYZW(1 / this.magXYZW());
            };
            Vec4.prototype.cloneXYZW = function () {
                return new Vec4(this.x, this.y, this.z, this.w);
            };
            Vec4.prototype.dotXYZW = function (other) {
                return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
            };
            Vec4.prototype.scale = function (scalar) {
                return this.scaleXYZW(scalar);
            };
            Vec4.prototype.dist = function (other) {
                if (other instanceof Vec4) {
                    return this.distXYZW(other);
                }
                return _super.prototype.dist.call(this, other);
            };
            Vec4.prototype.mag = function () {
                return this.magXYZW();
            };
            Vec4.prototype.norm = function () {
                return this.normXYZW();
            };
            Vec4.prototype.dot = function (other) {
                if (other instanceof Vec4) {
                    return this.dotXYZW(other);
                }
                return _super.prototype.dot.call(this, other);
            };
            return Vec4;
        }(Vec3));
        math.Vec4 = Vec4;
        var Mat2 = (function () {
            function Mat2(mat) {
                if (mat != null) {
                    if (mat.length >= 4) {
                        this.mat = mat;
                    }
                    else {
                        this.mat = [1, 1, 0, 0];
                    }
                }
                else {
                    this.mat = [1, 1, 0, 0];
                }
            }
            Mat2.prototype.multiplyMat2 = function (mat) {
                this.mat[0] = (this.mat[0] * mat.mat[0]) + (this.mat[2] * mat.mat[1]);
                this.mat[1] = (this.mat[1] * mat.mat[0]) + (this.mat[3] * mat.mat[1]);
                this.mat[2] = (this.mat[0] * mat.mat[2]) + (this.mat[2] * mat.mat[3]);
                this.mat[3] = (this.mat[1] * mat.mat[2]) + (this.mat[3] * mat.mat[3]);
            };
            Mat2.prototype.rotate = function (theta) {
                this.mat[0] *= Math.cos(theta);
                this.mat[1] *= Math.sin(theta);
                this.mat[2] *= -Math.sin(theta);
                this.mat[3] *= Math.cos(theta);
            };
            Mat2.prototype.multiplyVec2 = function (vec) {
                return [(this.mat[0] * vec.x) + (this.mat[2] * vec.y),
                    (this.mat[1] * vec.x) + (this.mat[3] * vec.y)];
            };
            Mat2.prototype.clone = function () {
                var newMat = [this.mat[0], this.mat[1], this.mat[2], this.mat[3]];
                return new Mat2(newMat);
            };
            Mat2.prototype.reset = function () {
                this.mat[0] = 1;
                this.mat[1] = 0;
                this.mat[2] = 0;
                this.mat[3] = 1;
            };
            Mat2.prototype.copy = function (mat) {
                mat.mat[0] = this.mat[0];
                mat.mat[1] = this.mat[1];
                mat.mat[2] = this.mat[2];
                mat.mat[3] = this.mat[3];
            };
            return Mat2;
        }());
        math.Mat2 = Mat2;
        var Mat3 = (function () {
            function Mat3(mat) {
                if (mat == null) {
                    this.mat = [1, 0, 0,
                        0, 1, 0,
                        0, 0, 1];
                }
                else {
                    if (mat.length >= 9) {
                        this.mat = mat;
                    }
                    else {
                        this.mat = [1, 0, 0,
                            0, 1, 0,
                            0, 0, 1];
                    }
                }
            }
            Mat3.prototype.multiplyMat3 = function (mat) {
                this.mat[0] = (this.mat[0] * mat.mat[0]) + (this.mat[3] * mat.mat[1]) + (this.mat[6] * mat.mat[2]);
                this.mat[1] = (this.mat[1] * mat.mat[0]) + (this.mat[4] * mat.mat[1]) + (this.mat[7] * mat.mat[2]);
                this.mat[2] = (this.mat[2] * mat.mat[0]) + (this.mat[5] * mat.mat[1]) + (this.mat[8] * mat.mat[2]);
                this.mat[3] = (this.mat[0] * mat.mat[3]) + (this.mat[3] * mat.mat[4]) + (this.mat[6] * mat.mat[5]);
                this.mat[4] = (this.mat[1] * mat.mat[3]) + (this.mat[4] * mat.mat[4]) + (this.mat[7] * mat.mat[5]);
                this.mat[5] = (this.mat[2] * mat.mat[3]) + (this.mat[5] * mat.mat[4]) + (this.mat[8] * mat.mat[5]);
                this.mat[6] = (this.mat[0] * mat.mat[6]) + (this.mat[3] * mat.mat[7]) + (this.mat[6] * mat.mat[8]);
                this.mat[7] = (this.mat[1] * mat.mat[6]) + (this.mat[4] * mat.mat[7]) + (this.mat[7] * mat.mat[8]);
                this.mat[8] = (this.mat[2] * mat.mat[6]) + (this.mat[5] * mat.mat[7]) + (this.mat[8] * mat.mat[8]);
            };
            Mat3.prototype.multiplyVec3 = function (vec, buf) {
                if (buf == null || buf.length < 3) {
                    buf = [0, 0, 0];
                }
                buf[0] = (this.mat[0] * vec.x) + (this.mat[3] * vec.y) + (this.mat[6] * vec.z);
                buf[1] = (this.mat[1] * vec.x) + (this.mat[4] * vec.y) + (this.mat[7] * vec.z);
                buf[2] = (this.mat[2] * vec.x) + (this.mat[5] * vec.y) + (this.mat[8] * vec.z);
                return buf;
            };
            Mat3.prototype.clone = function () {
                return new Mat3([
                    this.mat[0], this.mat[1], this.mat[2],
                    this.mat[3], this.mat[4], this.mat[5],
                    this.mat[6], this.mat[7], this.mat[8]
                ]);
            };
            Mat3.prototype.reset = function () {
                this.mat[0] = 1;
                this.mat[1] = 0;
                this.mat[2] = 0;
                this.mat[3] = 0;
                this.mat[4] = 1;
                this.mat[5] = 0;
                this.mat[6] = 0;
                this.mat[7] = 0;
                this.mat[8] = 1;
            };
            Mat3.prototype.copy = function (mat) {
                mat.mat[0] = this.mat[0];
                mat.mat[1] = this.mat[1];
                mat.mat[2] = this.mat[2];
                mat.mat[3] = this.mat[3];
                mat.mat[4] = this.mat[4];
                mat.mat[5] = this.mat[5];
                mat.mat[6] = this.mat[6];
                mat.mat[7] = this.mat[7];
                mat.mat[8] = this.mat[8];
            };
            Mat3.prototype.to3x2 = function (buf) {
                var mat;
                if (buf && buf.length >= 6) {
                    mat = buf;
                }
                else {
                    mat = [1, 0, 0, 1, 0, 0];
                }
                mat[0] = this.mat[0];
                mat[1] = this.mat[1];
                mat[2] = this.mat[3];
                mat[3] = this.mat[4];
                mat[4] = this.mat[6];
                mat[5] = this.mat[7];
                return mat;
            };
            return Mat3;
        }());
        math.Mat3 = Mat3;
        var Mat3x2 = (function () {
            function Mat3x2(mat) {
                if (mat == null) {
                    this.mat = [1, 0, 0, 1, 0, 0];
                }
                else {
                    if (mat.length >= 6) {
                        this.mat = mat;
                    }
                    else {
                        this.mat = [1, 0, 0, 1, 0, 0];
                    }
                }
            }
            Mat3x2.prototype.multiplyMat3x2 = function (mat) {
                this.mat[0] = (this.mat[0] * mat.mat[0]) + (this.mat[2] * mat.mat[1]) + (this.mat[4] * 0);
                this.mat[1] = (this.mat[1] * mat.mat[0]) + (this.mat[3] * mat.mat[1]) + (this.mat[5] * 0);
                this.mat[2] = (this.mat[0] * mat.mat[2]) + (this.mat[2] * mat.mat[3]) + (this.mat[4] * 0);
                this.mat[3] = (this.mat[1] * mat.mat[2]) + (this.mat[3] * mat.mat[3]) + (this.mat[5] * 0);
                this.mat[4] = (this.mat[0] * mat.mat[4]) + (this.mat[2] * mat.mat[5]) + (this.mat[4] * 1);
                this.mat[5] = (this.mat[1] * mat.mat[4]) + (this.mat[3] * mat.mat[5]) + (this.mat[5] * 1);
            };
            Mat3x2.prototype.multiplyVec2 = function (vec, buf) {
                if (buf == null || buf.length < 2) {
                    buf = [0, 0];
                }
                buf[0] = (this.mat[0] * vec.x) + (this.mat[2] * vec.y) + (this.mat[4] * 1);
                buf[1] = (this.mat[1] * vec.x) + (this.mat[3] * vec.y) + (this.mat[5] * 1);
                return buf;
            };
            Mat3x2.prototype.rotate = function (theta) {
                this.mat[0] *= Math.cos(theta);
                this.mat[1] *= Math.sin(theta);
                this.mat[2] *= -Math.sin(theta);
                this.mat[3] *= Math.cos(theta);
            };
            Mat3x2.prototype.clone = function () {
                return new Mat3x2([
                    this.mat[0], this.mat[1], this.mat[2],
                    this.mat[3], this.mat[4], this.mat[5]
                ]);
            };
            Mat3x2.prototype.reset = function () {
                this.mat[0] = 1;
                this.mat[1] = 0;
                this.mat[2] = 0;
                this.mat[3] = 1;
                this.mat[4] = 0;
                this.mat[5] = 0;
            };
            Mat3x2.prototype.copy = function (mat) {
                mat.mat[0] = this.mat[0];
                mat.mat[1] = this.mat[1];
                mat.mat[2] = this.mat[2];
                mat.mat[3] = this.mat[3];
                mat.mat[4] = this.mat[4];
                mat.mat[5] = this.mat[5];
            };
            Mat3x2.prototype.asArray = function () {
                return this.mat;
            };
            return Mat3x2;
        }());
        math.Mat3x2 = Mat3x2;
    })(math = exports.math || (exports.math = {}));
    var Logging;
    (function (Logging) {
        (function (LogLevels) {
            LogLevels[LogLevels["DEBUG"] = 0] = "DEBUG";
            LogLevels[LogLevels["LOG"] = 1] = "LOG";
            LogLevels[LogLevels["INFO"] = 2] = "INFO";
            LogLevels[LogLevels["WARNING"] = 3] = "WARNING";
            LogLevels[LogLevels["ERROR"] = 4] = "ERROR";
            LogLevels[LogLevels["NONE"] = 5] = "NONE";
        })(Logging.LogLevels || (Logging.LogLevels = {}));
        var LogLevels = Logging.LogLevels;
        var Log = (function () {
            function Log(name, parent) {
                this.filter = LogLevels.LOG;
                this.name = name;
                if (parent != null) {
                    this.parentLog = parent;
                    this.filter = parent.filter;
                }
            }
            Log.prototype.setFilterLevel = function (level) {
                this.filter = level;
            };
            Log.prototype.doLog = function (level, msg) {
                if (level < this.filter)
                    return;
                msg = "[" + this.name + "] " + msg;
                if (this.parentLog != null) {
                    this.parentLog.doLog(level, msg);
                }
                else {
                    switch (level) {
                        case LogLevels.DEBUG:
                            {
                                msg = "[debug] " + msg;
                                if (console.debug)
                                    console.debug(msg);
                                else
                                    console.log(msg);
                            }
                            break;
                        case LogLevels.LOG:
                            {
                                msg = "[ log ] " + msg;
                                console.log(msg);
                            }
                            break;
                        case LogLevels.INFO:
                            {
                                msg = "[info ] " + msg;
                                console.info(msg);
                            }
                            break;
                        case LogLevels.WARNING:
                            {
                                msg = "[warn ] " + msg;
                                console.warn(msg);
                            }
                            break;
                        case LogLevels.ERROR:
                            {
                                msg = "[error] " + msg;
                                console.error(msg);
                            }
                            break;
                    }
                }
            };
            Log.prototype.debug = function (msg) {
                this.doLog(LogLevels.DEBUG, msg);
            };
            Log.prototype.log = function (msg) {
                this.doLog(LogLevels.LOG, msg);
            };
            Log.prototype.info = function (msg) {
                this.doLog(LogLevels.INFO, msg);
            };
            Log.prototype.warn = function (msg) {
                this.doLog(LogLevels.WARNING, msg);
            };
            Log.prototype.error = function (msg) {
                this.doLog(LogLevels.ERROR, msg);
            };
            Log.prototype.assert = function (level, condition, msg) {
                if (condition) {
                    this.doLog(level, msg);
                }
            };
            Log.prototype.dir = function (level, obj) {
                if (level < this.filter)
                    return;
                if (this.parentLog != null) {
                    this.parentLog.dir(level, obj);
                }
                else {
                    console.dir(obj);
                }
            };
            Log.prototype.dirxml = function (level, obj) {
                if (level < this.filter)
                    return;
                if (this.parentLog != null) {
                    this.parentLog.dirxml(level, obj);
                }
                else {
                    console.dirxml(obj);
                }
            };
            Log.prototype.count = function (level, lbl) {
                if (level < this.filter)
                    return;
                if (lbl != null) {
                    lbl = "[" + this.name + "] " + lbl;
                }
                else {
                    lbl = "[" + this.name + "]";
                }
                if (this.parentLog != null) {
                    this.parentLog.count(level, lbl);
                }
                else {
                    console.count(lbl);
                }
            };
            Log.prototype.group = function (level, name) {
                if (level < this.filter)
                    return;
                if (this.parentLog != null) {
                    this.parentLog.group(level, name);
                }
                else {
                    console.group(name);
                }
            };
            Log.prototype.groupCollapsed = function (level, name) {
                if (level < this.filter)
                    return;
                if (this.parentLog != null) {
                    this.parentLog.groupCollapsed(level, name);
                }
                else {
                    console.groupCollapsed(name);
                }
            };
            Log.prototype.groupEnd = function (level) {
                if (level < this.filter)
                    return;
                if (this.parentLog != null) {
                    this.parentLog.groupEnd(level);
                }
                else {
                    console.groupEnd();
                }
            };
            Log.prototype.time = function (level, lbl) {
                if (level < this.filter)
                    return;
                lbl = "[" + this.name + "] " + lbl;
                if (this.parentLog != null) {
                    this.parentLog.time(level, lbl);
                }
                else {
                    console.time(lbl);
                }
            };
            Log.prototype.timeEnd = function (level, lbl) {
                if (level < this.filter)
                    return;
                lbl = "[" + this.name + "] " + lbl;
                if (this.parentLog != null) {
                    this.parentLog.timeEnd(level, lbl);
                }
                else {
                    console.timeEnd(lbl);
                }
            };
            Log.prototype.trace = function (level) {
                if (level < this.filter)
                    return;
                if (this.parentLog != null) {
                    this.parentLog.trace(level);
                }
                else {
                    console.trace();
                }
            };
            return Log;
        }());
        Logging.Log = Log;
    })(Logging = exports.Logging || (exports.Logging = {}));
});
