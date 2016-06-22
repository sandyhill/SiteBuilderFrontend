export module collections {
  export interface Iterator < E > {
    hasNext(): boolean;
    next(): E;
    hasPrevious(): boolean;
    previous(): E;
    remove(): void;
    insert(e: E): void;
    swap(e: E): E;
    reset(): void;
    clone(): Iterator < E > ;
  }

  export interface List < E > {
    get(index: number): E;
    add(e: E): void;
    remove(e: E | number): E;
    length(): number;
    iterator(): Iterator < E > ;
    descendingIterator(): Iterator < E > ;
  }

  class LinkElement < E > {
    public previous: LinkElement < E > = null;
    public next: LinkElement < E > = null;
    public value: E = null;
  };

  interface changeNum {
    (delta: number): void;
  }

  class LinkedListIterator < E > implements Iterator < E > {
    protected currentElement: LinkElement < E > ;
    protected startElement: LinkElement < E > ;

    constructor(protected list: LinkedList < E > , start: LinkElement < E > , protected change: changeNum) {
      this.currentElement = start;
      this.startElement = start;
    }

    public hasNext(): boolean {
      return this.currentElement.next !== null &&
        this.currentElement.next.value !== null;
    }

      public next(): E {
      if (this.currentElement.next.value === null) {
        return null;
      }
      this.currentElement = this.currentElement.next;
      return this.currentElement.value;
    }

      public hasPrevious(): boolean {
      return this.currentElement.previous !== null &&
        this.currentElement.value !== null;
    }

      public previous(): E {
      if (this.currentElement.value === null) {
        return null;
      }
      this.currentElement = this.currentElement.previous;
      return this.currentElement.next.value;
    }

      public remove(): E {
      if (this.currentElement.next.value === null) {
        return null;
      }

      let ret = this.currentElement.next.value;

      this.currentElement.next = this.currentElement.next.next;
      this.currentElement.next.previous = this.currentElement;

      this.change(-1);
      return ret;
    }

      public insert(e: E): void {
      let holder = new LinkElement < E > ();

      holder.value = e;
      holder.previous = this.currentElement;
      holder.next = this.currentElement.next;
      holder.previous.next = holder;
      holder.next.previous = holder;

      this.change(1);
    }

      public swap(e: E): E {
      let ret: E = this.currentElement.next.value;
      this.currentElement.next.value = e;
      return ret;
    }

      public reset(): void {
      this.currentElement = this.startElement;
    }

      public clone(): Iterator < E > {
      return new LinkedListIterator < E > (this.list, this.currentElement, this.change);
    }
  }

  class DescendingLinkedListIterator < E > extends LinkedListIterator < E > {
    constructor(list: LinkedList < E > , start: LinkElement < E > , change: changeNum) {
      super(list, start, change);
    }

    public hasNext(): boolean {
      return super.hasPrevious();
    }

      public next(): E {
      return super.previous();
    }

      public hasPrevious(): boolean {
      return super.hasNext();
    }

      public previous(): E {
      return super.next();
    }

      public remove(): E {
      super.previous();
      return super.remove();
    }

      public insert(e: E): void {
      super.previous();
      super.insert(e);
    }

      public swap(e: E): E {
      super.previous();
      return super.swap(e);
    }

      public clone(): Iterator < E > {
      return new DescendingLinkedListIterator < E > (this.list, this.currentElement, this.change);
    }
  }

  export class LinkedList < E > implements List < E > {
    private first: LinkElement < E > ;
    private last: LinkElement < E > ;

    private _length: number = 0;

    constructor() {
      let elm1: LinkElement < E > = new LinkElement < E > ();
      let elm2: LinkElement < E > = new LinkElement < E > ();

      elm1.next = elm2;
      elm2.previous = elm1;

      this.first = elm1;
      this.last = elm2;
    }

    private createLengthChanger(): changeNum {
      return (delta: number): void => {
        this._length += delta;
      }
    }

      public add(e: E): void {
      let holder: LinkElement < E > = new LinkElement < E > ();
      holder.value = e;
      holder.next = this.last;
      holder.previous = this.last.previous;

      this.last.previous.next = holder;
      this.last.previous = holder;

      this._length++;
    }

      public get(e: number): E {
      let elm = this.first.next;
      let i = 0;
      while (i < e) {
        elm = elm.next;
        i++;
      }

      return elm.value;
    }

      public remove(e: E | number): E {
      if (typeof e === "number") {
        let elm = this.first;
        let i = 0;
        while (i < e) {
          elm = elm.next;
          i++;
        }

        elm.previous.next = elm.next;
        elm.next.previous = elm.previous;

        this._length--;
        return elm.value;


      } else {
        let elm = this.first;
        while (elm.next.value !== null &&
          elm.value !== e) {
          elm = elm.next;
        }

        elm.previous.next = elm.next;
        elm.next.previous = elm.previous;

        this._length--;
        return elm.value;
      }
    }

      public length(): number {
      return this._length;
    }

      public iterator(): Iterator < E > {
      return new LinkedListIterator < E > (this, this.first, this.createLengthChanger());
    }

      public descendingIterator(): Iterator < E > {
      return new DescendingLinkedListIterator < E > (this, this.last.previous, this.createLengthChanger());
    }
  }

  export class FilterIterator < E > implements Iterator < E > {

    constructor(private iter: Iterator < E > , private filter: (e: E) => boolean) {

    }

    public hasNext(): boolean {
      //this is a problem...
      return true;
    }

      public next(): E {
      while (this.iter.hasNext()) {
        let elm: E = this.iter.next();

        if (this.filter(elm)) {
          return elm;
        }
      }

      return null;
    }

      public hasPrevious(): boolean {
      //this is also a problem...
      return true;
    }

      public previous(): E {
      while (this.iter.hasPrevious()) {
        let elm: E = this.iter.previous();

        if (this.filter(elm)) {
          return elm;
        }
      }

      return null;
    }

      public remove(): void {
      while (this.iter.hasNext()) {
        let elm: E = this.iter.next();

        if (this.filter(elm)) {
          this.iter.previous();
          this.iter.remove();
          break;
        }
      }
    }

      public insert(e: E): void {
      this.iter.insert(e);
    }

      public swap(e: E): E {
      return this.iter.swap(e);
    }

      public reset(): void {
      this.iter.reset();
    }

      public clone(): Iterator < E > {
      return new FilterIterator < E > (this.iter.clone(), this.filter);
    }

  }

  export class MergeIterator < E > implements Iterator < E > {
    constructor(private iter1: Iterator < E > , private iter2: Iterator < E > ) {
      iter1.reset();
      iter2.reset();
    }

    public hasNext(): boolean {
      return this.iter1.hasNext() || this.iter2.hasNext();
    }

      public next(): E {
      if (this.iter1.hasNext()) {
        return this.iter1.next();

      } else {
        return this.iter2.next();
      }
    }

      public hasPrevious(): boolean {
      return this.iter1.hasPrevious() || this.iter2.hasPrevious();
    }

      public previous(): E {
      if (this.iter2.hasPrevious()) {
        return this.iter2.previous();

      } else {
        return this.iter1.previous();
      }
    }

      public remove(): void {
      if (this.iter1.hasNext()) {
        this.iter1.remove();

      } else {
        this.iter2.remove();
      }
    }

      public insert(e: E): void {
      if (this.iter1.hasNext()) {
        this.iter1.insert(e);

      } else {
        this.iter2.insert(e);
      }
    }

      public swap(e: E): E {
      if (this.iter2.hasPrevious()) {
        return this.iter2.swap(e);

      } else {
        return this.iter1.swap(e);
      }
    }

      public reset(): void {
      this.iter1.reset();
      this.iter2.reset()
    }

      public clone(): Iterator < E > {
      return new MergeIterator(this.iter1.clone(), this.iter2.clone());
    }
  }

  export function forPermutations < E, T > (l1: List < E > , l2: List < T > , func: (e1: E, e2: T) => boolean): void {
    let iter1: Iterator < E > = l1.iterator();
    let iter2: Iterator < T > = l2.iterator();
    let go: boolean = true;

    while (iter1.hasNext() && go) {
      let elm: E = iter1.next();

      while (iter2.hasNext()) {
        go = func(elm, iter2.next());
      }

      iter2.reset();
    }
  }

  export function forEach < E > (list: List < E > , func: (elm: E, ind ? : number, lst ? : List < E > ) => boolean): void {
    let iter: Iterator < E > = list.iterator();
    let go: boolean = true;

    let index: number = 0;

    while (iter.hasNext() && go) {
      go = func(iter.next(), index, list);
    }
  }

  export function forCombinations < E > (list: List < E > | Iterator < E > , func: (e1: E, e2: E) => boolean): void {
    let iter1: Iterator < E > ;
    if (isList < E > (list)) {
      iter1 = list.iterator();

    } else {
      iter1 = list;
    }

    let go: boolean = true;

    let iter2: Iterator < E > ;

    while (iter1.hasNext() && go) {
      let elm: E = iter1.next();

      iter2 = iter1.clone();

      while (iter2.hasNext() && go) {
        go = func(elm, iter2.next());
      }
    }
  }

  export function isList < E > (e: any): e is List < E > {
    return e.hasOwnProperty("get") &&
      e.hasOwnProperty("add") &&
      e.hasOwnProperty("remove") &&
      e.hasOwnProperty("length") &&
      e.hasOwnProperty("iterator") &&
      e.hasOwnProperty("descendingIterator");
  }

  export class Dictionary < E > {
    private dict: Object;

    constructor(dict?: Object) {
      this.dict = dict || {};
    }

    public put(name: string, e: E): void {
      this.dict[name] = e;
    }

      public get(name: string): E {
      return this.dict[name];
    }

      public has(name: string): boolean {
      return this.dict.hasOwnProperty(name);
    }

      public remove(name: string): E {
      let val: E = this.dict[name];
      delete this.dict[name];
      return val;
    }
  }
}

export module math {
  export interface Vec {
    scale(scalar: number): void;
    dist(other: Vec): number;
  }

  export class Vec2 implements Vec {
    constructor(public x: number = 0, public y: number = 0) {}

    public addXY(other: Vec2): this {
      this.x += other.x;
      this.y += other.y;
      return this;
    }

    public subXY(other: Vec2): this {
      this.x -= other.x;
      this.y -= other.y;
      return this;
    }

    public scaleXY(scale: number): this {
      this.x *= scale;
      this.y *= scale;
      return this;
    }

    public distXY(other: Vec2): number {
      let dx = this.x - other.x;
      let dy = this.y - other.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    public magXY(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normXY(): Vec2 {
      return this.cloneXY().scaleXY(1 / this.magXY());
    }

    public cloneXY(): Vec2 {
      return new Vec2(this.x, this.y);
    }

    public dotXY(other: Vec2): number {
      return this.x * other.x + this.y * other.y;
    }

    public scale(scalar: number): this {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    }

    public dist(other: Vec): number {
      if (other instanceof Vec2) {
        return this.distXY(other);
      }

      return -1;
    }

    public mag(): number {
      return this.magXY();
    }

    public norm(): Vec {
      return this.normXY();
    }

    public dot(other: Vec): number {
      if (other instanceof Vec2) {
        return this.dotXY(other);
      }

      return -1;
    }
  }

  export class Vec3 extends Vec2 {
    constructor(x: number = 0, y: number = 0, public z: number = 0) {
      super(x, y);
    }

    public addXYZ(other: Vec3): this {
      this.x += other.x;
      this.y += other.y;
      this.z += other.z;
      return this;
    }

    public subXYZ(other: Vec3): this {
      this.x -= other.x;
      this.y -= other.y;
      this.z -= other.z;
      return this;
    }

    public scaleXYZ(scale: number): this {
      this.x *= scale;
      this.y *= scale;
      this.z *= scale;
      return this;
    }

    public distXYZ(other: Vec3): number {
      let dx = this.x - other.x;
      let dy = this.y - other.y;
      let dz = this.z - other.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    public magXYZ(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public normXYZ(): Vec3 {
      return this.cloneXYZ().scaleXYZ(1 / this.magXYZ());
    }

    public cloneXYZ(): Vec3 {
      return new Vec3(this.x, this.y, this.z);
    }

    public cross(other: Vec3): Vec3 {
      let a: Vec3 = this;
      let b: Vec3 = other;
      return new Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    }

    public dotYXZ(other: Vec3): number {
      return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    public scale(scalar: number): this {
      this.scaleXYZ(scalar);
      return this;
    }

    public dist(other: Vec): number {
      if (other instanceof Vec3) {
        return this.distXYZ(other);
      }

      return super.dist(other);
    }

    public mag(): number {
      return this.magXYZ();
    }

    public norm(): Vec {
      return this.normXYZ();
    }

    public dot(other: Vec): number {
      if (other instanceof Vec3) {
        return this.dot(other);
      }

      return super.dot(other);
    }
  }

  export class Vec4 extends Vec3 {
    constructor(x: number = 0, y: number = 0, z: number = 0, public w: number = 0) {
      super(x, y, z);
    }

    public addXYZW(other: Vec4): this {
      this.x += other.x;
      this.y += other.y;
      this.z += other.z;
      this.w += other.w;
      return this;
    }

    public subXYZW(other: Vec4): this {
      this.x -= other.x;
      this.y -= other.y;
      this.z -= other.z;
      this.w -= other.w;
      return this;
    }

    public scaleXYZW(scale: number): this {
      this.x *= scale;
      this.y *= scale;
      this.z *= scale;
      this.w *= scale;
      return this;
    }

    public distXYZW(other: Vec4): number {
      let dx = this.x - other.x;
      let dy = this.y - other.y;
      let dz = this.z - other.z;
      let dw = this.w - other.w;
      return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
    }

    public magXYZW(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    public normXYZW(): Vec4 {
      return this.cloneXYZW().scaleXYZW(1 / this.magXYZW());
    }

    public cloneXYZW(): Vec4 {
      return new Vec4(this.x, this.y, this.z, this.w);
    }

    public dotXYZW(other: Vec4): number {
      return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
    }

    public scale(scalar: number): this {
      return this.scaleXYZW(scalar);
    }

    public dist(other: Vec): number {
      if (other instanceof Vec4) {
        return this.distXYZW(other);

      }

      return super.dist(other);
    }

    public mag(): number {
      return this.magXYZW();
    }

    public norm(): Vec {
      return this.normXYZW();
    }

    public dot(other: Vec): number {
      if (other instanceof Vec4) {
        return this.dotXYZW(other);
      }

      return super.dot(other);
    }
  }
  
  export interface Mat {
    
  }

  export class Mat2 implements Mat {
    private mat: number[];
    
    constructor(mat?: number[]) {
      if (mat != null) {
        if (mat.length >= 4) {
          this.mat = mat;
          
        } else {
          this.mat = [1, 1, 0, 0];
        }
      } else {
        this.mat = [1, 1, 0, 0];
      }
    }
    
    public multiplyMat2(mat: Mat2): void {
      this.mat[0] = (this.mat[0] * mat.mat[0]) + (this.mat[2] * mat.mat[1]);
      this.mat[1] = (this.mat[1] * mat.mat[0]) + (this.mat[3] * mat.mat[1]);
      this.mat[2] = (this.mat[0] * mat.mat[2]) + (this.mat[2] * mat.mat[3]);
      this.mat[3] = (this.mat[1] * mat.mat[2]) + (this.mat[3] * mat.mat[3]);
    }
    
    public rotate(theta: number): void {
      this.mat[0] *= Math.cos(theta);
      this.mat[1] *= Math.sin(theta);
      this.mat[2] *= -Math.sin(theta);
      this.mat[3] *= Math.cos(theta);
    }
    
    public multiplyVec2(vec: Vec2): number[] {
      return [(this.mat[0] * vec.x) + (this.mat[2] * vec.y),
             (this.mat[1] * vec.x) + (this.mat[3] * vec.y)];
    }
    
    public clone(): Mat2 {
      let newMat: number[] = [this.mat[0], this.mat[1], this.mat[2], this.mat[3]];
      return new Mat2(newMat);
    }
    
    public reset(): void {
      this.mat[0] = 1;
      this.mat[1] = 0;
      this.mat[2] = 0;
      this.mat[3] = 1;
    }
    
    public copy(mat: Mat2): void {
      mat.mat[0] = this.mat[0];
      mat.mat[1] = this.mat[1];
      mat.mat[2] = this.mat[2];
      mat.mat[3] = this.mat[3];
    }
  }

  export class Mat3 implements Mat {
    private mat: number[];
    
    constructor(mat?: number[]) {
      if (mat == null) {
        this.mat = [1, 0, 0, 
                    0, 1, 0,
                    0, 0, 1];
      } else {
        if (mat.length >= 9) {
          this.mat = mat;
          
        } else {
          this.mat = [1, 0, 0, 
                      0, 1, 0,
                      0, 0, 1];
        }
      }
    }
    
    public multiplyMat3(mat: Mat3): void {
      this.mat[0] = (this.mat[0] * mat.mat[0]) + (this.mat[3] * mat.mat[1]) + (this.mat[6] * mat.mat[2]);
      this.mat[1] = (this.mat[1] * mat.mat[0]) + (this.mat[4] * mat.mat[1]) + (this.mat[7] * mat.mat[2]);
      this.mat[2] = (this.mat[2] * mat.mat[0]) + (this.mat[5] * mat.mat[1]) + (this.mat[8] * mat.mat[2]);
      
      this.mat[3] = (this.mat[0] * mat.mat[3]) + (this.mat[3] * mat.mat[4]) + (this.mat[6] * mat.mat[5]);
      this.mat[4] = (this.mat[1] * mat.mat[3]) + (this.mat[4] * mat.mat[4]) + (this.mat[7] * mat.mat[5]);
      this.mat[5] = (this.mat[2] * mat.mat[3]) + (this.mat[5] * mat.mat[4]) + (this.mat[8] * mat.mat[5]);
      
      this.mat[6] = (this.mat[0] * mat.mat[6]) + (this.mat[3] * mat.mat[7]) + (this.mat[6] * mat.mat[8]);
      this.mat[7] = (this.mat[1] * mat.mat[6]) + (this.mat[4] * mat.mat[7]) + (this.mat[7] * mat.mat[8]);
      this.mat[8] = (this.mat[2] * mat.mat[6]) + (this.mat[5] * mat.mat[7]) + (this.mat[8] * mat.mat[8]);
    }
    
    public multiplyVec3(vec: Vec3, buf?: number[]): number[] {
      if (buf == null || buf.length < 3) {
        buf = [0, 0, 0];
      }
      
      buf[0] = (this.mat[0] * vec.x) + (this.mat[3] * vec.y) + (this.mat[6] * vec.z);
      buf[1] = (this.mat[1] * vec.x) + (this.mat[4] * vec.y) + (this.mat[7] * vec.z);
      buf[2] = (this.mat[2] * vec.x) + (this.mat[5] * vec.y) + (this.mat[8] * vec.z);
      
      return buf;
    }
    
    public clone(): Mat3 {
      return new Mat3([
        this.mat[0], this.mat[1], this.mat[2],
        this.mat[3], this.mat[4], this.mat[5],
        this.mat[6], this.mat[7], this.mat[8]
      ]);
    }
    
    public reset(): void {
      this.mat[0] = 1;
      this.mat[1] = 0;
      this.mat[2] = 0;
      this.mat[3] = 0;
      this.mat[4] = 1;
      this.mat[5] = 0;
      this.mat[6] = 0;
      this.mat[7] = 0;
      this.mat[8] = 1;
    }
    
    public copy(mat: Mat3): void {
      mat.mat[0] = this.mat[0];
      mat.mat[1] = this.mat[1];
      mat.mat[2] = this.mat[2];
      
      mat.mat[3] = this.mat[3];
      mat.mat[4] = this.mat[4];
      mat.mat[5] = this.mat[5];
      
      mat.mat[6] = this.mat[6];
      mat.mat[7] = this.mat[7];
      mat.mat[8] = this.mat[8];
    }
    
    public to3x2(buf?: number[]): number[] {
      let mat: number[];
      if (buf && buf.length >= 6) {
        mat = buf;
      } else {
        mat = [1, 0, 0, 1, 0, 0];
      }
      
      mat[0] = this.mat[0];
      mat[1] = this.mat[1];
      mat[2] = this.mat[3];
      mat[3] = this.mat[4];
      mat[4] = this.mat[6];
      mat[5] = this.mat[7];
      
      return mat;
    }
  }

  export class Mat3x2 implements Mat {
    private mat: number[];
    
    constructor(mat?: number[]) {
      if (mat == null) {
        this.mat = [1, 0, 0, 1, 0, 0];
        
      } else {
        if (mat.length >= 6) {
          this.mat = mat;

        } else {
          this.mat = [1, 0, 0, 1, 0, 0];
        }
      }
    }
    
    public multiplyMat3x2(mat: Mat3x2): void {
      this.mat[0] = (this.mat[0] * mat.mat[0]) + (this.mat[2] * mat.mat[1]) + (this.mat[4] * 0);
      this.mat[1] = (this.mat[1] * mat.mat[0]) + (this.mat[3] * mat.mat[1]) + (this.mat[5] * 0);
      
      this.mat[2] = (this.mat[0] * mat.mat[2]) + (this.mat[2] * mat.mat[3]) + (this.mat[4] * 0);
      this.mat[3] = (this.mat[1] * mat.mat[2]) + (this.mat[3] * mat.mat[3]) + (this.mat[5] * 0);
      
      this.mat[4] = (this.mat[0] * mat.mat[4]) + (this.mat[2] * mat.mat[5]) + (this.mat[4] * 1);
      this.mat[5] = (this.mat[1] * mat.mat[4]) + (this.mat[3] * mat.mat[5]) + (this.mat[5] * 1);
    }
    
    public multiplyVec2(vec: Vec2, buf?: number[]): number[] {
      if (buf == null || buf.length < 2) {
        buf = [0, 0];
      }
      
      buf[0] = (this.mat[0] * vec.x) + (this.mat[2] * vec.y) + (this.mat[4] * 1);
      buf[1] = (this.mat[1] * vec.x) + (this.mat[3] * vec.y) + (this.mat[5] * 1);
      
      return buf;
    }
    
    public rotate(theta: number): void {
      this.mat[0] *= Math.cos(theta);
      this.mat[1] *= Math.sin(theta);
      this.mat[2] *= -Math.sin(theta);
      this.mat[3] *= Math.cos(theta);
    }
    
    public clone(): Mat3x2 {
      return new Mat3x2([
        this.mat[0], this.mat[1], this.mat[2],
        this.mat[3], this.mat[4], this.mat[5]
      ]);
    }
    
    public reset(): void {
      this.mat[0] = 1;
      this.mat[1] = 0;
      this.mat[2] = 0;
      this.mat[3] = 1;
      this.mat[4] = 0;
      this.mat[5] = 0;
    }
    
    public copy(mat: Mat3x2): void {
      mat.mat[0] = this.mat[0];
      mat.mat[1] = this.mat[1];
      mat.mat[2] = this.mat[2];
      mat.mat[3] = this.mat[3];
      mat.mat[4] = this.mat[4];
      mat.mat[5] = this.mat[5];
    }
    
    public asArray(): number[] {
      return this.mat;
    }
  }
}

export module Logging {
  export enum LogLevels {
    DEBUG, LOG, INFO, WARNING, ERROR, NONE
  }
  
  export class Log {
    private name: string;

    private parentLog: Log;

    private filter: LogLevels = LogLevels.LOG;

    constructor(name: string, parent?: Log) {
      this.name = name;
      if (parent != null) {
        this.parentLog = parent;
        this.filter = parent.filter;
      }
    }

    public setFilterLevel(level: LogLevels): void {
      this.filter = level;
    }
    
    public doLog(level: LogLevels, msg: string): void {
      if (level < this.filter) return;

      msg = `[${this.name}] ${msg}`;

      if (this.parentLog != null) {
        this.parentLog.doLog(level, msg);

      } else {
        switch (level) {
          case LogLevels.DEBUG : {
            msg = `[debug] ${msg}`;
            if (console.debug) console.debug(msg); else console.log(msg);
          } break;
          case LogLevels.LOG : {
            msg = `[ log ] ${msg}`;
            console.log(msg);
          } break;
          case LogLevels.INFO : {
            msg = `[info ] ${msg}`;
            console.info(msg);
          } break;
          case LogLevels.WARNING : {
            msg = `[warn ] ${msg}`;
            console.warn(msg);
          } break;
          case LogLevels.ERROR : {
            msg = `[error] ${msg}`;
            console.error(msg);
          } break;
        }
      }
    }

    public debug(msg: string): void {
      this.doLog(LogLevels.DEBUG, msg);
    }

    public log(msg: string): void {
      this.doLog(LogLevels.LOG, msg);
    }

    public info(msg: string): void {
      this.doLog(LogLevels.INFO, msg);
    }

    public warn(msg: string): void {
      this.doLog(LogLevels.WARNING, msg);
    }

    public error(msg: string): void {
      this.doLog(LogLevels.ERROR, msg);
    }

    public assert(level: LogLevels, condition: boolean, msg: string): void {
      if (condition) {
        this.doLog(level, msg);
      }
    }

    public dir(level: LogLevels, obj: any): void {
      if (level < this.filter) return;
      if (this.parentLog != null) {
        this.parentLog.dir(level, obj);

      } else {
        console.dir(obj);
      }
    }

    public dirxml(level: LogLevels, obj: any): void {
      if (level < this.filter) return;
      if (this.parentLog != null) {
        this.parentLog.dirxml(level, obj);

      } else {
        console.dirxml(obj);
      }
    }

    public count(level: LogLevels, lbl?: string): void {
      if (level < this.filter) return;
      if (lbl != null) {
        lbl = `[${this.name}] ${lbl}`;

      } else {
        lbl = `[${this.name}]`;
      }

      if (this.parentLog != null) {
        this.parentLog.count(level, lbl);

      } else {
        console.count(lbl);
      }
    }

    public group(level: LogLevels, name?: string): void {
      if (level < this.filter) return;
      if (this.parentLog != null) {
        this.parentLog.group(level, name);

      } else {
        console.group(name);
      }
    }

    public groupCollapsed(level: LogLevels, name?: string): void {
      if (level < this.filter) return;
      if (this.parentLog != null) {
        this.parentLog.groupCollapsed(level, name);

      } else {
        console.groupCollapsed(name);
      }
    }

    public groupEnd(level: LogLevels): void {
      if (level < this.filter) return;
      if (this.parentLog != null) {
        this.parentLog.groupEnd(level);

      } else {
        console.groupEnd();
      }
    }

    public time(level: LogLevels, lbl: string): void {
      if (level < this.filter) return;
      lbl = `[${this.name}] ${lbl}`;

      if (this.parentLog != null) {
        this.parentLog.time(level, lbl);

      } else {
        console.time(lbl);
      }
    }

    public timeEnd(level: LogLevels, lbl: string): void {
      if (level < this.filter) return;
      lbl = `[${this.name}] ${lbl}`;

      if (this.parentLog != null) {
        this.parentLog.timeEnd(level, lbl);

      } else {
        console.timeEnd(lbl);
      }
    }

    public trace(level: LogLevels): void {
      if (level < this.filter) return;
      if (this.parentLog != null) {
        this.parentLog.trace(level);

      } else {
        console.trace();
      }
    }
  }
}
