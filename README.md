An unfinished, unofficial wrapper around the [official Dropbox JavaScript SDK](https://github.com/dropbox/dropbox-sdk-js), inspired by [fs-extra](https://github.com/jprichardson/node-fs-extra). 

Planned features:
- Handle retry-able errors: backing off and retrying, with jitter, as needed.
- Tolerates paths in a reasonable way, e.g. 'test/foo.txt' and '/test/foo.txt' are equivalent.
- Offers handy ```upload``` and ```download``` methods which use Streams!
- Offers handy ```sync``` methods to synchronize a local folder with one in Dropbox
- Lets you interact with the root directory as if it were another folder, e.g. ```emptyDir('/')``` will remove all the files in the user's Dropbox.
- ```remove``` won't throw an error when the file doesn't exist, etc...

See also:
- [dropbox](https://github.com/dropbox/dropbox-sdk-js)
- [dropbox-fs](https://github.com/sallar/dropbox-fs)
- [dropbox-stream](https://github.com/velocityzen/dropbox-stream)

### Getting started

```
npm install dropbox-extra -save
```

You'll need to acquire an ```ACCESS_TOKEN``` from the user. Then you can initialize a ```db``` client like this:

```javascript
var dropbox = require('dropbox-extra');
var db = new dropbox(ACCESS_TOKEN);
```

### Examples

db.writeFile(, function(){
  
});

db.copy(path, path, function(err){
  
});

#### API

##### emptyDir

```
db.emptyDir('/foo', function(err){});
```

##### mkdir

```
db.mkdir('/foo', function(err){});
```

##### writeFile

Behaves like fs.writeFile.

```
db.writeFile('/test.txt', 'Hello world', function(err){});
```