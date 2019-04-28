(function(exports){


    function getShoulderFaces(rs){
        var shoulderFaces = [];
        for(var soldF in rs){
            var sf = rs[soldF];

            if(sf.main.a.y < neckGirthAndCervicalHeightData.heightToNeck){
                shoulderFaces.push(sf);
            }
        }

        shoulderFaces.sort(function(f1, f2){
            return f2.a.y - f1.a.y;
        });

        shoulderFaces.length = Math.min(shoulderFaces.length, 10);

        return shoulderFaces;
    }

    function getShoulderData(){


        // left shoulder
        var angleZ = Math.PI / 5;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -neckGirthAndCervicalHeightData.heightToNeck, 0);

        // rotate Y
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationZ(angleZ);

        matrixTrans = matrixRot.multiply(matrixTrans);

        var rs = slicing.getVolume(matrixTrans)[0];
        var leftShoulderFaces = getShoulderFaces(rs);



        // right shoulder
        var angleZ = -(Math.PI / 5);

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -neckGirthAndCervicalHeightData.heightToNeck, 0);

        // rotate Y
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationZ(angleZ);

        matrixTrans = matrixRot.multiply(matrixTrans);

        var rs = slicing.getVolume(matrixTrans)[0];
        var rightShoulderFaces = getShoulderFaces(rs);

        showSlice(leftShoulderFaces, false, "purple");
        showSlice(rightShoulderFaces, false, "purple");

        getShoulderLength(rightShoulderFaces);
        getShoulderFromBackNeckLength(rightShoulderFaces);

        getAkromionWide(leftShoulderFaces, rightShoulderFaces);

        exports.rightShoulderPoint = rightShoulderFaces[0].main.a;
        exports.leftShoulderPoint = leftShoulderFaces[0].main.a;
    }

    function getShoulderLength(rightShoulderFaces){
        var nr = neckGirthAndCervicalHeightData.neckRightPoint;
        var sp = rightShoulderFaces[0];

        var direction = {
            x: nr.main.a.x - sp.main.a.x,
            y: nr.main.a.y - sp.main.a.y,
            z: nr.main.a.z - sp.main.a.z
        };

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        //matrixTrans.makeTranslation(nr.main.a.x, nr.main.a.y, nr.main.a.z);
        matrixTrans.makeTranslation(nr.main.a.x, nr.main.a.y, -nr.main.a.z);

        // rotate X
        var matrixRotX = new THREE.Matrix4();
        matrixRotX.makeRotationX(Math.PI / 2);


        // rotate Y
        var angleY = Math.atan2(direction.z, direction.x) - Math.PI;
        var matrixRotY = new THREE.Matrix4();
        matrixRotY.makeRotationY(angleY);


        matrixRotX = matrixRotX.multiply(matrixRotY);
        var matrixRes2 = matrixRotX.multiply(matrixTrans);

        // slicing
        var resultSlices = slicing.getSlices(matrixRes2, 1, 0, false, true);

        var shoulderSlices = resultSlices[0][0];

        var shoulderFaces = [];

        var shoulderLength = 0;
        for(var ss in shoulderSlices.faces){
            var s = shoulderSlices.faces[ss];

            if(
                s.main.a.x < nr.main.a.x && s.main.a.x > sp.main.a.x &&
                s.main.a.y < nr.main.a.y && s.main.a.y > sp.main.a.y
            ){
                shoulderFaces.push(s);
                shoulderLength += s.len;
            }
        }

        showSlice(shoulderFaces, false, "green");
        exports.shoulderLength = shoulderLength;
    }

    function getShoulderFromBackNeckLength(rightShoulderFaces){
        var nr = neckGirthAndCervicalHeightData.neckBackPoint;
        var sp = rightShoulderFaces[0];

        var direction = {
            x: nr.main.a.x - sp.main.a.x,
            y: nr.main.a.y - sp.main.a.y,
            z: nr.main.a.z - sp.main.a.z
        };

        var angleY = Math.atan2(direction.z, direction.x) - Math.PI;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        var matrixRotX = new THREE.Matrix4();
        var matrixRotY = new THREE.Matrix4();

        matrixTrans.makeTranslation(nr.main.a.x, nr.main.a.y, -nr.main.a.z);
        matrixRotX.makeRotationX(Math.PI / 2);
        matrixRotY.makeRotationY(angleY);

        matrixRotX = matrixRotX.multiply(matrixRotY);
        var matrixRes2 = matrixRotX.multiply(matrixTrans);

        var resultSlices = slicing.getSlices(matrixRes2, 1, 0, false, true);

        var shoulderSlices = resultSlices[0][0];

        var shoulderFaces = [];

        var shoulderLength = 0;
        for(var ss in shoulderSlices.faces){
            var s = shoulderSlices.faces[ss];

            if(
                s.main.a.x < /*nr.main.a.x*/ 0 &&
                s.main.a.x > sp.main.a.x &&
                s.main.a.y < (nr.main.a.y * 1.04) &&
                s.main.a.y > sp.main.a.y
            ){
                shoulderFaces.push(s);
                shoulderLength += s.len;
            }
        }

        showSlice(shoulderFaces, false, "darkgreen", 1);
        exports.shoulderFromBackNeckLength = shoulderLength;
    }

    function getAkromionWide(leftShoulderFaces, rightShoulderFaces){

        // translate Y
        var rightShoulderHeight = rightShoulderFaces[0].main.a.y;

        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -rightShoulderHeight, 0);

        var results = slicing.getSlices(matrixTrans, 1, 0, false, true)[0][0];

        var leftShoulderPoint = leftShoulderFaces[0];
        var rightShoulderPoint = rightShoulderFaces[0];

        var leftBack = [];
        var leftFront = [];
        var rightBack = [];
        var rightFront = [];

        for(var res in results.faces){
            var r = results.faces[res];

            if(r.main.a.x > 0){
                //left
                if(r.main.a.z > leftShoulderPoint.main.a.z){
                    //front
                    leftFront.push(r);
                }else{
                    //back
                    leftBack.push(r);
                }
            }else{
                // right
                if(r.main.a.z > rightShoulderPoint.main.a.z){
                    //front
                    rightFront.push(r);
                }else{
                    //back
                    rightBack.push(r);
                }
            }
        }

        var akromionWide = 0;

        for(var lb in leftBack){
            var l = leftBack[lb];
            akromionWide += l.len;
        }

        for(var rb in rightBack){
            var r = rightBack[rb];
            akromionWide += r.len;
        }

        showSlice(rightBack, false, "orange");
        showSlice(leftBack, false, "orange");

        exports.akromionWide = akromionWide;
    }

    exports.getShoulderData = getShoulderData;


})(typeof exports === 'undefined'? this['shoulderData']={}: exports);
