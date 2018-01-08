// function that does the lazy evaluation
/* eslint-disable */
'use strict'

const typeOf = object => object && object.constructor.name.toLowerCase();


class _GeneratorWrapper {
  constructor(gen) {
    this.__gen = gen
  }


  all() {
    let _result = [];
    for (let value of this.__gen) {
      _result.push(value);;
    }
    return _result;
  }

  get(uptoIndex) {
    let _result = [];
    let start = uptoIndex;
    while (start > 0) {
      const { value, done } = this.__gen.next();
      if (done) {
        break;
      }
      _result.push(value);
      start -= 1;
    }
    return _result;
  }
}

class LazyList {
  constructor(alist) {
    this._alist = alist;
    this.__functions = [];
  }

  map(_func) {
    // map is a function that takes in transformer
    this.__functions.push(_func);
    return this;
  }

  apply() {
    
      return new _GeneratorWrapper((function* () {
        for(let value of this._alist) {
          yield this.__functions.reduce((acc, func) =>
            func(acc), value)
        }
      }).bind(this)());
    
  }
}

const Lazy = gen => new LazyList(gen);
module.exports = {
  Lazy,
};
