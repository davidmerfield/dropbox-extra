Wrapper around the official Dropbox JavaScript SDK, inspired by fs-extra. It handles errors sensibly: backing off and retrying as neccessary.

```
npm install dropbox-extra -save
```

You'll need to acquire an ```ACCESS_TOKEN``` from the user. Then you can initialize a ```db``` client like this:

```javascript
var dropbox = require('dropbox-extra');
var db = new dropbox(ACCESS_TOKEN);
```

#### API

##### writeFile

Behaves like fs.writeFile.

```
db.writeFile('/test.txt', 'Hello world', function(err){});
```