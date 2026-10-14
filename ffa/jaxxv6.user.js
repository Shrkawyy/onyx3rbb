// ==UserScript==
// @name         JaxxV6 for Senpa
// @namespace    https://github.com/Shrkawyy/t3st
// @version      6.1.12
// @description  Loads the JaxxV6 client on Senpa's official web origin.
// @author       Shrkawyy
// @match        https://senpa.io/web/*
// @match        https://www.senpa.io/web/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @connect      onyx-og.vercel.app
// @connect      shrkawyy.github.io
// @noframes
// @updateURL    https://onyx-og.vercel.app/ffa/jaxxv6.user.js
// @downloadURL  https://onyx-og.vercel.app/ffa/jaxxv6.user.js
// ==/UserScript==

(function () {
  'use strict';

  const DEFAULT_BASE_URL = 'https://onyx-og.vercel.app/ffa/';
  const CLIENT_FILE = 'client.html';
  const VERSION = '6.1.12';

  function normalizeBaseUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') return DEFAULT_BASE_URL;
      return url.href.endsWith('/') ? url.href : `${url.href}/`;
    } catch (_) {
      return DEFAULT_BASE_URL;
    }
  }

  function getBaseUrl() {
    const override = localStorage.getItem('jaxxv6:base-url');
    return normalizeBaseUrl(override || DEFAULT_BASE_URL);
  }

  function renderLoading() {
    const style = document.createElement('style');
    style.id = 'jaxxv6-loading-style';
    style.textContent = `
      html{background:#07090d!important}
      body{visibility:hidden!important}
      html::before{content:'Loading JaxxV6...';position:fixed;z-index:2147483647;inset:0;display:grid;place-items:center;background:#07090d;color:#dce7f4;font:16px system-ui,sans-serif;visibility:visible}
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function renderError(message) {
    window.stop();
    document.title = 'JaxxV6 load error';
    const head = document.createElement('head');
    const body = document.createElement('body');
    const style = document.createElement('style');
    const box = document.createElement('div');
    const title = document.createElement('h1');
    const detail = document.createElement('p');
    const help = document.createElement('p');
    const reload = document.createElement('button');

    style.textContent = 'html,body{height:100%;margin:0;background:#090b10;color:#e8eef6;font:16px system-ui,sans-serif}body{display:grid;place-items:center}.box{max-width:620px;padding:30px;border:1px solid #2a3645;border-radius:14px;background:#111721}h1{margin-top:0;color:#ff647c}button{padding:10px 16px;border:0;border-radius:8px;cursor:pointer}';
    box.className = 'box';
    title.textContent = 'JaxxV6 could not load';
    detail.textContent = String(message);
    help.textContent = 'Check that GitHub Pages is enabled for the t3st repository, then reload.';
    reload.textContent = 'Reload';
    reload.addEventListener('click', () => location.reload());
    box.append(title, detail, help, reload);
    head.appendChild(style);
    body.appendChild(box);
    document.documentElement.replaceChildren(head, body);
  }

  async function mountClient(source, baseUrl) {
    const parsed = new DOMParser().parseFromString(source, 'text/html');
    if (!parsed.head || !parsed.body) {
      throw new Error('client.html did not contain a complete HTML document.');
    }

    const scripts = Array.from(parsed.querySelectorAll('script'), (node) => ({
      attributes: Array.from(node.attributes, (attribute) => [attribute.name, attribute.value]),
      source: node.getAttribute('src'),
      text: node.textContent || ''
    }));
    parsed.querySelectorAll('script').forEach((node) => node.remove());

    const assetOrigin = new URL(baseUrl).origin;
    parsed.querySelectorAll('link[rel="stylesheet"][href]').forEach((node) => {
      const stylesheetUrl = new URL(node.getAttribute('href'), baseUrl);
      if (stylesheetUrl.origin === assetOrigin) {
        stylesheetUrl.searchParams.set('v', VERSION);
        node.setAttribute('href', stylesheetUrl.href);
      }
    });

    window.stop();
    const newHead = document.importNode(parsed.head, true);
    const newBody = document.importNode(parsed.body, true);
    const base = document.createElement('base');
    base.href = baseUrl;
    newHead.prepend(base);
    document.documentElement.lang = parsed.documentElement.lang || 'en';
    document.documentElement.replaceChildren(newHead, newBody);

    const bootstrap = document.createElement('script');
    bootstrap.textContent = `window.__JAXXV6_BASE_URL=${JSON.stringify(baseUrl)};window.__JAXXV6_USERSCRIPT__=true;`;
    document.head.appendChild(bootstrap);

    for (const descriptor of scripts) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        for (const [name, value] of descriptor.attributes) {
          if (name !== 'src' && name !== 'async' && name !== 'defer') script.setAttribute(name, value);
        }
        if (descriptor.source) {
          const assetUrl = new URL(descriptor.source, baseUrl);
          assetUrl.searchParams.set('v', VERSION);
          script.async = false;
          script.src = assetUrl.href;
          script.addEventListener('load', resolve, { once: true });
          script.addEventListener('error', () => reject(new Error(`Failed to load ${descriptor.source}`)), { once: true });
        } else {
          script.textContent = descriptor.text;
        }
        document.body.appendChild(script);
        if (!descriptor.source) resolve();
      });
    }
  }

  const baseUrl = getBaseUrl();
  renderLoading();

  GM_xmlhttpRequest({
    method: 'GET',
    url: `${baseUrl}${CLIENT_FILE}?v=${encodeURIComponent(VERSION)}`,
    timeout: 15000,
    headers: { 'Cache-Control': 'no-cache' },
    async onload(response) {
      if (response.status < 200 || response.status >= 300) {
        renderError(`GitHub Pages returned HTTP ${response.status} for ${CLIENT_FILE}.`);
        return;
      }
      try {
        await mountClient(response.responseText, baseUrl);
      } catch (error) {
        renderError(error && error.message ? error.message : error);
      }
    },
    ontimeout() {
      renderError('The GitHub Pages request timed out.');
    },
    onerror() {
      renderError('The GitHub Pages request failed.');
    }
  });
})();
