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

const FirebaseMiddleware = require('./src/db');
Object.defineProperty(FirebaseMiddleware, "filestorage", { get: require('./src/filestorage') });

module.exports = FirebaseMiddleware;