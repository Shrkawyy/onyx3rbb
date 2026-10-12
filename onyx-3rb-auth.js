/* 3rb session bridge: reads only a session supplied by the official client; never creates or bypasses tokens. */
(function (global) {
  'use strict';
  function getSession() { try { return localStorage.getItem('3rbio:session') || localStorage.getItem('session') || ''; } catch (_) { return ''; } }
  global.ONYXAuth = { provider: '3rb', getToken: getSession, getSenpaToken: getSession, get3rbToken: getSession };
})(typeof window !== 'undefined' ? window : globalThis);
