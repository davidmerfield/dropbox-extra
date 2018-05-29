Wrapper around the official Dropbox JavaScript SDK, inspired by fs-extra. It handles errors sensibly: backing off and retrying as neccessary.

```
npm install dropbox-extra -save
```

Then use it like this:

```javascript
var Dropbox = require('dropbox-extra');
var dropbox = new Dropbox(ACCESS_TOKEN);
  
dropbox.writeFile('/test.txt', 'Hello world', function(err){

});
```