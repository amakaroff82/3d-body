(function(exports){


    function getArmDirectionVector(rp, heightToCrotch, sliceRange){

        var angleZ = Math.PI / 4;
        var countOfSlices = 8;

        var stopBottom = heightToCrotch;
        var depth = rp.y - stopBottom;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(-rp.x, -rp.y, -rp.z);

        // rotate Z
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationZ(angleZ);

        var matrix = matrixRot.multiply(matrixTrans);

        // slicing
        var basicSlices = slicing.getSlices(matrix, countOfSlices, -depth, false, true);

        basicSlices.reverse();
        basicSlices.pop();

        var handSlices = filterData(basicSlices, sliceRange, rp);

        clearEmptySlices(handSlices);

        handSlices.forEach(function (slice) {
            //showSlice(slice, false, "blue")
        });

        var topHand = handSlices[0];
        var bottomHand = handSlices[4];

        var tp = new THREE.Vector3(
            topHand.sliceInfo.centerX,
            topHand.sliceInfo.centerY,
            topHand.sliceInfo.centerZ);

        //basis(group, tp);

        var bp = new THREE.Vector3(
            bottomHand.sliceInfo.centerX,
            bottomHand.sliceInfo.centerY,
            bottomHand.sliceInfo.centerZ);

        //basis(group, bp);

        return bp.sub(tp).normalize();
    }

    function getArmSlices(rp, heightToCrotch, sliceRange, dir){
        var stopBottom = heightToCrotch;
        var depth = rp.y - stopBottom;

        var angleZ = -Math.atan2(dir.y, dir.x) + (Math.PI / 2);

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(-rp.x, -rp.y, -rp.z);

        // rotate Z
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationZ(angleZ);

        var matrix = matrixRot.multiply(matrixTrans);

        // slicing
        var countOfSlices = 32;
        var basicSlices = slicing.getSlices(matrix, countOfSlices, -depth, false, true);
        var handSlices = filterData(basicSlices, sliceRange, rp);

        clearEmptySlices(handSlices);

        var lStart = parseInt(handSlices.length * (3 / 4));
        var lastSliceInd = lStart;

        var lastWidth = null;
        for(var i = lStart; i < handSlices.length; i++){
            var sl = handSlices[i];

            var width = Math.max(sl.sliceInfo.maxZ - sl.sliceInfo.minZ, sl.sliceInfo.maxX - sl.sliceInfo.minX);

            if(!lastWidth || (lastWidth * 1.01) > width){
                lastWidth = width;
                lastSliceInd = i;
            }
            else{
                break;
            }
        }

        handSlices.length = lastSliceInd + 1;

        return handSlices;
    }


    function getLowerArmSlice(upperArmSlice, bodyParts){
        bodyParts.wrist.faces.sort(function(f1, f2){
            return f1.main.a.z - f2.main.a.z;
        });

        var el = bodyParts.elbow.faces[0].main.a;
        var wr = bodyParts.wrist.faces[0].main.a;

        //basis(group, el);
        //basis(group, wr);

        var dir = (new THREE.Vector3(el.x - wr.x, el.y - wr.y, el.z - wr.z)).normalize();

        var angleZ = -Math.atan2(dir.y, dir.x);
        var angleX = Math.PI / 2;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(-el.x, -el.y, -el.z);

        /*// rotate Y
        var matrixRotX = new THREE.Matrix4();
        matrixRotX.makeRotationX(angleX);*/

        // rotate Z
        var matrixRotZ = new THREE.Matrix4();
        matrixRotZ.makeRotationZ(angleZ);

        //var matrix1 = matrixRotX.multiply(matrixTrans);
        var matrix2 = matrixRotZ.multiply(matrixTrans);

        // slicing
        var basicSlices = slicing.getSlices(matrix2, 1, 0, false, true)[0];


        // clearing path
        var angleSliceX = -Math.atan2(dir.y, dir.x);
        // rotate Z
        var matrixSliceRotX = new THREE.Matrix4();
        matrixSliceRotX.makeRotationZ(angleSliceX);

        var sliceMatrix = matrixSliceRotX.multiply(matrixTrans);

        var faces = [];
        basicSlices.forEach(function(slice){
            for(var fc in slice.faces){
                var f = slice.faces[fc];
                var fm = f.main;

                if(fm.a.y > wr.y && fm.a.y < el.y){
                    faces.push(f);
                }
            }
        });
        var slice = {
            faces: faces
        };
        helpers.buildNormals(slice.faces);

        var pt = {
            x: 0,
            y: 0,
            z: 1
        };

        faces = [];
        for(var fc in slice.faces){
            var f = slice.faces[fc];
            var res = helpers.dot(f.normal, helpers.norm(pt));
            if(res < 0){
                faces.push(f);
            }
        }
        slice.faces = faces;
        slicing.calcData(slice);

        showSlice(slice, false, "blue");

        var lowerArmLength = slice.sliceInfo.len;
        var upperArmLength = upperArmSlice.sliceInfo.len;

        exports.armLength = lowerArmLength + upperArmLength;
        //exports.armLength = lowerArmLength + upperArmLength;


        return slice;
    }

    function getUpperArmSlice(rp, heightToCrotch, bodyParts){
        bodyParts.elbow.faces.sort(function(f1, f2){
            return f1.main.a.z - f2.main.a.z;
        });

        var m = bodyParts.elbow.faces[0].main.a;

        //basis(group, m)

        var dir = (new THREE.Vector3(rp.x - m.x, rp.y - m.y, rp.z - m.z)).normalize();

        var angleZ = Math.atan2(dir.z, dir.x);
        var angleX = Math.PI / 2;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(-rp.x, -rp.y, -rp.z);


        // rotate Y
        var matrixRotX = new THREE.Matrix4();
        matrixRotX.makeRotationX(angleX);

        // rotate Z
        var matrixRotZ = new THREE.Matrix4();
        matrixRotZ.makeRotationZ(angleZ);

        var matrix1 = matrixRotX.multiply(matrixTrans);
        var matrix2 = matrixRotZ.multiply(matrix1);

        // slicing
        var basicSlices = slicing.getSlices(matrix2, 1, 0, false, true)[0];


        // clearing path
        var angleSliceX = -Math.atan2(dir.y, dir.x);
        // rotate Z
        var matrixSliceRotX = new THREE.Matrix4();
        matrixSliceRotX.makeRotationZ(angleSliceX);

        var sliceMatrix = matrixSliceRotX.multiply(matrixTrans);

        basicSlices.forEach(function(slice){
            var faces = [];
            for(var fc in slice.faces){
                var f = slice.faces[fc];
                var fm = f.main;

                var f_t = {
                    a: fm.a.clone().applyMatrix4(sliceMatrix),
                    b: fm.b.clone().applyMatrix4(sliceMatrix),
                    c: fm.c.clone().applyMatrix4(sliceMatrix),
                };
                if(f_t.a.y > 0 && fm.a.y < rp.y/* && fm.a.y > m.y*/){
                    faces.push(f);
                }
            }
            slice.faces = faces;
        });

        for(var i = 0; i < basicSlices.length; i++){
            if(!basicSlices[i].faces.length){
                basicSlices.splice(i, 1);
                i--;
            }
        }

        var slice = basicSlices[0];

        slicing.calcData(slice);

        showSlice(slice, false, "red");

        exports.upperArmLength = slice.sliceInfo.len;

        return slice;
    }

    function getArmsData() {
        var rp = shoulderData.rightShoulderPoint;
        var heightToCrotch = verticalBodySlice.heightToCrotch;
        var sliceRange = chestData.rightRangeBustUnderRightHand;

        var dir = getArmDirectionVector(rp, heightToCrotch, sliceRange);
        var handSlices = getArmSlices(rp, heightToCrotch, sliceRange, dir);

        var lastSliceInd = handSlices.length - 1;

        var bodyParts = {
            wrist: handSlices[lastSliceInd],
            upperArm: handSlices[parseInt(lastSliceInd * 0.26)],
            elbow: handSlices[parseInt(lastSliceInd * 0.56)],
            middleForearm: handSlices[parseInt(lastSliceInd * 0.75)]
        };

        var upperArmSlice = getUpperArmSlice(rp, heightToCrotch, bodyParts);
        var lowerArmSlice = getLowerArmSlice(upperArmSlice, bodyParts);

        showSlice(bodyParts.wrist, false, "red");
        showSlice(bodyParts.elbow, false, "blue");
        showSlice(bodyParts.middleForearm, false, "darkred");
        showSlice(bodyParts.upperArm, false, "darkblue");


        console.log(">>> shoulderFromBackNeckLength: " + shoulderData.shoulderFromBackNeckLength);


        exports.armLengthFromSev =
            shoulderData.shoulderFromBackNeckLength +
            upperArmSlice.sliceInfo.len +
            lowerArmSlice.sliceInfo.len;

        exports.upperArmGirth = bodyParts.upperArm.sliceInfo.len;
        exports.middleForearmGirth = bodyParts.middleForearm.sliceInfo.len;
        exports.wristGirth = bodyParts.wrist.sliceInfo.len;
        exports.elbowGirth = bodyParts.elbow.sliceInfo.len;
    }

    function filterData(basicSlices, sliceRange, rp){
        return basicSlices.map(function (sl) {
            sl.sort(function (sl1, sl2) {
                return sl1.sliceInfo.maxX - sl2.sliceInfo.maxX;
            });
            var slice = sl[0];

            var handFaces = [];
            slice.faces.forEach(function (f) {
                var range = sliceRange - (rp.y - f.main.a.y - 0.1) * 0.3;

                if (Math.max(f.main.a.x, f.main.b.x, f.main.c.x) < range) {
                    handFaces.push(f);
                }
            });

            slice.faces = handFaces;

            slicing.calcData(slice);

            return slice;
        });
    }

    function clearEmptySlices(handSlices){
        for(var i = 0; i < handSlices.length; i++){
            if(handSlices[i].faces.length === 0){
                handSlices.splice(i, 1);
                i--;
            }
        }

    }

    exports.getArmsData = getArmsData;

})(typeof exports === 'undefined'? this['armsData']={}: exports);
