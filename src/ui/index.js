//"use strict";

(function(){

    var object = null;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var container;
    var camera, scene, renderer;
    var controls;


    init();
    animate();

    function load(modelData){
        console.time("Loading");

        if(modelData.jsonFile){

            fetch(modelData.path + modelData.jsonFile, {
                method: 'GET'
            })
            .then(function(response){
                return response.json()
            })
            .then(function(json) {
                paramStorage = json;
            });
        }

        function loadModel() {
            object.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.material.map = texture;
                    child.material.transparent = true;
                    child.material.opacity = 0.9;
                }
            } );
            group.add( object );

            updateResults();

            setTimeout(function(){
                measurements.run(updateResults);
            }, 0);
        }

        var manager = new THREE.LoadingManager( loadModel );
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };

        if(modelData.texture) {
            var textureLoader = new THREE.TextureLoader(manager);
            var texture = textureLoader.load(modelData.path + modelData.texture);
        }

        function onProgress( xhr ) {
            if ( xhr.lengthComputable ) {
                //var percentComplete = xhr.loaded / xhr.total * 100;
                //console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
            }
        }

        function onError() {}

        var loader = new THREE.OBJLoader( manager );

        loader.load( modelData.path + modelData.objFile, function ( obj ) {
            //console.timeLog("Loading");

            //console.time("Align Model");
            helpers.alignModel(obj.children[0].geometry.attributes.position.array);
            object = obj;
            //console.timeLog("Align Model");

        }, onProgress, onError );
    }


    function init() {
        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.z = 15;

        controls = new THREE.OrbitControls( camera );

        // scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x000000 );
        var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
        scene.add( ambientLight );
        var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
        camera.add( pointLight );
        scene.add( camera );
        controls.update();

        group = new THREE.Group();
        group.position.y -= 5;
        group.scale.x = 10;
        group.scale.y = 10;
        group.scale.z = 10;

        basis( group );
        scene.add( group );
        controls.update();

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

    }


    function animate() {
        requestAnimationFrame( animate );
        render();
    }

    function render() {
        controls.update();
        renderer.render( scene, camera );
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function clearThree(obj){
        while(obj.children.length > 0){
            clearThree(obj.children[0])
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose()
        if(obj.material) obj.material.dispose()
        if(obj.texture) obj.texture.dispose()
    }


    var ind = document.location.hash.split("#")[1];
    console.log('hash changed: ' + ind);

    window.modelStorage = models.models[ ind || 0 ];

    load(modelStorage);

    window.addEventListener('hashchange', function() {
        location.reload(true);
    }, true);


})(typeof exports === 'undefined'? this['index']={}: exports);
