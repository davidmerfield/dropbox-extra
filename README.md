An unfinished, unofficial wrapper around the official Dropbox JavaScript SDK, inspired by [fs-extra](https://github.com/jprichardson/node-fs-extra). 

Planned features:
- It handles errors sensibly: backing off and retrying as neccessary.
- Resolves some of the inconsistencies in the ways Dropbox interacts with paths
- 

See also:
- [dropbox-fs](https://github.com/sallar/dropbox-fs)

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

##### writeFile

Behaves like fs.writeFile.

```
db.writeFile('/test.txt', 'Hello world', function(err){});
```