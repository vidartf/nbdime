// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

class ShortCircuit extends Error {};

export
class SetA<T> extends Set<T> {

  constructor(values?: T[] | Set<T>) {
    if (values instanceof Set) {
      super();
      values.forEach((elem) => {
        this.add(elem);
      });
    } else {
      super(values);
    }
  }

  union(...others: Set<T>[]): SetA<T> {
    let union = new SetA(this);
    for (let other of others) {
      other.forEach((elem) => {
        union.add(elem);
      });
    }
    return union;
  }

  intersection(...others: Set<T>[]): SetA<T> {
    let intersection = new SetA();
    for (let other of others) {
      other.forEach((elem) => {
        if (this.has(elem)) {
          intersection.add(elem);
        }
      });
    }
    return intersection;
  }

  difference(...others: Set<T>[]): SetA<T> {
    let difference = new SetA(this);
    for (let other of others) {
      other.forEach((elem) => {
        difference.delete(elem);
      });
    }
    return difference;
  }


  isSuperset(other: Set<T>) {
    try {
      other.forEach((elem) => {
        if (!this.has(elem)) {
          throw new ShortCircuit();
        }
      });
    } catch (e) {
      if (e instanceof ShortCircuit) {
        return false;
      }
    }
    return true;
  }

}
