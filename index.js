/*
 * Iopa Database Firebase Middleware
 * Copyright (c) 2016 Internet of Protocols Alliance 
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

const firebase = require('firebase');

const EventEmitter = require('events');

firebase.initializeApp({
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  },
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

var root = process.env.FIREBASE_ROOT || "/";
var dbref = firebase.database().ref(root);

function FirebaseMiddleware(app) {

  if (app.properties["server.Capabilities"]["urn:io.iopa.database"])
    throw new Error("Database already registered for this app");

  this.app = app;


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
       subscribe: function (path) {

         var result = new EventEmitter();

         var itemRef = dbref.child(path);

          itemRef.on("value", function (snapshot) {
             var item = snapshot.val();
             if (!item.key)
                item.key = snapshot.key();
             result.emit("value", item);
           }, function (errorObject) {
            // ignore
           });
       },
       subscribechanges: function (path) {

         var result = new EventEmitter();

         var itemRef = dbref.child(path);

         itemRef.orderByChild('timestamp').startAt(Date.now()).on('child_added', function (snapshot) {
           if (!item.key)
             item.key = snapshot.key();
           var item = snapshot.val();
           result.emit("value", item);
         });

         itemRef.on('child_removed', function (snapshot) {
           var item = snapshot.val();
           if (!item.key)
             item.key = snapshot.key();
           result.emit("removed", item);
         });

         itemRef.on('child_updated', function (snapshot) {
           var item = snapshot.val();
           if (!item.key)
             item.key = snapshot.key();
           result.emit("updated", item);
         });
       }

   }
   app.properties["server.Capabilities"]["urn:io.iopa.database"]["iopa.Version"] = "1.4";

}

FirebaseMiddleware.prototype.invoke = function(context, next) {
   context.db = context.db || this.app.properties["server.Capabilities"]["urn:io.iopa.database"];
   return next();
}

module.exports = FirebaseMiddleware;