/**
 * Computes a hash using the same algorithm that the Dropbox API uses for the
 * the "content_hash" metadata field.
 *
 * The `digest()` method returns a raw binary representation of the hash.
 * The "content_hash" field in the Dropbox API is a hexadecimal-encoded version
 * of the digest.
 *
 * Example:
 *
 *     const fs = require('fs');
 *     const dch = require('dropbox-content-hasher');
 *
 *     const hasher = dch.create();
 *     const f = fs.createReadStream('some-file');
 *     f.on('data', function(buf) {
 *       hasher.update(buf);
 *     });
 *     f.on('end', function(err) {
 *       const hexDigest = hasher.digest('hex');
 *       console.log(hexDigest);
 *     });
 *     f.on('error', function(err) {
 *       console.error("Error reading from file: " + err);
 *       process.exit(1);
 *     });
 */

var fs = require('fs-extra');
var crypto = require('crypto');
var BLOCK_SIZE = 4 * 1024 * 1024;

function DropboxContentHasher(overallHasher, blockHasher, blockPos) {
  this._overallHasher = overallHasher;
  this._blockHasher = blockHasher;
  this._blockPos = blockPos;
}

DropboxContentHasher.prototype.update = function(data, inputEncoding) {
  if (this._overallHasher === null) {
      throw new Error("can't use this object anymore; you already called digest()");
  }

  if (!Buffer.isBuffer(data)) {
    if (inputEncoding !== undefined &&
        inputEncoding !== 'utf8' && inputEncoding !== 'ascii' && inputEncoding !== 'latin1') {
      // The docs for the standard hashers say they only accept these three encodings.
      throw new Error("Invalid 'inputEncoding': " + JSON.stringify(inputEncoding));
    }
    data = Buffer.from(data, inputEncoding);
  }

  var offset = 0;
  while (offset < data.length) {
    if (this._blockPos === BLOCK_SIZE) {
      this._overallHasher.update(this._blockHasher.digest());
      this._blockHasher = crypto.createHash('sha256');
      this._blockPos = 0;
    }

    var spaceInBlock = BLOCK_SIZE - this._blockPos;
    var inputPartEnd = Math.min(data.length, offset+spaceInBlock);
    var inputPartLength = inputPartEnd - offset;
    this._blockHasher.update(data.slice(offset, inputPartEnd));

    this._blockPos += inputPartLength;
    offset = inputPartEnd;
  }
};

DropboxContentHasher.prototype.digest = function(encoding) {
  if (this._overallHasher === null) {
      throw new Error("can't use this object anymore; you already called digest()");
  }

  if (this._blockPos > 0) {
    this._overallHasher.update(this._blockHasher.digest());
    this._blockHasher = null;
  }
  var r = this._overallHasher.digest(encoding);
  this._overallHasher = null;  // Make sure we can't use this object anymore.
  return r;
};

var dch = {};

dch.BLOCK_SIZE = BLOCK_SIZE;

dch.create = function() {
  return new DropboxContentHasher(crypto.createHash('sha256'), crypto.createHash('sha256'), 0);
};

module.exports = function (path, callback) {

  var hasher = dch.create();
  var f = fs.createReadStream(path);

  f.on('data', function(buf) {
    hasher.update(buf);
  });

  f.on('end', function() {
    var hexDigest = hasher.digest('hex');
    callback(null, hexDigest);
  });

  f.on('error', callback);
};