var page = require('page');
var App = require('./app.js');
var Map = require('./map.js');
var Autocomplete = require('./autocomplete.js');

function main(context, next) {
    App.initialize();
    Map.initialize();
    Autocomplete.initialize();
    next();
}

function setDestination(context, next) {
    var structure = context.params.structure;
    console.log('Setting destination:'+structure);
    Map.setDestinationByLink(structure);
}

function initialize() {
    page.base('/#!');

    page('/', main);
    page('/estrutura/:structure', main, setDestination);
    page();
}

module.exports = {
    'initialize': initialize
}
