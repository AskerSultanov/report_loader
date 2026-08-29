import { serverEmitter, databaseEmitter } from "../customEvent/index.js";

var timerId = null;
var eventsConfigured = false;
var dbReconnectionAttempts = 1;
var NEXT_CONNECTION_MS = 2_000;
var dbConnectionRestored = false;

var kmsProviders = { local: { key: process.env.MONGO_LOCAL_MASTER_KEY } };
var extraOptions = { cryptSharedLibPath: process.env.MONGO_CRYPT_SHARED_PATH, cryptSharedLibRequired: true };

var autoEncryption = { kmsProviders, extraOptions, keyVaultNamespace: process.env.KEY_VAULT_NAME_SPACE, bypassAutoEncryption: true };
var options = { autoEncryption, connectTimeoutMS: 5000, ...JSON.parse(process.env.MONGO_AUTH_OPTIONS) };

var setupDbEvents = async (dbInstance) => {
  if (eventsConfigured) {
    return;
  }

  eventsConfigured = true;

  dbInstance.connection.on("error", (e) => {
    dbInstance.disconnect();
  });

  dbInstance.connection.on("disconnected", async (e) => {
    console.log("mongoose disconnected");
    if (!timerId) {
      serverEmitter.emit("close");

      timerId = setInterval(async () => {
        console.log({ dbReconnectionAttempts });

        dbReconnectionAttempts++;

        await dbInstance.connect(process.env.MONGO_URI, options);
      }, NEXT_CONNECTION_MS);
    }
  });

  dbInstance.connection.on("connected", async () => {
    console.log("connection to db...");

    if (timerId) {
      dbReconnectionAttempts = 0;
      dbConnectionRestored = true;

      clearTimeout(timerId);
      timerId = null;
      console.log("mongoose reconnected");
    }

    if (!dbConnectionRestored) {
      console.log("mongoose connected\n");
    }
  });

  databaseEmitter.on("connection_error", async () => {
    console.log("databaseEmitterError");
    serverEmitter.emit("close");

    if (!timerId) {
      timerId = setInterval(async () => {
        console.log({ dbReconnectionAttempts });
        dbReconnectionAttempts++;

        await dbInstance.connect(process.env.MONGO_URI, options);
      }, NEXT_CONNECTION_MS);
    }
  });
};

export default setupDbEvents;
