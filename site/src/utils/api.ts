import { HTTP, HTTPMethod, HTTPOptions } from './http'
import { LocalStorage } from './storage'

export class Api {
  static host = process.env.API_HOST
  static namespace = process.env.API_NAMESPACE

  static getHeaders = async () => {
    const locale = LocalStorage.get('locale')
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*',
      'domain': process.env.DOMAIN,
      'Accept-Language': locale ?? 'en-GB'
    }
  }

  static buildURL (path: string, opts?: { namespace: boolean }) {
    return [
      this.host,
      ...(opts?.namespace !== false && this.namespace ? [this.namespace] : []),
      path
    ].join('/').replace(/([^:]\/)\/+/g, '$1')
  }

  static async request (method: HTTPMethod, url: string, options: HTTPOptions = {}) {
    options.headers = { ...(await this.getHeaders()), ...options.headers }
    try {
      const res = await HTTP.request(method, url, options)
      return res
    } catch (err) {
      // if (err?.res?.status === 401) this.store.user.unauthenticate()
      throw err
    }
  }
}
