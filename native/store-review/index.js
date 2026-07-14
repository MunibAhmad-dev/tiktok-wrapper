'use strict';

let binding = null;
try {
  binding = require('./build/Release/store_review.node');
} catch {
  binding = null;
}

module.exports = {
  requestReview() {
    if (!binding || typeof binding.requestReview !== 'function') return false;
    try {
      return binding.requestReview();
    } catch {
      return false;
    }
  },
  isAvailable() {
    return binding != null && typeof binding.requestReview === 'function';
  },
};
