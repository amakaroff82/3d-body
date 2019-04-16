(function(exports){


    function getMaxSlice(slices){
        var maxZ = -Infinity;
        var maxZSlice = null;

        for(var i = 0; i < slices.length; i++){
            var s = slices[i];
            if(maxZ < s[0].sliceInfo.maxZ){
                maxZ = s[0].sliceInfo.maxZ;
                maxZSlice = s[0];
            }

            if(maxZ > (s[0].sliceInfo.maxZ * 1.0001)){
                return s[0];
            }
        }

        return maxZSlice;
    }


    function getChestData(context){
        var countOfSlices = 20;

        var angleY = 0.0;

        var bodyFinish = neckGirthAndCervicalHeightData.neckBaseCenter;
        var bodyStart = hipGirthAndHeight.heightToHip;

        var range = bodyFinish - bodyStart;

        var sliceShift = 0.02;

        var chestRange = bodyStart + (range * (2/3));
        var waistRange = bodyStart + (range * (1/3));


        var chestTopEnd = chestRange - (sliceShift * 2);
        var chestBottomStart = chestRange + sliceShift;
        var chestDepth = chestTopEnd - chestBottomStart;


        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -chestBottomStart, 0);

        // rotate Y
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationY(angleY);

        matrixTrans = matrixRot.multiply(matrixTrans);

        // slicing
        var resultSlices = slicing.getSlices(matrixTrans, countOfSlices, chestDepth, context.showSlices);

        var bustSlice = getMaxSlice(resultSlices);

        var parts = helpers.splitBodyParts(bustSlice);
        var leftSide = parts[0];
        var rightSide = parts[1];

        if(true/* context.showSlices*/) {
            showSlice(leftSide, false, "orange");
            showSlice(rightSide, false, "orange");
        }


        // bust width
        var center = new THREE.Vector3(0, 0, 1);

        leftSide.faces = leftSide.faces.filter(function(f){
            return f.main.a.z > (leftSide.sliceInfo.maxZ / 2) && helpers.dot(f.normal, center) > 0.8;
        });

        leftSide.faces.sort(function(f1, f2){
            return f2.a.x - f1.a.x;
        });

        var leftS = leftSide.faces[0];


        rightSide.faces = rightSide.faces.filter(function(f){
            return f.main.a.z > (rightSide.sliceInfo.maxZ / 2) && helpers.dot(f.normal, center) > 0.8;
        });

        rightSide.faces.sort(function(f1, f2){
            return f1.a.x - f2.a.x;
        });

        var rightS = rightSide.faces[0];


        var bustWidth = leftS.a.x - rightS.a.x;

        showSlice(leftSide, false, "black");
        showSlice(rightSide, false, "black");


        //

        var nr = neckGirthAndCervicalHeightData.neckRightPoint;

        var direction = helpers.norm({
            x: rightS.main.a.x - nr.main.a.x,
            y: rightS.main.a.y - nr.main.a.y,
            z: rightS.main.a.z - nr.main.a.z
        });

        // translate Y
        matrixTrans = new THREE.Matrix4();
        //matrixTrans.makeTranslation(nr.main.a.x, nr.main.a.y, nr.main.a.z);
        matrixTrans.makeTranslation(-nr.main.a.x, nr.main.a.y, nr.main.a.z);

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
        var resultSlices = slicing.getSlices(matrixRes2, 1, 0, context.showSlices, true);

        var frontWaistLineSlice = resultSlices[0][0];

        //bustSlice
        var underBustWaistLineFaces = [];
        var frontWaistLineFaces = [];
        var neckShoulderPointToBustLength = 0;

        frontWaistLineSlice.faces.forEach(function(f){
            if( f.main.a.y > bustSlice.sliceInfo.maxY &&
                f.main.a.z > nr.main.a.z){
                frontWaistLineFaces.push(f);
                neckShoulderPointToBustLength += f.len;
            }

            if( f.main.a.y < bustSlice.sliceInfo.maxY &&
                f.main.a.y > bustSlice.sliceInfo.maxY * 0.95 &&
                f.main.a.z > nr.main.a.z){
                underBustWaistLineFaces.push(f);
            }
        });

        underBustWaistLineFaces.sort(function(f1, f2){
            return f2.main.a.z - f1.main.a.z;
        });


        var fromTopToDown = new THREE.Vector3(0,-1,0);
        helpers.buildNormals(underBustWaistLineFaces);

        var minZFace = null;
        for(var face in underBustWaistLineFaces){
            var f = underBustWaistLineFaces[face];

            var burstDown = helpers.dot(f.normal, fromTopToDown);
            if(burstDown > 0.45){
                minZFace = f;
            }
        }

        var middleUnderburst = bustSlice.sliceInfo.maxY - ((bustSlice.sliceInfo.maxY - (bustSlice.sliceInfo.maxY * 0.95)) / 2);

        underBustWaistLineFaces.sort(function(f1, f2){
            return f2.main.a.y - f1.main.a.y;
        });

        if(!minZFace) {
            for (var face in underBustWaistLineFaces) {
                var f = underBustWaistLineFaces[face];

                if (f.main.a.y < middleUnderburst) {

                    minZFace = f;

                    break;
                }
            }
        }

        var underBustGirthHeight = minZFace.main.a.y; // = underBustWaistLineFaces[underBustWaistLineFaces.length / 2];


        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -underBustGirthHeight, 0);

        // slicing
        var underbustSlice = slicing.getSlices(matrixTrans, 1, 0, context.showSlices);
        underbustSlice = underbustSlice[0][0];

        var parts = helpers.splitBodyParts(underbustSlice);

        var leftSide = parts[0];
        var rightSide = parts[1];


        if(true || context.showSlices){
            showSlice(frontWaistLineFaces, false, "#bb6600");
            showSlice(underBustWaistLineFaces, false, "#00bb66");
            showSlice(leftSide, false, "#66bbbb");
            showSlice(rightSide, false, "#bbbb66");
        }

        var chestGirth = leftSide.sliceInfo.len + rightSide.sliceInfo.len;
        var bustHeight = Math.max(leftSide.sliceInfo.maxY, rightSide.sliceInfo.maxY);
        var waistHeight = (bustHeight - hipGirthAndHeight.heightToHip) / 2 + hipGirthAndHeight.heightToHip;
        var middleHipHeight = (bustHeight - hipGirthAndHeight.heightToHip) / 4 + hipGirthAndHeight.heightToHip;

        var maxWaistHeight = (waistHeight - middleHipHeight) / 3 + middleHipHeight;


        // waist girth


        matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -waistHeight, 0);

        resultSlices = slicing.getSlices(matrixTrans, 1, 0, context.showSlices, true);
        var waistSlice = resultSlices[0][0];
        if(true || context.showSlices){
            showSlice(waistSlice, false, "blue")
        }

        var waistGirth = waistSlice.sliceInfo.len;
        var frontWaistLineLength = neckShoulderPointToBustLength + (bustSlice.sliceInfo.maxY - waistSlice.sliceInfo.maxY);


        // maxWaistGirth

        matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -maxWaistHeight, 0);

        resultSlices = slicing.getSlices(matrixTrans, 1, 0, context.showSlices, true);
        var maxWaistSlice = resultSlices[0][0];
        if(true || context.showSlices){
            showSlice(maxWaistSlice, false, "orange")
        }

        var maxWaistGirth = maxWaistSlice.sliceInfo.len;





        // middle hip


        matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -middleHipHeight, 0);

        resultSlices = slicing.getSlices(matrixTrans, 1, 0, context.showSlices, true);
        var middleHipSlice = resultSlices[0][0];
        if(true || context.showSlices){
            showSlice(middleHipSlice, false, "blue")
        }

        var middleHipGirth = middleHipSlice.sliceInfo.len;



        ////// outside leg length


        var maxSlices = middleHipSlice.faces.sort(function(f1, f2){
            return f2.a.x - f1.a.x;
        });

        var angleX = Math.PI / 2;
        var maxXFace = maxSlices[0];
        var depthOfSlice =  maxXFace.a.z;

        matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -depthOfSlice, 0);

        // rotate Y
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationX(angleX);

        matrixTrans = matrixRot.multiply(matrixTrans);

        resultSlices = slicing.getSlices(matrixTrans, 1, 0, context.showSlices, true);
        var leftLegSlice = resultSlices[0][0];
        leftLegSlice.faces = leftLegSlice.faces.filter(function(face){
            var f = face.main;
            return (f.a.x > 0) && (f.a.x < maxXFace.a.x * 1.1) && f.a.y > hipGirthAndHeight.heightToHip && f.a.y < waistHeight;
        });

        slicing.calcData(leftLegSlice);

        if(true || context.showSlices){
            showSlice(leftLegSlice, false, "red")
        }

        var waistToHip = leftLegSlice.sliceInfo.len;
        var outsideLegLength = waistToHip + hipGirthAndHeight.heightToHip;

        exports.underbustGirst = underbustSlice.sliceInfo.len;
        exports.frontWaistLineLength = frontWaistLineLength;
        exports.neckShoulderPointToBustLength = neckShoulderPointToBustLength;
        exports.waistHeight = waistHeight;
        exports.waistGirth = waistGirth;
        exports.waistToHip = waistToHip
        exports.chestGirth = chestGirth;
        exports.bustHeight = bustHeight;
        exports.middleHipGirth = middleHipGirth;
        exports.outsideLegLength = outsideLegLength;
        exports.maxWaistGirth = maxWaistGirth;
        exports.bustPointDist = bustWidth;
    }

    exports.getChestData = getChestData;

})(typeof exports === 'undefined'? this['chestData']={}: exports);
