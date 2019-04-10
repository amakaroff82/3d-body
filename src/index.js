var request = require('request');
var fs = require("fs");

global.showSlice = function(){};

global.THREE = require("./libs/three.min.js");
require("./libs/OBJLoader.js");

global.neckGirthAndCervicalHeightData = require("./metrix/shared/neckGirthAndCervicalHeight.js");
global.verticalBodySlice = require("./metrix/shared/verticalBodySlice");
global.hipGirthAndHeight = require("./metrix/shared/hipGirthAndHeight");
global.chestData = require("./metrix/shared/chest");
global.measurements = require("./metrix/measurements.js");
global.helpers = require("./scanner/helpers.js");
global.slicing = require("./scanner/slicing.js");

var renameFile = false;

var url = "http://localhost:8080/test/";


var args = process.argv.slice(2);

if(args.length !== 3){
    console.error("Wrong parameters!");

    console.log("Please provides 3 params: 1 - userId; 2 - file path; 3 - height of person");
    return
}


var userId = args[0];
var fileName = args[1];
var personHeight = parseFloat(args[2]);
//var fileName = 'D:/Projects/3d-body-measurement/data/d/1553784032950.obj';


function loadModel() {
    object.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.material.map = texture;
            child.material.transparent = true;
            child.material.opacity = 0.9;
        }
    } );
}

var manager = new THREE.LoadingManager( loadModel );
manager.onProgress = function ( item, loaded, total ) {
    console.log( item, loaded, total );
};


function onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

var loader = new THREE.OBJLoader( manager );

fs.readFile(fileName, function(err, data){
    if(err){
        return;
    }

    var obj = loader.parse(data.toString());

    helpers.alignModel(obj.children[0].geometry.attributes.position.array);

    var result = measurements.run();

    sendData(result.map(function(item){
        return {
            name: item.Name,
            val: item.result ? ((item.result * personHeight).toFixed(1)) : ''
        }
    }), function(){

        if(renameFile) {
            fs.rename(fileName, fileName + ".computed", function (err, result) { });
        }
    });
});


function sendData(result, callback){

    var options = {
        url: url + userId,
        method: 'POST',
        json: JSON.stringify(result),
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    };

    request(options, function(err, res, body) {
        if(err){
            console.log("Error during sending information into server", err)
            return;
        }

        var json = JSON.parse(body);
        console.log(json);

        if(callback) {
            callback();
        }
    });
}
