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
        var resultSlices = slicing.getSlices(matrixTrans, countOfSlices, chestDepth, true || context.showSlices);

        var maxZSlice = getMaxSlice(resultSlices);

        var parts = helpers.splitBodyParts(maxZSlice);
        var leftSide = parts[0];
        var rightSide = parts[1];

        if(true/* context.showSlices*/) {
            //showSlice(leftSide, false, "purple");
            showSlice(rightSide, false, "orange");
        }


        // bust width
        var center = new THREE.Vector3(0, 0, 1);

        leftSide.faces = leftSide.faces.filter(function(f){
            return helpers.dot(f.normal, center) > 0.8;
        });

        leftSide.faces.sort(function(f1, f2){
            return f2.a.x - f1.a.x;
        });

        var leftS = leftSide.faces[0];


        rightSide.faces = rightSide.faces.filter(function(f){
            return helpers.dot(f.normal, center) > 0.8;
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
            x: rightS.a.x - nr.a.x,
            y: rightS.a.y - nr.a.y,
            z: rightS.a.z - nr.a.z
        });


        var angleY = direction.y;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -chestBottomStart, 0);

        // rotate Y
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationY(angleY);

        matrixTrans = matrixRot.multiply(matrixTrans);

        // slicing
        var resultSlices = slicing.getSlices(matrixTrans, countOfSlices, chestDepth, true || context.showSlices);








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

        var outsideLegLength = leftLegSlice.sliceInfo.len + hipGirthAndHeight.heightToHip;

        exports.waistHeight = waistHeight;
        exports.waistGirth = waistGirth;
        exports.chestGirth = chestGirth;
        exports.bustHeight = bustHeight;
        exports.middleHipGirth = middleHipGirth;
        exports.outsideLegLength = outsideLegLength;
        exports.maxWaistGirth = maxWaistGirth;
        exports.bustPointDist = bustWidth;
    }

    exports.getChestData = getChestData;

})(typeof exports === 'undefined'? this['chestData']={}: exports);
