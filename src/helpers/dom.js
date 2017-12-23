import moment from 'moment'
import { getInitialSets, /*alignViewport*/ } from './calculating'
import { alignViewport, applySmallViewport as applyDragWindow } from './computings'
import { getBasketPlaces, appendToBasket } from './basket'
import { renderPlace } from './renderer'


export const DOMResize = () => {
  const sets = getInitialSets(store.state.places)
  alignViewport()
  store.dispatch({ ...store.state, ...sets })
  // console.log(store.state)
  const { viewport, wholeStage } = store.getState()
  const stageViewport = document.getElementById('large-stage-viewport')
  stageViewport.style.display = 'block'
  stageViewport.style.width = viewport.width
  stageViewport.style.height = viewport.height

  const firstIMG = document.getElementById('first-img')
  firstIMG.style.height = wholeStage.height - 40
  firstIMG.style.width = wholeStage.width - 40
  firstIMG.style.marginLeft = 20 + ((viewport.width - wholeStage.width) / 2)
  firstIMG.style.marginTop = 20 + ((viewport.height - wholeStage.height) / 2)

}


export const showMinimap = () => {
  const { minimap } = store.state
  const { correlation } = minimap
  const img = document.getElementById('mapImg')
  img.style.width = minimap.image.width
  img.style.height = minimap.image.height
  const mapParent = document.getElementById('map-parent')
  mapParent.style.display = 'block'
  // mapParent.style.padding = `${minimap.drag.height/2} ${minimap.drag.width/2}`
  const minimapDOM = document.getElementById('mapContainer')
  minimapDOM.style.display = 'block'
  minimapDOM.style.paddingTop = minimap.paddingTop
  minimapDOM.style.paddingLeft = minimap.paddingLeft
  minimapDOM.style.paddingRight = minimap.paddingRight
  minimapDOM.style.paddingBottom = minimap.paddingBottom
  minimapDOM.style.height = minimap.container.height
  minimapDOM.style.width = minimap.container.width
  const minimapCorrelated = {
    width: minimap.container.width * correlation,
    height: minimap.container.height * correlation,
  }

  const miniViewport = document.getElementById('drag')
  miniViewport.style.width = minimap.drag.width - minimapCorrelated.width
  miniViewport.style.height = minimap.drag.height // - minimapCorrelated.height


}

export const determineHeader = () => {
  const { info } = store.getState()
  const header = document.getElementById('show-title')
  const data = document.getElementById('show-data')
  const formatted = moment.unix(info.event[0].date).format('YYYY-MM-DD HH:mm')
  const datetime = new Date(formatted).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  header.innerHTML = info.show[0].title
  data.innerHTML = `${info.building[0].title},&nbsp;&nbsp;${info.hall[0].title},&nbsp;&nbsp;${datetime}`
  document.getElementById('rating').innerHTML = info.show[0].rating + '+'
}

export const applyDOM = (canvas) => {
  const { scaledStage, viewport, wholeStage } = store.getState()
  const stageViewport = document.getElementById('large-stage-viewport')
  stageViewport.style.display = 'block'
  stageViewport.style.width = viewport.width
  stageViewport.style.height = viewport.height

  const infoContainer = document.getElementById('info-container')
  infoContainer.style.height = window.innerHeight - 100

  const largeStageContainer = document.getElementById('large-stage-container')

  window.img = canvas.toDataURL('image/png')
  document.getElementById('mapImg').src = img
  const firstIMG = document.getElementById('first-img')
  firstIMG.src = window.img
  firstIMG.style.height = wholeStage.height
  firstIMG.style.width = wholeStage.width
  firstIMG.style.marginLeft = (viewport.width - wholeStage.width) / 2
  firstIMG.style.marginTop = (viewport.height - wholeStage.height) / 2

  implementPricesToDOM()
  determineHeader()
  document.body.style.display = 'block'
}

export const implementPricesToDOM = () => {
  const { prices } = window
  const keys = Object.keys(prices)
  const legend = document.getElementById('prices-legend')

  keys.forEach((v) => {
    legend.innerHTML += `
    <div class="legend-field">
      <div class="color-block" style="background:#${prices[v]}"></div>
      <div class="color-price">${parseInt(v)} руб.</div>
    </div>
    `
  })
}

export const applyInitialSets = (width, height) => {
  const largeCanvasElement = document.getElementById('large-stage-canvas')
  largeCanvasElement.setAttribute('width', width)
  largeCanvasElement.setAttribute('height', height)
  largeCanvasElement.style.verticalAlign = 'top'
}

export const showRules = (event) => {
  event.preventDefault()
  document.getElementById('back-fon').style.display = 'block'
  document.getElementById('popup').style.display = 'block'
}

export const hideRules = () => {
  document.getElementById('back-fon').style.display = 'none'
  document.getElementById('popup').style.display = 'none'
}

export const showMap = () => {
  document.body.style.overflowY = 'node'
  document.getElementById('step-2').style.fontWeight = 'normal'
  document.getElementById('step-1').style.fontWeight = 'bold'
  document.getElementById('makeorder').style.display = 'none'
  document.getElementById('main-container').style.display = 'block'
}

export const hideFirstImage = () => {
  const { scaledStage, viewport } = store.getState()
  document.getElementById('first-img').style.display = 'none'
  window.justLoaded = false
  document.getElementById('large-stage-container').style.display = 'block'
}

export const makeOrder = async (ctx) => {
  const basketPlacesExists = await getBasketPlaces(ctx) 
  if (basketPlacesExists) {
    document.body.style.overflowY = 'auto'
    document.getElementById('step-2').style.fontWeight = 'bold'
    document.getElementById('step-1').style.fontWeight = 'normal'
    document.getElementById('amount-table').innerHTML = store.getState().basket.total
    const rowsContainer = document.getElementById('rows-container')
    rowsContainer.innerHTML = ''
    document.getElementById('main-container').style.display = 'none'
    document.getElementById('makeorder').style.display = 'block'
    const { places } = store.getState().basket
    let q = 1
    places.forEach((value) => {
      let key = false
      const place = _.find(store.getState().places, (v, k) => {
        if (v.id === value.id) {
          key = k
          return v
        }
      })
      const section = _.find(store.getState().info.section, val => val.id === place.section_id)
      rowsContainer.innerHTML += `
      <div class="row table-string" data-place-key="${key}" data-place-id="${place.id}">
        <div class="col-md-9">${q}.&nbsp;&nbsp;&nbsp;${section.title} — Ряд ${place.status} Место ${place.name}</div>
        <div class="col-md-2">${place.price}</div>
        &nbsp;&nbsp;&nbsp;<a data-place-key="${key}" data-place-id="${place.id}" class="table-line-close" href="#">&#215;</a>
      </div>
      `
      q++
    })

    const linePlaces = Object.values(document.getElementsByClassName('table-line-close'))
    linePlaces.forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault()
        deletePlace(event, item, ctx)
      })
    })
  }
  return false
}

export const deletePlace = async (event, item, ctx) => {
  const { api } = store.getState()
  const { placeKey: key, placeId: placeID } = item.dataset
  const place = _.find(store.getState().places, v => v.id === placeID)
  const deleteResponse = await api.post({ action: 'basket_delete', placeID })
  if (deleteResponse.content === null) {
    basketClear()
    return false
  }
  if (deleteResponse.content.places.place[0].is_unselected === 1 || deleteResponse.result.code === -100) {
    let key = false
    const foundPlace = _.find(store.getState().places, (v, k) => {
      if (v.id === placeID) {
        key = k
      }
    })
    let q = false
    const basketExists = _.find(store.getState().basket.places, (v,k) => {
      if (v.id === placeID) {
        q = k
      }
    })
    delete store.getState().basket.places[q]
    store.getState().basket.places = store.getState().basket.places.filter(z => typeof z !== 'undefined')
    store.getState().places[key].status = '10'
    renderPlace(ctx, place)
    appendToBasket()
  }
  if (store.getState().basket.places.length > 0) {
    document.getElementById('amount-table').innerHTML = store.getState().basket.total
    item.parentNode.remove()
    return true
  }
  showMap()
}
