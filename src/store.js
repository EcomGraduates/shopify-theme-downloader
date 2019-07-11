import Vue from 'vue'
import Vuex from 'vuex'
import {
  createPersistedState
} from 'vuex-electron'

// Delete internal storage => start fresh!
// import Store from 'electron-store'
// const store = new Store({ name: 'vuex' })
// store.clear()

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      whitelist: [
        'addConfiguration',
        'setConfiguration',
        'deleteConfiguration',
        'updateConfigurations',
        'setThemes'
      ]
    })
  ],

  state: {
    configurations: [],
    selectedConfiguration: {},
    themes: []
  },

  mutations: {
    addConfiguration (state, data) {
      const itemExists = state.configurations.findIndex(item => item.shopifyDomain === data.shopifyDomain)

      if (itemExists === -1) {
        state.configurations.push(data)
      }
    },

    setConfiguration (state, data) {
      state.selectedConfiguration = data
    },

    deleteConfiguration (state, index) {
      state.configurations.splice(index, 1)
    },

    updateConfigurations (state, data) {
      state.configurations = data
    },

    setThemes (state, data) {
      state.themes = data
    }
  },

  actions: {
    addConfiguration ({ commit }, { config }) {
      commit('addConfiguration', config)
    },

    setConfiguration ({ commit }, { config }) {
      commit('setConfiguration', config)
    },

    deleteConfiguration ({ commit }, index) {
      commit('deleteConfiguration', index)
    },

    updateConfigurations ({ commit }, { configs }) {
      commit('updateConfigurations', configs)
    },

    setThemes ({ commit }, { themes }) {
      commit('setThemes', themes)
    },

    clearThemes ({ commit }) {
      commit('setThemes', [])
    }
  }
})
