import uuidv4 from 'uuid-v4'
import { renderPlace, renderAdded } from './renderer'


const sessionCreate = async (api) => {
  let uid = uuidv4()
  uid = uid.replace(/-/g, '')
  const response = await api.post({ action: 'session_create', uid })
  window.sessionUID = response.content.session.id
  window.localStorage.setItem('SESSION_ID', window.sessionUID)
}

export const checkTheBasket = async (ctx) => {
  const { api } = store.getState()
  if (window.sessionUID === undefined || window.sessionUID === null || window.sessionUID === false) {
    sessionCreate(api)
  } else {
    const getBasketResponse = await api.post({ action: 'basket_get' })
    if (getBasketResponse.content !== null && getBasketResponse.result.code === 1) {
      // console.log(getBasketResponse)
      if (getBasketResponse.content.places.place[0].event_id === window.eventID) {
        const places = getBasketResponse.content.places.place.map(val => ({ ...val, id: val.id.toString() }))
        delete getBasketResponse.content.places.place
        store.dispatch({ ...store.getState(), basket: { ...getBasketResponse.content.places, places }})
        appendToBasket()
        renderBasketPlaces(ctx)
      }
      else {
        api.post({ action: 'basket_clear' })
          .then(response => store.getState().basket = { places: [] })
          .catch(e => console.log('Something goes wrong while clearing the basket'))
      }
    }
    else {
      store.getState().basket = { places: [] }
      appendToBasket()
    }
  }
}

export const getBasketPlaces = async (ctx) => {
  const { api } = store.getState()
  const getBasketResponse = await api.post({ action: 'basket_get' })
  if (getBasketResponse.content !== null && getBasketResponse.result.code === 1) {
    // console.log(getBasketResponse)
    if (getBasketResponse.content.places.place[0].event_id === parseInt(window.eventID)) {
      const places = getBasketResponse.content.places.place.map(val => ({ ...val, id: val.id.toString() }))
      delete getBasketResponse.content.places.place
      store.dispatch({ ...store.getState(), basket: { ...getBasketResponse.content.places, places }})
      appendToBasket()
      renderBasketPlaces(ctx)
      return true
    }
    else {
      await api.post({ action: 'basket_clear' })
        .then(response => store.getState().basket = { places: [] })
        .catch(e => console.log('Something goes wrong while clearing the basket'))
      
      appendToBasket()
      renderBasketPlaces(ctx)
      return false
    }
  }
}

export const appendToBasket = () => {
  const amount = store.getState().basket.places.reduce((accumulator, place) => {
    accumulator += parseInt(place.price)
    return accumulator
  }, 0)
  store.getState().basket.total = amount
  const rest = (store.getState().basket.places.length > 9) ? store.getState().basket.places.length % 10 : store.getState().basket.places.length
  document.getElementById('places-count').innerHTML = `${store.getState().basket.places.length} ${window.restsDescriptions[rest]}`
  if (amount === 0) {
    document.getElementById('make-order').setAttribute('disabled', true)
  }
  else {
    document.getElementById('make-order').removeAttribute('disabled')
  }
  document.getElementById('amount').innerHTML = amount.toString()
  
}

export const basketClear = (ctx) => {
  const { correlation } = store.getState().scaledStage
  const { api, places } = store.getState()
  api.post({ action: 'basket_clear' }).then((response) => {
    store.getState().basket.places.forEach((val) => {
      let key = false
      const place = _.find(store.getState().places, (v, k) => {
        if (v.id === val.id) {
          key = k
        }
      })
      store.getState().places[key].status = '10'
      renderPlace(ctx, places[key])
    })
    store.getState().basket.places = []
    appendToBasket()
  }).catch(e => console.log(e))
}

export const renderBasketPlaces = (ctx) => {
  const { correlation } = store.getState().scaledStage
  const { api, places } = store.getState()
  store.getState().basket.places.forEach((value) => {
    const place = _.find(store.getState().places, v => v.id === value.id)
    renderAdded(place.x, place.y, ctx, place)
  })
}