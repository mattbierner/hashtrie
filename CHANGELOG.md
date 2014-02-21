# ChangeLog #

## 0.2.0 - Feb 20, 2014
* 4x performance boost.
* Null values can be stored in map.
* Added `has` to check if an entry exists.
* Added `tryGet` to get a value or return a default.
* fold takes an object with `key` and `value` properties instead of array.
* Modify on an empty node is called with no value (arity 0) instead of with null.


## 0.1.2 - Feb 19, 2014
* Fixed spelling error for package.json main.

## 0.1.1 - Feb 19, 2014
* Updated internal hash function to return numbers directly that are passed to it.

## 0.1.0 - Feb 18, 2014
* Added aggregate operations
** `fold` - collect data.
** `count` - get number of elements.
** `pairs` - get key value pairs
** `keys` - get keys.
** `values` - get values.

## 0.0.2 - Feb 18, 2014
* Removed dead code.
* Recompiled to remove let expr overhead.

## 0.0.1 - Feb 18, 2014
* Fixed over aggressive collapsing of array nodes.

## 0.0.0 - Feb 18, 2014
* Initial release.