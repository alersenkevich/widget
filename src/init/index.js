import api from '../lib/api/kassy-api'
import StateComponent from '../helpers/state'
import initialStore from '../helpers/store'
import { getInitialSets, getViewportParams, getWholeStageParams } from '../helpers/calculating'
import { applyInitialSets, applyDOM, DOMResize, determineHeader } from '../helpers/dom'
import { checkTheBasket } from '../helpers/basket'
import { renderStage } from '../helpers/renderer'
import { listenersInit, mobileListenersInit } from '../helpers/listeners'


const desktopInterfaceRUN = async (canvas) => {
  const { scaledStage, ctx } = store.state
  applyInitialSets(scaledStage.width, scaledStage.height)
  renderStage(scaledStage.correlation, ctx)
  await checkTheBasket(ctx)
  applyDOM(canvas)
  listenersInit(ctx)
  document.getElementById('preloading').style.display = 'none'
  document.getElementById('main-body-container').style.display = 'block'
  window.onresize = () => {
    DOMResize()
  }
}

const mobileInterfaceRun = async (canvas) => {
  const { scaledStage, ctx, viewport, wholeStage } = store.state
  applyInitialSets(scaledStage.width, scaledStage.height)
  renderStage(scaledStage.correlation, ctx)
  await checkTheBasket(ctx)
  const viewportDOM = document.getElementById('large-stage-viewport')
  const containerDOM = document.getElementById('large-stage-container')
  const canvasElement = document.getElementById('large-stage-canvas')
  const infoContainer = document.getElementById('info-container')
  infoContainer.style.display = 'none'
  //viewport.style.display = 'block'
  viewportDOM.style.width = window.innerWidth
  viewportDOM.style.height = window.innerHeight - 100
  viewportDOM.style.overflow = 'scroll'
  //container.style.display = 'block'
  containerDOM.style.paddingLeft = 100
  containerDOM.style.paddingTop = 100
  canvasElement.style.display = 'block'
  window.img = canvas.toDataURL('image/png')
  document.getElementById('mapImg').src = img
  const firstIMG = document.getElementById('first-img')
  firstIMG.src = window.img
  firstIMG.style.height = wholeStage.height
  firstIMG.style.width = wholeStage.width
  firstIMG.style.marginLeft = (viewport.width - wholeStage.width) / 2
  firstIMG.style.marginTop = (viewport.height - wholeStage.height) / 2

  determineHeader()
  
  document.body.style.width = window.innerWidth
  const mainHeader = document.getElementById('main-header')
  mainHeader.style.width = '100%'
  const stepsHeader = document.getElementById('steps-header')
  stepsHeader.style.width = '100%'
  stepsHeader.style.fontSize = '0.7em'
  const showTitle = document.getElementById('show-title')
  showTitle.style.width = '100%'
  showTitle.style.marginTop = 10
  showTitle.style.fontSize = '0.52em'
  showTitle.style.lineHeight = '0.7em'
  const showData = document.getElementById('show-data')
  showData.style.width = '100%'
  showData.style.marginTop = '15px'
  showData.style.fontSize = '0.3em'
  showData.style.lineHeight = '1em'
  const rating = document.getElementById('rating')
  rating.style.fontSize = '0.7em'
  rating.style.right = 5
  rating.style.top = 35

  mobileListenersInit(ctx)
  document.getElementById('preloading').style.display = 'none'
  document.getElementById('main-body-container').style.display = 'block'
  window.onresize = async () => {
    document.body.style.width = window.innerWidth
    viewportDOM.style.width = window.innerWidth
    viewportDOM.style.height = window.innerHeight - 100
    const resizedViewport = getViewportParams()
    const resizedWholeStage = getWholeStageParams(resizedViewport, store.state.absoluteCoordExtremes)
    firstIMG.style.height = resizedWholeStage.height
    firstIMG.style.width = resizedWholeStage.width
    firstIMG.style.marginLeft = (resizedViewport.width - resizedWholeStage.width) / 2
    firstIMG.style.marginTop = (resizedViewport.height - resizedWholeStage.height) / 2


    mainHeader.style.width = '100%'
    stepsHeader.style.width = '100%'
    stepsHeader.style.fontSize = '0.7em'
    showTitle.style.width = '100%'
    showTitle.style.marginTop = 10
    showTitle.style.fontSize = '0.52em'
    showTitle.style.lineHeight = '0.7em'
    showData.style.width = '100%'
    showData.style.marginTop = '15px'
    showData.style.fontSize = '0.3em'
    showData.style.lineHeight = '1em'
    rating.style.fontSize = '0.7em'
    rating.style.right = 5
    rating.style.top = 35

    store.dispatch({ ...store.state,
      viewport: resizedViewport,
      wholeStage: resizedWholeStage,
    })

  }
  window.addEventListener(orientationEvent, async () => {
    document.body.style.width = window.innerWidth
    viewportDOM.style.width = window.innerWidth
    viewportDOM.style.height = window.innerHeight - 100
    const resizedViewport = getViewportParams()
    const resizedWholeStage = getWholeStageParams(resizedViewport, store.state.absoluteCoordExtremes)
    firstIMG.style.height = resizedWholeStage.height
    firstIMG.style.width = resizedWholeStage.width
    firstIMG.style.marginLeft = (resizedViewport.width - resizedWholeStage.width) / 2
    firstIMG.style.marginTop = (resizedViewport.height - resizedWholeStage.height) / 2
    
    mainHeader.style.width = '100%'
    stepsHeader.style.width = '100%'
    stepsHeader.style.fontSize = '0.7em'
    showTitle.style.width = '100%'
    showTitle.style.marginTop = 10
    showTitle.style.fontSize = '0.52em'
    showTitle.style.lineHeight = '0.7em'
    showData.style.width = '100%'
    showData.style.marginTop = '15px'
    showData.style.fontSize = '0.3em'
    showData.style.lineHeight = '1em'
    rating.style.fontSize = '0.7em'
    rating.style.right = 5
    rating.style.top = 35

    store.dispatch({ ...store.state,
      viewport: resizedViewport,
      wholeStage: resizedWholeStage,
    })

  })
}


export const applicationRun = () => {
  window.smart = mobileAndTabletCheck();
  window.hintDelay = 1000
  window.setTimeoutConst = false
  const imgMustLoaded = prepareData()
  imgMustLoaded.addEventListener('load', async (event) => {
    const canvas = document.getElementById('large-stage-canvas')
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'destination-over'
    const response = await api.post({ id: window.eventID, action: 'page_event_hall' })
    const { place: places } = response.content.places
    const initialSets = await getInitialSets(places)
    store.dispatch({ ...initialSets, api, info: response.content, ctx })
    if (window.smart) mobileInterfaceRun(canvas)
    else desktopInterfaceRUN(canvas)
  })
}

const prepareData = () => {
  window.store = new StateComponent()
  store.createStore(initialStore)
  window.justLoaded = true
  window.clock = new Image()
  window.added = new Image()
  clock.src = 'time.png'
  added.src = 'tick.svg'
  return added
}

export const getURLParams = () => {
  let url = window.location.href
  url = url.split('#')
  if (url[1] !== undefined && url[1] !== null && url[1] !== '') {
    url = url[1].split('&')
    url.forEach((val) => {
      const param = val.split('=')
      window[param[0]] = param[1]
    })
    window.widgetInsideTheWindow = true
  }
  else {
    window.widgetInsideTheWindow = false
    window.eventID = 8754
    window.agentID = 'api.kassy.ru'
    window.showDB = 'ekb'
    window.sessionUID = window.localStorage.getItem('SESSION_ID')
  }
}

window.mobileAndTabletCheck = () => {
  let check = false;
  (function(a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;
  })(navigator.userAgent || navigator.vendor || window.opera)
  return check
}