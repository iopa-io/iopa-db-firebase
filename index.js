/*
 * Iopa Database Firebase Middleware
 * Copyright (c) 2017 Internet of Protocols Alliance 
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

var EventEmitter;
var FIREBASE_INITIALIZED = false

function FirebaseMiddleware(app) {

  if (process.env.BROWSER) {
    EventEmitter = function () { throw Error("Not implemented in browser") };
  } else {
    EventEmitter = require('events');
  }

  this.app = app;

  if (!FIREBASE_INITIALIZED) {

    if (process.env.BROWSER) {
      firebase.initializeApp({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
      });

      firebase.auth().onAuthStateChanged(user => {
        console.log("onAuthStateChanged", user);
        if (user === null) {
          firebase.auth().signInAnonymously().then((result) => {
            console.log("signInAnonymously", result);

          }).catch(error => {
            console.log("signInAnonymously", "error", error);
          });
        }
      });
    } else {
      firebase.initializeApp({
        serviceAccount: {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        },
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    }

    FIREBASE_INITIALIZED = true;

  }

  var root = process.env.FIREBASE_ROOT || "/";
  var dbref = firebase.database().ref(root);

  this.dbref = dbref;

  app.properties["server.Capabilities"]["urn:io.iopa.database"] = {

    get: function (path) {
      return new Promise(function (resolve, reject) {
        var itemRef = dbref.child(path);

        itemRef.once("value", function (snapshot) {
          var item = snapshot.val();
          resolve(item);
          itemRef = null;
        }, function (errorObject) {
          reject(errorObject.code);
        });
      });
    },
    push: function (path, blob) {
      var itemRef = dbref.child(path).push();
      blob.timestamp = firebase.database.ServerValue.TIMESTAMP;
      itemRef.set(blob);
      itemRef = null;
    },
    put: function (path, blob) {
      var itemRef = dbref.child(path);
      if (blob)
        blob.timestamp = firebase.database.ServerValue.TIMESTAMP;
      itemRef.set(blob);
    },
    subscribe: function (path, callback) {

      var result;

      if (!callback) {
        result = new EventEmitter();
        callback = (result.emit.bind(this, "value"));
      }

      var itemRef = dbref.child(path);

      itemRef.on("value", function (snapshot) {
        var item = snapshot.val();
        if (!item.key)
          item.key = snapshot.key();
        callback(item);
      }, function (errorObject) {
        // ignore
      });

      return result;
    },
    subscribechanges: function (path, store) {

      var dbadd, dbremove, dbupdate, result;

      if (store) {
        dbadd = store.dbadd.bind(this);
        dbremove = store.dbremove.bind(this);
        dbupdate = store.dbupdate.bind(this);
      } else {
        result = new EventEmitter();
        dbadd = result.emit.bind(this, "value");
        dbremove = result.emit.bind(this, "removed");
        dbupdate = result.emit.bind(this, "updated");
      }

      var itemRef = dbref.child(path);

      itemRef.orderByChild('timestamp').startAt(Date.now()).on('child_added', function (snapshot) {
        if (!item.key)
          item.key = snapshot.key();
        var item = snapshot.val();
        store.dbadd(item);
      });

      itemRef.on('child_removed', function (snapshot) {
        var item = snapshot.val();
        if (!item.key)
          item.key = snapshot.key();
        store.dbremove(item);
      });

      itemRef.on('child_updated', function (snapshot) {
        var item = snapshot.val();
        if (!item.key)
          item.key = snapshot.key();
        store.dbupdate(item);
      });

      return result;
    }
  }
  app.properties["server.Capabilities"]["urn:io.iopa.database"]["iopa.Version"] = "1.4";

}

FirebaseMiddleware.prototype.invoke = function (context, next) {
  context.db = context.db || this.app.properties["server.Capabilities"]["urn:io.iopa.database"];
  return next();
}

module.exports = FirebaseMiddleware;