const { defineConfig } = require('cypress')
require('cypress')

module.exports = defineConfig({
    
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
        ignoreVideos: true
    },
    e2e: {
        setupNodeEvents(on, config) {
            return require('./cypress/plugins/index.js')(on, config),
            require('cypress-mochawesome-reporter/plugin')(on)
        },
        baseUrl: 'https://hackernews-seven.vercel.app/'
    }
})