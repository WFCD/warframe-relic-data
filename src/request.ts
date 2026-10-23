import Config from './Config';

/**
 * Fetch with an explicit user agent, warframe.market returns 403 with node's default.
 * @param {string} url URL to fetch
 * @returns {Promise<Response>} The response
 */
export function request(url: string): Promise<Response> {
  return fetch(url, { headers: { 'user-agent': Config.userAgent } });
}
