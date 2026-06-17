/**
 * db.js — PSF.Manager IndexedDB Wrapper
 * ======================================
 * Persistent storage for clients, alerts, and settings.
 * Uses IndexedDB for deep persistence (survives cache clears).
 */
(function (window) {
  'use strict';
  var DB_NAME = 'psf_manager';
  var DB_VERSION = 1;
  var db = null;

  function open() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var d = e.target.result;
        if (!d.objectStoreNames.contains('clients')) {
          d.createObjectStore('clients', { keyPath: 'id' });
        }
        if (!d.objectStoreNames.contains('alerts')) {
          d.createObjectStore('alerts', { keyPath: 'id' });
        }
        if (!d.objectStoreNames.contains('settings')) {
          d.createObjectStore('settings', { keyPath: 'key' });
        }
      };
      req.onsuccess = function (e) { db = e.target.result; resolve(db); };
      req.onerror = function (e) { reject(e.target.error); };
    });
  }

  function tx(store, mode) {
    return db.transaction(store, mode).objectStore(store);
  }

  // CLIENTS
  function getAllClients() {
    return new Promise(function (resolve, reject) {
      var r = tx('clients', 'readonly').getAll();
      r.onsuccess = function () { resolve(r.result || []); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function putClient(client) {
    return new Promise(function (resolve, reject) {
      var r = tx('clients', 'readwrite').put(client);
      r.onsuccess = function () { resolve(client); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function deleteClient(id) {
    return new Promise(function (resolve, reject) {
      var r = tx('clients', 'readwrite').delete(id);
      r.onsuccess = function () { resolve(true); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function clearClients() {
    return new Promise(function (resolve, reject) {
      var r = tx('clients', 'readwrite').clear();
      r.onsuccess = function () { resolve(true); };
      r.onerror = function () { reject(r.error); };
    });
  }

  // ALERTS (parsed alert history)
  function addAlert(alert) {
    return new Promise(function (resolve, reject) {
      var r = tx('alerts', 'readwrite').put(alert);
      r.onsuccess = function () { resolve(alert); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function getAllAlerts() {
    return new Promise(function (resolve, reject) {
      var r = tx('alerts', 'readonly').getAll();
      r.onsuccess = function () { resolve(r.result || []); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function clearAlerts() {
    return new Promise(function (resolve, reject) {
      var r = tx('alerts', 'readwrite').clear();
      r.onsuccess = function () { resolve(true); };
      r.onerror = function () { reject(r.error); };
    });
  }

  // SETTINGS
  function getSetting(key) {
    return new Promise(function (resolve, reject) {
      var r = tx('settings', 'readonly').get(key);
      r.onsuccess = function () { resolve(r.result ? r.result.value : null); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function setSetting(key, value) {
    return new Promise(function (resolve, reject) {
      var r = tx('settings', 'readwrite').put({ key: key, value: value });
      r.onsuccess = function () { resolve(true); };
      r.onerror = function () { reject(r.error); };
    });
  }

  // EXPORT ALL (includes settings)
  function exportAll() {
    return Promise.all([getAllClients(), getAllAlerts(), getSetting('settings')]).then(function (results) {
      return { clients: results[0], alerts: results[1], settings: results[2], exportDate: new Date().toISOString(), version: DB_VERSION };
    });
  }

  // IMPORT ALL — uses a single readwrite transaction across both stores
  // so clear+insert is atomic. If any write fails, the entire transaction
  // rolls back and the user's original data is preserved.
  function importAll(data) {
    return new Promise(function (resolve, reject) {
      if (!db) { reject(new Error('DB not open')); return; }
      var tx = db.transaction(['clients', 'alerts'], 'readwrite');
      var clientStore = tx.objectStore('clients');
      var alertStore = tx.objectStore('alerts');

      // Clear both stores
      clientStore.clear();
      alertStore.clear();

      // Add all new data
      if (data.clients) {
        data.clients.forEach(function (c) { clientStore.put(c); });
      }
      if (data.alerts) {
        data.alerts.forEach(function (a) { alertStore.put(a); });
      }

      tx.oncomplete = function () {
        // Also import settings if present
        if (data.settings) {
          setSetting('settings', data.settings).then(function () { resolve(true); }).catch(function () { resolve(true); });
        } else {
          resolve(true);
        }
      };
      tx.onerror = function () { reject(tx.error); };
      tx.onabort = function () { reject(tx.error || new Error('Import aborted')); };
    });
  }

  window.PSFDB = {
    open: open,
    getAllClients: getAllClients,
    putClient: putClient,
    deleteClient: deleteClient,
    clearClients: clearClients,
    addAlert: addAlert,
    getAllAlerts: getAllAlerts,
    clearAlerts: clearAlerts,
    getSetting: getSetting,
    setSetting: setSetting,
    exportAll: exportAll,
    importAll: importAll
  };
})(window);
