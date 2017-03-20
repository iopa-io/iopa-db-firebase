# [![IOPA](http://iopa.io/iopa.png)](http://iopa.io)<br> iopa-db-firebase

[![NPM](https://img.shields.io/badge/iopa-certified-99cc33.svg?style=flat-square)](http://iopa.io/)
[![NPM](https://img.shields.io/badge/iopa-bot%20framework-F67482.svg?style=flat-square)](http://iopa.io/)
[![NPM](https://img.shields.io/badge/firebase-SDK%20v3.X-3C9DE1.svg?style=flat-square)](http://iopa.io/)

[![NPM](https://nodei.co/npm/iopa-db-firebase.png?downloads=true)](https://nodei.co/npm/iopa-db-firebase/)

## About

This repository contains helper middleware functions for reading and writing to firebase

## Using

``` bash
npm install iopa-db-firebase --save
```

### Server
``` js
var DBMiddleware = require('iopa-db-firebase');

// SET THE FOLLOWING IN ENVIRONMENT VARIABLES INSTEAD!
process.env.FIREBASE_CLIENT_EMAIL = "xxxx@xxxx-xxx.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PR...";
process.env.FIREBASE_DATABASE_URL = "https://xxxxx-xxxx.firebaseio.com";
process.env.FIREBASE_ROOT = "/";

// Use the DBMiddleWare adds a .db object to every context record for remainder of chain
app.use(require(DBMiddleware));
app.use(require(DBMiddleware.filestorage));  // optional
```

``` js
function(context, next){

    context.db.put("/demo/item", {
        id: "1234",
        name: "demo"
    });

    context.db.get("/demo/item")
    .then(function(item){
            context.log(item.timestamp);
    });

    context.db.put("/demo/item", null);

    context.db.subscribe("/demo")
    .on("value", function(item){
         context.log(item.key);
    });

}
```

### Browser
``` js
var DBMiddleware = require('iopa-db-firebase');

// SET THE FOLLOWING IN ENVIRONMENT VARIABLES INSTEAD!
  process.env.BROWSER = true
  process.env.FIREBASE_API_KEY" = "THISISMYPRIVATETOKEN"
  process.env.FIREBASE_AUTH_DOMAIN" = "xxxxxx.firebaseapp.com"
  process.env.FIREBASE_DATABASE_URL" ="https://xxxxx.firebaseio.com"
  process.env.FIREBASE_STORAGE_BUCKET" = "xxxxx.appspot.com"
  process.env.FIREBASE_MESSAGING_SENDER_ID = "nnnnnnnnnn"
  process.env.FIREBASE_ROOT": "/"


// Use the DBMiddleWare adds a .db object to every context record for remainder of chain
app.use(require(DBMiddleware));
```

``` js
function(context, next){

    context.db.put("/demo/item", {
        id: "1234",
        name: "demo"
    });

    context.db.get("/demo/item")
    .then(function(item){
            context.log(item.timestamp);
    });

    context.db.put("/demo/item", null);

    context.db.subscribe("/demo", function(item){
         context.log(item.key);
    });

}
```

## License

Apache-2.0

## API Reference Specification

[![IOPA](http://iopa.io/iopa.png)](http://iopa.io)
 