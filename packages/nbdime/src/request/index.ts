// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  JSONObject
} from '@phosphor/coreutils';

import {
  URLExt, PageConfig
} from '@jupyterlab/coreutils';


function urlRStrip(target: string): string {
  if (target.slice(-1) === '/') {
    return target.slice(0, -1);
  }
  return target;
}

/**
 * Get a cookie from the document.
 */
function getCookie(name: string) {
  // from tornado docs: http://www.tornadoweb.org/en/stable/guide/security.html
  let r = document.cookie.match('\\b' + name + '=([^;]*)\\b');
  return r ? r[1] : void 0;
}

function getToken(): string | null {
  let jlToken = PageConfig.getOption('token');
  return jlToken;
}

function createAuthorizedRequest(url: string, init: RequestInit): Request {
  let request = new Request(url, init);
  let token = getToken();
  if (token) {
    request.headers.append('Authorization', `token ${token}`);
  } else if (typeof document !== 'undefined' && document.cookie) {
    let xsrfToken = getCookie('_xsrf');
    if (xsrfToken !== void 0) {
      request.headers.append('X-XSRFToken', xsrfToken);
    }
  }
  return request;
}

/**
 * Make a POST request passing a JSON argument and receiving a JSON result.
 */
export
function requestJsonPromise(url: string, argument: any): Promise<JSONObject> {
  let request = createAuthorizedRequest(url, {
    method: 'POST',
    body: JSON.stringify(argument),
    credentials: 'same-origin',
    cache: 'no-cache',
  });
  return fetch(request).then((response) => {
      if (!response.ok) {
        throw new Error(`Invalid response: ${response.status} ${response.statusText}`)
      }
      return response.json();
    });
}

/**
 * Make a POST request passing a JSON argument and receiving a JSON result.
 */
export
function requestJson(url: string, argument: any, callback: (result: any) => void, onError: (result: any) => void): void {
  let promise = requestJsonPromise(url, argument);
  promise.then((data) => {
    callback(data);
  }, (error: Error) => {
    onError(error.message);
  });
}

/**
 * Make a diff request for the given base/remote specifiers (filenames)
 */
export
function requestDiffPromise(
    base: string, remote: string | undefined,
    baseUrl: string): Promise<JSONObject> {
  return requestJsonPromise(URLExt.join(urlRStrip(baseUrl), 'api/diff'),
                            {base, remote});
}

/**
 * Make a diff request for the given base/remote specifiers (filenames)
 */
export
function requestDiff(
    base: string, remote: string | undefined,
    baseUrl: string,
    onComplete: (result: any) => void,
    onFail: (result: any) => void): void {
  requestJson(URLExt.join(urlRStrip(baseUrl), 'api/diff'),
              {base, remote},
              onComplete,
              onFail);
}


/**
 * Make a diff request for the given base/remote specifiers (filenames)
 */
export
function requestMergePrmise(
    base: string, local: string, remote: string,
    baseUrl: string): Promise<JSONObject> {
  return requestJsonPromise(URLExt.join(urlRStrip(baseUrl), 'api/merge'),
              {base, local, remote});
}


/**
 * Make a diff request for the given base/remote specifiers (filenames)
 */
export
function requestMerge(
    base: string, local: string, remote: string,
    baseUrl: string,
    onComplete: (result: any) => void,
    onFail: (result: any) => void): void {
  requestJson(URLExt.join(urlRStrip(baseUrl), 'api/merge'),
              {base, local, remote},
              onComplete,
              onFail);
}
