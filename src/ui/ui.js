var isTranslate = false;
var paramStorage = null;
var modelStorage = models.models[ 0 ];





function basis(group, origin){
    origin = origin || new THREE.Vector3( 0, 0, 0 );

    var length = 0.2;

    var dirX = new THREE.Vector3( 1, 0, 0 );
    dirX.normalize();

    var hex = 0xffff00;

    var arrowHelper = new THREE.ArrowHelper( dirX, origin, length, hex );
    group.add( arrowHelper );



    var dirY = new THREE.Vector3( 0, 1, 0 );
    dirY.normalize();

    var hex = 0xff00ff;

    arrowHelper = new THREE.ArrowHelper( dirY, origin, length, hex );
    group.add( arrowHelper );



    var dirZ = new THREE.Vector3( 0, 0, 1 );
    dirZ.normalize();

    var hex = 0x00ffff;

    arrowHelper = new THREE.ArrowHelper( dirZ, origin, length, hex );
    group.add( arrowHelper );
}


function showSlice(slice, showComputed, color) {
    var faces = slice.faces || slice;
    for (var j = 1; j < faces.length; j=j+2) {

        var f = showComputed ? faces[j] : faces[j].main;

        var geometry = new THREE.SphereGeometry( 0.001, 4, 4);
        var material = new THREE.MeshBasicMaterial( {color: color || 0x0000d0, side: THREE.DoubleSide} );
        var sphere = new THREE.Mesh( geometry, material );

        sphere.position.x = f.a.x;
        sphere.position.y = f.a.y;
        sphere.position.z = f.a.z;

        group.add( sphere );

        if(faces[j].normal){
            var n = faces[j].normal;
            var a = faces[j].main.a;

            var origin = new THREE.Vector3(a.x, a.y, a.z);
            var dirX = new THREE.Vector3( n.x, n.y, n.z );
            dirX.normalize();

            var hex = color || 0xffff00;

            var arrowHelper = new THREE.ArrowHelper( dirX, origin, 0.01, hex );
            group.add( arrowHelper );
        }
    }
}

function showRect(sliceInfo, color){
    var geometry = new THREE.PlaneGeometry( sliceInfo.height, sliceInfo.width, 1, 1 );

    var material = new THREE.MeshBasicMaterial( {color: color || 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );

    plane.position.x = sliceInfo.centerX;
    plane.position.z = sliceInfo.centerZ;
    plane.rotation.x += Math.PI / 2;    // 180deg

    group.add( plane );
}




function clearResults(){
    var logContainer = document.querySelector(".log");
    logContainer.innerHTML = '';
}

function updateResults(){
    clearResults();

    var logContainer = document.querySelector(".log");

    renderRecord({
        Name: "Name",
        Ru: "Name",
        orig: "original",
        result: "calculated"
    }, logContainer, true);

    for(var i = 0;i < measurements.config.length; i++){
        var param = measurements.config[i];
        renderRecord(param, logContainer);
    }
}

function renderRecord(param, container, header){
    var rec = document.createElement("div");
    rec.classList.add("rec");
    if(header){
        rec.classList.add("header");
    }

    var name = document.createElement("span");
    name.className = "name";
    name.innerText = isTranslate ? param.Ru : param.Name;
    rec.appendChild(name);

    var orig = document.createElement("span");
    orig.className = "orig";
    if(header)
        orig.innerText = "orig";
    else {
        var orParam = prepareOrig(param.Name);
        orig.innerText = orParam ? orParam : " - ";
    }
    rec.appendChild(orig);

    var res = document.createElement("span");
    res.className = "res";
    if(header)
        res.innerText = "result";
    else
        res.innerText = param.result ? prepareResult(param.result) : " - ";
    rec.appendChild(res);


    var pred = document.createElement("span");
    pred.className = "pred";

    var res = parseFloat(prepareResult(param.result));
    var orig = parseFloat(prepareOrig(param.Name));

    var a = Math.max(res, orig);
    var b = Math.min(res, orig);

    var prediction = parseInt(100 - b / (a / 100));
    pred.innerText = prediction.toString() + "% / " + (a - b).toFixed(1).toString() + "sm";

    pred.style.color = isNaN(prediction) ? "black" : "lightgreen";

    prediction = a - b;

    if(Math.abs(prediction) > 2){
        pred.style.color = "yellow"
    }
    if(Math.abs(prediction) > 5){
        pred.style.color = "orange"
    }
    if(Math.abs(prediction) > 10){
        pred.style.color = "red"
    }

    rec.appendChild(pred);



    container.appendChild(rec);

}

function prepareOrig(name){
    if(!paramStorage){
        return " - ";
    }
    var param = paramStorage.find(function(param){
        return param.Name === name;
    });

    if(param){
        return param.val;
    }
}


function prepareResult(res){

    return (res * modelStorage.height).toFixed(1)

}
