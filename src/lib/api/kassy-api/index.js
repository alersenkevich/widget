import md5 from 'md5'
import fetch from 'isomorphic-fetch'
import apiConfig from './config'


class KassyApi {
  constructor(initialConfig) {
    this.config = { ...initialConfig  }
  }

  async request(url, config) {
    const xml = this.composeXML(config)
    const sign = md5(xml + config.secret_key)
    //console.log(xml)
    try {
      const response = await fetch(url, {
        method: config.method,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded;multipart/form-data; charset=UTF-8',
          'Accept-Encoding': 'gzip,deflate',
        },
        body: `xml=${xml}&sign=${sign}`,
      })
      // console.log(await response.text())
      return await response.json()
    }
    catch (error) {
      console.log(`Ошибка запроса к апи\n\n${error}`)
    }
  }

  get(url, config) {
    return this.request(this.config.url, { ...config, method: 'GET' })
  }

  post(config) {
    return this.request(this.config.url, { ...config, ...this.config, method: 'POST' })
  }

  patch(url, config) {
    return this.request(this.config.url, { ...config, method: 'PATCH' })
  }

  put(url, config) {
    return this.request(this.config.url, { ...config, method: 'PUT' })
  }

  delete(url, config) {
    return this.request(this.config.url, { ...config, method: 'DELETE' })
  }

  composeXML(config) { // eslint-disable-line class-methods-use-this
    if (config.action === 'subdivision') {
      let filter = false
      if (config.regionDB) filter = `<filter id="" db="${config.regionDB}" state="" />`
      return (`<?xml version="1.0" encoding="utf-8"?>
      <request db="${config.db || ''}" module="${config.action}" format="json">
        ${(filter) || ''}
          <auth id="${config.agent_id}" />
      </request>`)
    }
    else if (config.action === 'table_atlas_salepoint') {
      return (`<?xml version="1.0" encoding="utf-8"?>
      <request db="${config.region.db}" module="${config.action}" format="json">
        <auth id="${config.agent_id}" />
      </request>
      `)
    }
    else if (config.action === 'page_event_hall') {
      const filter = `<filter id="${config.id}" section_id="" />`
      return (`<?xml version="1.0" encoding="utf-8"?>
        <request db="${config.db}" module="${config.action}" format="json">
          ${filter}
          <auth id="${config.agent_id}" />
        </request>
      `)
    }
    else if (config.action === 'session_create') {
      return (`<?xml version="1.0" encoding="utf-8"?>
        <request db="${config.db}" module="session_create" format="json">
            <session id="${config.uid}" />
            <auth id="${config.agent_id}" />
        </request>
      `)
    }
    else if (config.action === 'basket_add') {
      return (`<?xml version="1.0" encoding="utf-8"?>
      <request db="${config.db}" module="basket_add" format="json">
          <filter packet="full" />
          <param session_id="${window.sessionUID}" />
          <places>
              <place id="${config.placeID}" />
          </places>
          <auth id="${config.agent_id}" />
      </request>
      `)
    }
    else if (config.action === 'basket_delete') {
      return (`<?xml version="1.0" encoding="utf-8"?>
      <request db="${config.db}" module="basket_delete" format="json">
          <filter packet="full" />
          <param session_id="${window.sessionUID}" />
          <places>
              <place id="${config.placeID}" />
          </places>
          <auth id="${config.agent_id}" />
      </request>
      `)
    }
    else if (config.action === 'basket_clear') {
      return (`<?xml version="1.0" encoding="utf-8"?>
      <request db="${config.db}" module="basket_clear" format="json">
          <param session_id="${window.sessionUID}" />
          <auth id="${config.agent_id}" />
      </request>
      `)
    }
    else if (config.action === 'basket_get') {
      return (`<?xml version="1.0" encoding="utf-8"?>
      <request db="ekb" module="basket_get" format="json">
          <param session_id="${window.sessionUID}" />
          <auth id="${config.agent_id}" />
      </request>
      `)
    }
    else if (config.action === 'basket_delete') {
      return (`<?xml version="1.0" encoding="utf-8"?>
      <request db="test" module="basket_delete" format="xml">
          <filter packet="full" />
          <param session_id="${window.sessionUID}" />
          <places>
              <place id="${config.placeID}" />
          </places>
          <auth id="${config.agent_id}" />
      </request>
      `)
    }
    return ''
  }
}

export default new KassyApi(apiConfig)
