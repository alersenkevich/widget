const store = {
  places: [],
  zoomed: {
    placeLength: 30,
    correlation: {
      textToPlace: 0.36,
      marg: [0.26, 0.16, 0.06],
      top: 0.48,
    },
  },
  minimap: {
    container: {
      width: 250,
      height: 250,
    },
  },
  scaledStage: {
    padding: 100,
  },
  wholeStage: {
    padding: 20,
  },
  basket: {
    places: [],
  }
}
window.restsDescriptions = ['мест', 'место', 'места', 'места', 'места', 'мест', 'мест', 'мест', 'мест', 'мест']
export default store
