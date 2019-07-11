<template>
  <v-app
    id="app"
  >
    <v-toolbar
      app
      flat
      color="indigo darken-4"
      prominent
    >
      <v-img
        :src="require('@/assets/images/logo.png')"
        style="width: 200px"
        max-width="200"
      />
      <v-spacer />
      <v-autocomplete
        v-model="selectedConfiguration"
        :items="configurations"
        :filter="filterConfigurations"
        label="Previous Configurations"
        prepend-inner-icon="list"
        dense
        single-line
        dark
        style="max-width: 400px"
      >
        <template
          slot="selection"
          slot-scope="{ item }"
        >
          <small>{{ item.shopifyDomain }}</small>
        </template>
        <template
          slot="item"
          slot-scope="{ item }"
        >
          <v-list-tile-content>
            <v-list-tile-title v-text="item.shopifyDomain" />
          </v-list-tile-content>
        </template>
      </v-autocomplete>

      <v-tooltip
        bottom
        color="grey darken-4"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            dark
            :disabled="configurations.length === 0"
            class="ml-3"
            v-on="on"
            @click="dialogConfigs = true"
          >
            <v-icon>list_alt</v-icon>
          </v-btn>
        </template>
        <span>Manage Configurations</span>
      </v-tooltip>
    </v-toolbar>

    <v-content class="grey lighten-3">
      <v-container fluid>
        <v-layout wrap align-items-stretch>
          <v-flex xs12>
            <v-form
              ref="form"
              v-model="valid"
              lazy-validation
              @submit.prevent="submitForm()"
            >
              <v-card>
                <v-card-title>
                  <h3 class="title indigo--text">
                    Configuration
                  </h3>
                </v-card-title>
                <v-container
                  fluid
                  grid-list-xl
                >
                  <v-layout wrap>
                    <v-flex xs6>
                      <v-text-field
                        v-model="selectedConfiguration.shopifyDomain"
                        type="text"
                        label="Shopify Store Domain"
                        hint="Shopify domain - must end in '.myshopify.com'"
                        persistent-hint
                        prepend-inner-icon="store"
                        :rules="[rules.required, rules.url]"
                        required
                      />
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        v-model="selectedConfiguration.appPassword"

                        label="Private App Password"
                        prepend-inner-icon="fingerprint"
                        :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                        :rules="[rules.required]"
                        required
                        :type="showPassword ? 'text' : 'password'"
                        @click:append="showPassword = !showPassword"
                      />
                    </v-flex>
                  </v-layout>
                </v-container>
                <v-card-actions>
                  <v-btn
                    color="indigo darken-1"
                    dark
                    depressed
                    :loading="isLoadingBtn1"
                    @click="getThemes()"
                  >
                    Get Themes
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-flex>

          <v-flex
            xs8
            mt-3
            pr-2
          >
            <v-card height="100%">
              <v-card-title>
                <h3 class="title indigo--text">
                  Store Themes
                </h3>
              </v-card-title>
              <v-container
                fluid
                grid-list-xl
              >
                <v-layout wrap>
                  <v-flex xs12>
                    <v-select
                      v-model="selectedTheme"
                      :items="themes"
                      label="Theme List"
                      prepend-inner-icon="art_track"
                      :disabled="themes.length === 0"
                      dense
                    >
                      <template
                        slot="selection"
                        slot-scope="{ item }"
                      >
                        {{ item.id }} - {{ item.name }}
                      </template>
                      <template
                        slot="item"
                        slot-scope="{ item }"
                      >
                        <v-list-tile-avatar
                          :color="item.name.includes('[live]') ? 'green lighten-1' : 'blue-grey lighten-3'"
                          class="font-weight-normal white--text"
                          size="30"
                        >
                          {{ getAvatar(item) }}
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                          <v-list-tile-title v-text="item.name" />
                          <v-list-tile-sub-title v-text="item.id" />
                        </v-list-tile-content>
                      </template>
                    </v-select>
                  </v-flex>
                </v-layout>
              </v-container>
              <v-card-actions>
                <v-btn
                  depressed
                  :color="selectedTheme ? 'indigo darken-1 white--text' : 'indigo darken-1'"
                  :loading="isLoadingBtn2"
                  :disabled="!selectedTheme"
                  @click="downloadTheme()"
                >
                  Download Selected
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>

          <v-flex
            xs4
            mt-3
            pl-2
          >
            <v-card
              color="indigo lighten-1"
              height="100%"
            >
              <v-card-title>
                <h3 class="title white--text">
                  Download Progress
                </h3>
              </v-card-title>
              <v-container
                fluid
                grid-list-xl
              >
                <v-layout wrap>
                  <v-flex xs12>
                    <div class="text-xs-center">
                      <v-progress-circular
                        :rotate="360"
                        :size="110"
                        :width="10"
                        :value="downloadProgress"
                        color="green lighten-2"
                      >
                        <span v-if="downloadProgress > 0" class="title">{{ downloadProgress }}%</span>
                      </v-progress-circular>
                    </div>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer
      class="pa-3"
      color="indigo lighten-4"
    >
      <v-spacer />
      <span class="indigo--text text--lighten-2">version: {{ version }}</span>
    </v-footer>

    <v-dialog
      v-model="dialog.status"
      persistent
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline">
          {{ dialog.title }}
        </v-card-title>
        <v-card-text>{{ dialog.text }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="indigo darken-1"
            flat
            @click="dialog.status = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogConfigs"
      scrollable
      max-width="600px"
    >
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Manage Configurations
        </v-card-title>
        <v-divider />
        <v-card-text style="padding: 0;">
          <v-list
            two-line
            style="padding: 0;"
          >
            <draggable
              v-model="configurations"
              class="list-group"
              v-bind="dragOptions"
              @start="drag = true"
              @end="drag = false"
            >
              <transition-group
                type="transition"
                :name="!drag ? 'flip-list' : null"
              >
                <v-list-tile
                  v-for="(config, index) in configurations"
                  :key="index"
                  class="list-group-item"
                >
                  <v-list-tile-content>
                    <v-list-tile-title>{{ config.shopifyDomain }}</v-list-tile-title>
                    <v-list-tile-sub-title>
                      <v-btn
                        color="red darken-1"
                        style="margin: 0;"
                        flat
                        small
                        @click="openConfirmDialog(index)"
                      >
                        Delete
                      </v-btn>
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-icon>drag_handle</v-icon>
                  </v-list-tile-action>
                </v-list-tile>
              </transition-group>
            </draggable>
          </v-list>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="indigo darken-1"
            flat
            @click="dialogConfigs = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogConfirm"
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline">
          Delete configuration?
        </v-card-title>

        <v-card-text>
          Are you sure you want to delete this configuration?
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="indigo darken-1"
            flat="flat"
            @click="dialogConfirm = false"
          >
            Close
          </v-btn>

          <v-btn
            color="red darken-1"
            flat="flat"
            @click="confirmDelete()"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import fs from 'fs'
import zipper from 'zip-local'
import draggable from 'vuedraggable'
import { remote } from 'electron'
import { mapState, mapActions } from 'vuex'
import { exec } from 'child_process'

export default {
  name: 'Main',

  components: {
    draggable
  },

  data: () => ({
    version: remote.app.getVersion(),
    dialog: {
      status: false,
      title: '',
      text: ''
    },
    dialogConfigs: false,
    dialogConfirm: false,
    showPassword: false,
    indexForDeletion: null,
    isLoadingBtn1: false,
    isLoadingBtn2: false,
    downloadProgress: 0,
    selectedTheme: null,
    drag: false,
    valid: false,
    rules: {
      required: value => !!value || 'Required',
      url: value => {
        const pattern = /^(?:https?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
        return pattern.test(value) || 'Invalid URL'
      }
    }
  }),

  computed: {
    ...mapState([
      'themes',
      'configurations'
    ]),
    configurations: {
      get () { return this.$store.state.configurations },
      set (configs) {
        this.updateConfigurations({ configs })
      }
    },
    selectedConfiguration: {
      get () { return this.$store.state.selectedConfiguration },
      set (value) {
        const config = {
          shopifyDomain: value.shopifyDomain,
          appPassword: value.appPassword,
          order: 0
        }
        this.setConfiguration({ config })
        this.clearThemes()
        this.downloadProgress = 0
      }
    },
    dragOptions () {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    }
  },

  methods: {
    ...mapActions([
      'addConfiguration',
      'setConfiguration',
      'deleteConfiguration',
      'updateConfigurations',
      'setThemes',
      'clearThemes'
    ]),

    filterConfigurations (item, queryText) {
      return (item.shopifyDomain.toLowerCase().includes(queryText.toLowerCase()))
    },

    getAvatar (item) {
      if (item.name.includes('[live]')) {
        return 'L'
      } else {
        return item.name.charAt(0)
      }
    },

    execShellCommand (cmd) {
      return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            error = error.toString().match(/\((.*)\)/)[1]
            this.isLoadingBtn1 = false
            this.isLoadingBtn2 = false
            this.dialog.status = true
            this.dialog.title = 'An error occurred'
            this.dialog.text = error
          }
          resolve(stdout || stderr)
        })
      })
    },

    async getThemes () {
      if (!this.$refs.form.validate()) return

      const shopifyDomain = this.selectedConfiguration.shopifyDomain
      const appPassword = this.selectedConfiguration.appPassword
      const config = {
        shopifyDomain,
        appPassword
      }

      this.isLoadingBtn1 = true
      this.downloadProgress = 0

      const result = await this.execShellCommand(`theme get --list --password=${appPassword} --store=${shopifyDomain}`)
      const themeList = result.split('\n')
      const themes = []
      for (var i = 1; i < themeList.length; i++) {
        const themeRow = themeList[i].trim()
        if (themeRow.length > 0) {
          const idx = themeRow.indexOf(']')
          let themeIdR = themeRow.substring(1, idx).trim()
          let themeName = themeRow.substring(idx + 2).trim()
          if (themeRow.indexOf('[live]') > 0) {
            themeIdR = themeRow.substring(1, idx).trim()
            themeName = themeRow.substring(idx + 1).trim()
          }
          if (i > 1) {
            const theme = {
              id: themeIdR,
              name: themeName
            }
            themes.push(theme)
          }
        }
      }
      this.isLoadingBtn1 = false
      await this.setThemes({ themes })
      if (themeList[0].includes('Available theme versions')) { // add only successful configurations
        this.addConfiguration({ config })
      }
    },

    openConfirmDialog (index) {
      this.dialogConfirm = true
      this.indexForDeletion = index
    },

    confirmDelete () {
      this.deleteConfiguration(this.indexForDeletion)
      this.dialogConfirm = false
    },

    deleteFolderRecursive (path) {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
          var curPath = path + '/' + file
          if (fs.lstatSync(curPath).isDirectory()) { // repeat
            this.deleteFolderRecursive(curPath)
          } else { // delete file
            fs.unlinkSync(curPath)
          }
        })
        fs.rmdirSync(path)
      }
    },

    async downloadTheme () {
      const shopifyDomain = this.selectedConfiguration.shopifyDomain
      const appPassword = this.selectedConfiguration.appPassword
      const themeId = this.selectedTheme.id
      const downloadFolder = `${remote.app.getPath('downloads')}/${shopifyDomain}-${themeId}`
      this.isLoadingBtn2 = true

      try {
        if (fs.existsSync(downloadFolder)) {
          this.deleteFolderRecursive(downloadFolder)
        }
        if (!fs.existsSync(downloadFolder)) {
          fs.mkdirSync(downloadFolder)
        }
      } catch (error) {
        this.isLoadingBtn2 = false
        this.dialog.status = true
        this.dialog.title = 'An error occurred'
        this.dialog.text = error
      }

      const childProcess = `theme download --env=production --password=${appPassword} --store=${shopifyDomain} --themeid=${themeId} --dir=${downloadFolder}`
      var process = exec(childProcess)

      process.stdout.on('data', (data) => {
        if (data.indexOf('[2K') > 0) {
          data = data.substring(data.indexOf('--]') + 4).replace(/\s/g, '').replace('%', '')
          this.downloadProgress = data
        }
      })
      process.stderr.on('data', (data) => {
        this.isLoadingBtn2 = false
        this.dialog.status = true
        this.dialog.title = 'An error occurred'
        this.dialog.text = data
      })
      process.on('close', (code) => {
        if (code === 0) {
          this.isLoadingBtn2 = false
          this.downloadProgress = 0

          zipper.zip(downloadFolder, (error, zipped) => {
            if (!error) {
              zipped.compress() // compress before exporting
              let buffer = zipped.memory() // get the zipped file as a Buffer
              buffer = Buffer.from(buffer)
              const options = {
                title: 'Download Theme', // may not appear in all OS
                defaultPath: `${downloadFolder}.zip`
              }
              this.deleteFolderRecursive(downloadFolder)
              remote.dialog.showSaveDialog(null, options, (savePath) => {
                fs.writeFile(savePath, buffer, () => {})
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
  @import '@/assets/styles/app.scss';
</style>
