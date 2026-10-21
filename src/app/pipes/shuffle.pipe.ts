import { Pipe, PipeTransform } from '@angular/core';

// Random order for a list, e.g. the answers of a multiple-choice task.
//
// Pure on purpose: the order is worked out once per input array and then stays
// the same for as long as that array is unchanged. An impure pipe would
// reshuffle the answers on every change detection, while the player is reading.
// Fisher–Yates on a copy (the input is never modified), the same algorithm as
// the `shuffle` pipe of angular-pipes that this replaces. Anything that is not
// an array is returned as it is.
@Pipe({ name: 'shuffle' })
export class ShufflePipe implements PipeTransform {
  transform<T>(input: T): T {
    if (!Array.isArray(input)) {
      return input;
    }
    const copy = [...input];
    for (let i = copy.length; i; --i) {
      const j = Math.floor(Math.random() * i);
      const x = copy[i - 1];
      copy[i - 1] = copy[j];
      copy[j] = x;
    }
    return copy as unknown as T;
  }
}
