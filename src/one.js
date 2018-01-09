
function Ranger(start, end) {
  this.start = end === undefined ? 0 : start;
  this.end = end !== undefined ? end : start;
}

Ranger.prototype.values = function values() {
  const results = [];
  for (let i = this.start; i < this.end; i++ ) {
    results.push(i);
  }
  return results;
};

Ranger.prototype[Symbol.iterator] = function* gen() {
  for (let i = this.start; i < this.end; i++) {
    yield i;
  }
};

