import mongoose from "mongoose";
import setupDbEvents from "./setupDbEvents.js";
import { serverEmitter, databaseEmitter } from "../customEvent/index.js";

var kmsProviders = { local: { key: process.env.MONGO_LOCAL_MASTER_KEY } };
var extraOptions = { cryptSharedLibPath: process.env.MONGO_CRYPT_SHARED_PATH, cryptSharedLibRequired: true };

var autoEncryption = { kmsProviders, extraOptions, keyVaultNamespace: process.env.KEY_VAULT_NAME_SPACE, bypassAutoEncryption: true };
var options = { autoEncryption, connectTimeoutMS: 5000, ...JSON.parse(process.env.MONGO_AUTH_OPTIONS) };

var dbClient = mongoose.connection;

var killAllSessions = async () => await dbClient.db.command({ killAllSessions: [] }).then(() => console.log("old sessions killed"));

var runDB = async () => {
  try {
    setupDbEvents(mongoose);

    await mongoose.connect(process.env.MONGO_URI, options);

    await killAllSessions();
    console.info("---------- DB CONNECTED ----------\n");

    serverEmitter.emit("start");
  } catch (e) {
    console.log(e.message.toUpperCase());

    serverEmitter.emit("close");
    databaseEmitter.emit("connection_error");
  }
};

export { runDB, dbClient };
