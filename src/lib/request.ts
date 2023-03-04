import type { HttpBackendOptions, RequestCallback } from 'i18next-http-backend';

export default function createFetchRequest(_fetch: typeof fetch): HttpBackendOptions['request'] {
  let omitFetchOptions = false;

  function fetchIt(url: string, options: RequestInit, callback: RequestCallback) {
    _fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          return callback(response.statusText || 'Error', {
            status: response.status,
            data: ''
          });
        }

        response
          .text()
          .then((data) => {
            callback(null, { status: response.status, data });
          })
          .catch((err) => callback(err, { status: 400, data: '' }));
      })
      .catch((err) => callback(err, { status: 400, data: '' }));
  }

  return (options, url, payload, callback) => {
    const headers = Object.assign(
      {},
      typeof options.customHeaders === 'function' ? options.customHeaders() : options.customHeaders
    );

    if (payload) headers['Content-Type'] = 'application/json';

    const reqOptions =
      typeof options.requestOptions === 'function'
        ? options.requestOptions(payload)
        : options.requestOptions;

    const fetchOptions = Object.assign(
      {
        method: payload ? 'POST' : 'GET',
        body: payload ? (options as any)?.['stringify']?.(payload) : undefined,
        headers
      },
      omitFetchOptions ? {} : reqOptions
    );

    try {
      fetchIt(url, fetchOptions, callback);
    } catch (e: any) {
      if (
        !reqOptions ||
        Object.keys(reqOptions).length === 0 ||
        !e.message ||
        e.message.indexOf('not implemented') < 0
      ) {
        return callback(e, { status: e.status ?? 400, data: '' });
      }
      try {
        Object.keys(reqOptions).forEach((opt) => {
          delete (fetchOptions as any)[opt];
        });

        fetchIt(url, fetchOptions, callback);
        omitFetchOptions = true;
      } catch (err: any) {
        return callback(err, { status: err.status ?? 400, data: '' });
      }
    }
  };
}
