class StateComponent {
  constructor() {
    this.state = {}
  }

  getState() {
    return this.state
  }

  createStore(initialState) {
    this.dispatch(initialState)
  }

  dispatch(entity) {
    this.state = {
      ...this.state,
      ...entity,
    }
  }
}

export default StateComponent