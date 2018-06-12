An unfinished, unofficial wrapper around the [Dropbox JavaScript SDK](https://github.com/dropbox/dropbox-sdk-js), inspired by [fs-extra](https://github.com/jprichardson/node-fs-extra) focused on node.js. I have no intentions of supporting browser-based usage.

***

Required API:
- add revoke (revoke access token)
- add account (get account info)
- add token
- add authenticationUrl

- sync needs events
- sync needs to work from local to dropbox (both ways)
***

Planned features:
- It would be nice to take advantage of Dropbox's batch methods, which allows you to group multiple operations under a single job. However, at the moment, I don't really need this and it complicates things. I think there should be different methods, e.g. mkdirs for multiple new directories? Batch jobs do not appear to be atomic - ie some of the parts of a job can fail and some can succeed. It doesn't seem like there's much real benefit to using them unless you're moving large numbers of files?

- Work out how to be sensible about case-sensitivty. I think I was cavalier using path_display instead of path_lower. Need to run tests in case-sensitive environment if possible.
- Support for promises and callbacks (https://github.com/RyanZim/universalify)
- Offer toggle for dry-run (i.e. don't modify the user's folder in any way)
- Will return fs-style error codes, e.g.```ENOTDIR``` and ```ENOENT```.
- Handle retry-able errors: backing off and retrying, with jitter, as needed.
- Tolerant of paths without a leading slash, e.g. 'test/foo.txt' and '/test/foo.txt' are equivalent.
- Offers handy ```upload``` and ```download``` methods which use Streams!
- Offers handy ```sync``` methods to synchronize a local folder with one in Dropbox
- Lets you interact with the root directory as if it were another folder, e.g. ```emptyDir('/')``` will remove all the files in the user's Dropbox. You can also ```move('/', '/foo')``` the root directory's contents into a subfolder, and vice versa.
- ```remove``` won't throw an error when the file doesn't exist, ```mkdir``` won't throw an error when the directory exists, etc...

See also:
- [dropbox](https://github.com/dropbox/dropbox-sdk-js)
- [dropbox-fs](https://github.com/sallar/dropbox-fs)
- [dropbox-stream](https://github.com/velocityzen/dropbox-stream)
- [fs-extra](https://github.com/jprichardson/node-fs-extra)

### Getting started

```
npm install dropbox-extra -save
```

You'll need to acquire an OAUTH ```accessToken``` from your user, or you can generate one for yourself on the developer page. Then you can initialize a ```dropbox``` client like this:

```javascript 
var Dropbox = require('dropbox-extra');
var dropbox = new Dropbox(accessToken);
```

### Examples


```javascript

dropbox.writeFile('/hello.txt', 'World!', function(err, stat){

  // There is now a file called hello.txt in the user's Dropbox

});

dropbox.sync('/folder/on/Dropbox', '/local/folder', function(err, cursor){
  
  // The local folder is now identical to the folder on Dropbox

  // Wait a while, perhaps wait for a webhook...
  dropbox.sync(cursor);
});


```

#### API

##### emptyDir

path
```
dropbox.emptyDir('/foo', function(err){});
```

##### mkdir

```
dropbox.mkdir('/foo', function(err){});
```

##### move

```
dropbox.move('/from', '/to' function(err){});
```

##### readdir

```
dropbox.readdir('/folder', function(err){});
```

##### readFile

```
dropbox.readFile('/file.txt', function(err){});
```

##### remove

```
dropbox.remove('/folder/or/file', function(err){});
```

##### stat

```
dropbox.mkdir('/foo', function(err){});
```

##### writeFile

Behaves like fs.writeFile.

```
dropbox.writeFile('/test.txt', 'Hello world', function(err){});
```

### Grievances

1. Client methods have unexpected side-effects

The Dropbox cli modifies the object passed to a method. When you pass in arg to a method like this:

```javascript
client.method(arg).then(..).catch(..);
```

Arg is set to undefined, so you cannot re-use it. I was reusing arg when retrying methods which result in retryable errors.

---

2. Promises

I wanted to implement some retry logic in my error handler, like I needed to do for this library. You might consider something like:

```
client.method(arg).then(function(){..}).catch(function(err){
  
  if (retry(err)) {
    ...

  } else {

    callback(err);
}

});
```

What do you expect to happen? You'll see the error and the process will die.
What actually happens? The error is swallowed silently.

3. Strange delays

There seems to be a strange issue with filesListFolder when after writing lots of files to the root directory calling filesListFolder doesn't seem to return. I need to implement some sort of timeout feature to make sure that the callback actually gets called. Otherwise it might choke up things....

https://www.dropboxforum.com/t5/API-Support-Feedback/Slow-response-from-list-folder/td-p/217063
