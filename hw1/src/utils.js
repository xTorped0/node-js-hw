export const REASON = { 200: 'OK', 404: 'Not Found' };

export function parseRequest(buf) {
  const headerEnd = buf.indexOf('\r\n\r\n');
  if (headerEnd === -1) return null;

  const [requestLine, ...headerLines] = buf.slice(0, headerEnd).split('\r\n');
  const [method, path, httpVersion = 'HTTP/1.1'] = requestLine.split(' ');
  const headers = Object.fromEntries(
    headerLines
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        const key = line.slice(0, separatorIndex).trim().toLowerCase();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, value];
      }),
  );

  return { method, path, httpVersion, headers };
}

export function handleRequest(req) {
  const { path } = req;

  if (path === '/') {
    return {
      statusCode: 200,
      type: 'text/plain; charset=utf-8',
      body: 'сирий net — привіт\n',
    };
  }

  if (path === '/headers') {
    const dump = Object.entries(req.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return {
      statusCode: 200,
      type: 'text/plain; charset=utf-8',
      body: `${dump}\n`,
    };
  }

  return {
    statusCode: 404,
    type: 'text/plain; charset=utf-8',
    body: 'Not Found\n',
  };
}

export function serialize({ statusCode, type, body }, { keepAlive = false } = {}) {
  return (
    `HTTP/1.1 ${statusCode} ${REASON[statusCode] ?? 'Unknown'}\r\n` +
    `Content-Type: ${type}\r\n` +
    `Content-Length: ${Buffer.byteLength(body)}\r\n` +
    `Connection: ${keepAlive ? 'keep-alive' : 'close'}\r\n` +
    '\r\n' +
    body
  );
}