/*
 * Iopa Database Firebase Storage Middleware
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
require("firebase/storage");

function FirebaseStorageMiddleware(app) {

    var root = process.env.FIREBASE_ROOT || "/";

    var storageRef = firebase.storage().ref(root);

    app.properties["server.Capabilities"]["urn:io.iopa.filestorage"] = {
        put: function (path, file, metadata) {
            return new Promise(function (resolve, reject) {
                storageRef.child(path).put(file, metadata).then(function (snapshot) {
                    resolve(snapshot.downloadURL)
                }).catch(function (err) {
                    reject(err);
                });
            });
        },
        get: function (path) {
            return storageRef.child(path)
                .getDownloadURL()
                .then(function (url) {
                    return Promise.resolve(url.toString())
                }, function (err) {
                    return Promise.resolve(null);
                })

        },
        delete: function (ref) {
            if (ref)
                return new Promise(function (resolve, reject) {
                    storageRef.child(ref).delete().then(function () {
                        resolve()
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            else return Promise.resolve(null);

        },
    }

    app.properties["server.Capabilities"]["urn:io.iopa.filestorage"]["iopa.Version"] = "1.4";

}

module.exports = FirebaseStorageMiddleware;