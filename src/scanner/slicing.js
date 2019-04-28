(function(exports){

    function isPointEqual(p1, p2){
    return  p1.x === p2.x &&
        p1.y === p2.y &&
        p1.z === p2.z
}

    function isPointsEqual(p1, p2) {
        return  (p1[0] === p2[0] && p1[1] === p2[1] && p1[2] === p2[2]) ||
            (p1[0] === p2[3] && p1[1] === p2[4] && p1[2] === p2[5]) ||
            (p1[0] === p2[6] && p1[1] === p2[7] && p1[2] === p2[8]) ||

            (p1[3] === p2[0] && p1[4] === p2[1] && p1[5] === p2[2]) ||
            (p1[3] === p2[3] && p1[4] === p2[4] && p1[5] === p2[5]) ||
            (p1[3] === p2[6] && p1[4] === p2[7] && p1[5] === p2[8]) ||

            (p1[6] === p2[0] && p1[7] === p2[1] && p1[8] === p2[2]) ||
            (p1[6] === p2[3] && p1[7] === p2[4] && p1[8] === p2[5]) ||
            (p1[6] === p2[6] && p1[7] === p2[7] && p1[8] === p2[8])
    }

    function isFaceChained(f1, f2){
        //return isPointsEqual(f1, f2)
          var a = isPointEqual(f1.a, f2.a) ||
            isPointEqual(f1.a, f2.b) ||
            isPointEqual(f1.a, f2.c);

          var b = isPointEqual(f1.b, f2.a) ||
            isPointEqual(f1.b, f2.b) ||
            isPointEqual(f1.b, f2.c);

          var c = isPointEqual(f1.c, f2.a) ||
            isPointEqual(f1.c, f2.b) ||
            isPointEqual(f1.c, f2.c);

          if(a && b && c){
              // the same face
              return false;
          }

        return a || b || c;
    //    return (a && b) || (b && c) || (a && c);
    }

    function isChainedFace(faces, face){
        for(var f in faces){
            var fc = faces[f];
            if(isFaceChained(fc, face)){
                //fc.neighbors.push(face);
                //face.neighbors.push(fc);
                return true;
            }
        }
    }

    function getChain(chain, face){

        var firstFoundSlice;

        for(var i = 0; i < chain.length; i++){
            var faces = chain[i].faces;
            if(isChainedFace(faces, face)){
                if(firstFoundSlice){
                    // remove slice
                    chain[i].faces = null;
                    chain.splice(i, 1); // remove
                    i--;

                    firstFoundSlice.faces = firstFoundSlice.faces.concat(faces);//connect
                }
                else
                {
                    faces.push(face);
                    firstFoundSlice = chain[i];
                }
            }
        }

        if(!firstFoundSlice) {
            chain.push({
                faces: [face]
            });
        }


    }

    function sliceTriangles(matrix, countOfSlices, depth, volume){
        //console.log("count of slices: " + countOfSlices);

        var slices = [];

        for(var j = 0; j < countOfSlices; j++){
            slices.push([])
        }

        for(var i = 0; i < helpers.allFaces.length; i++){
            var f = helpers.allFaces[i];


            for(var j = 0; j < countOfSlices; j++) {
                var step = helpers.lerp(0, depth, j / countOfSlices);

                var sliceMatrix = new THREE.Matrix4();

                sliceMatrix.makeTranslation(0, -step, 0);
                var sliceMatrix = sliceMatrix.multiply(matrix);

                var f_t = {
                    a: f.a.clone().applyMatrix4(sliceMatrix),
                    b: f.b.clone().applyMatrix4(sliceMatrix),
                    c: f.c.clone().applyMatrix4(sliceMatrix),
                    main: f,
                    neighbors: []
                };

                var topOfTriangle = Math.max(f_t.a.y, f_t.b.y, f_t.c.y);
                var bottomOfTriangle = Math.min(f_t.a.y, f_t.b.y, f_t.c.y);

                if(volume){
                    if (topOfTriangle > 0) {
                        var faces = slices[j];
                        faces.push(f_t);
                        break;
                    }

                }else{
                    if (topOfTriangle > 0 && 0 >= bottomOfTriangle) {
                        var dist = helpers.calculateDistance(f_t, 0);

                        f_t.len = dist.len;
                        f_t.percent0 = dist.percent0;
                        f_t.percent1 = dist.percent1;

                        if(f_t.len != 0) {
                            var faces = slices[j];
                            faces.push(f_t);

                            break;
                        }
                    }

                }
            }
        }

        return slices;
    }

    function getVolume(matrix){
        var slices = sliceTriangles(matrix, 1, 0, true);

        for(var slice in slices){
            var sl = slices[slice];

            helpers.buildNormals(sl)
        }

        return slices;
    }

    function getSlices(matrix, countOfSlices, depth, show, chainSlices){
        var slices = sliceTriangles(matrix, countOfSlices, depth);

        return slices.map(function(slice){
            var chains = [];

            if(chainSlices) {
                for (var fc in slice) {
                    var sl = slice[fc];
                    getChain(chains, sl);
                }
            }else{
                chains.push({
                    faces: slice
                });
            }

            if(!chains.length){
                return [];
            }

            for(var i = 0; i < chains.length; i++){
                calcData(chains[i]);

                if(show){
                    if(typeof (show) === "string")
                        showSlice(chains[i], false, show);
                    else
                        showSlice(chains[i], false, "#00aa00");
                }
            }

            chains.sort(function(a, b){
                return b.sliceInfo.len - a.sliceInfo.len;
            });

            return chains;
        });
    }

    function calcData(chain){
        var faces = chain.faces;
        var minX = Infinity;
        var maxX = -Infinity;
        var minZ = Infinity;
        var maxZ = -Infinity;
        var minY = Infinity;
        var maxY = -Infinity;

        var len = 0;

        for(var j = 0; j < faces.length; j++){
            var orig_face = faces[j];
            var f = orig_face.main;
            maxX = Math.max(maxX, f.a.x, f.b.x, f.c.x);
            minX = Math.min(minX, f.a.x, f.b.x, f.c.x);
            maxZ = Math.max(maxZ, f.a.z, f.b.z, f.c.z);
            minZ = Math.min(minZ, f.a.z, f.b.z, f.c.z);
            maxY = Math.max(maxY, f.a.y, f.b.y, f.c.y);
            minY = Math.min(minY, f.a.y, f.b.y, f.c.y);
            len += orig_face.len;
        }

        //console.log("faces:  " + faces.length + "   len:  " + len);

        chain.sliceInfo = {
            //slice: slice,
            len: len,
            minX: minX,
            maxX: maxX,
            minZ: minZ,
            maxZ: maxZ,
            minY: minY,
            maxY: maxY,
            width: maxX - minX,
            depth: maxZ - minZ,
            height: maxY - minY,
            centerX: (maxX - minX) / 2 + minX,
            centerY: (maxY - minY) / 2 + minY,
            centerZ: (maxZ - minZ) / 2 + minZ
        };
    }

    exports.isPointEqual = isPointEqual;
    exports.isPointsEqual = isPointsEqual;
    exports.isFaceChained = isFaceChained;
    exports.isChainedFace = isChainedFace;
    exports.getChain = getChain;
    exports.sliceTriangles = sliceTriangles;
    exports.getSlices = getSlices;
    exports.getVolume = getVolume;
    exports.calcData = calcData;

})(typeof exports === 'undefined'? this['slicing']={}: exports);
