(function(exports){

    function getMaxZSlice(slices){
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

    function getBust(){
        var countOfSlices = 20;
        var angleY = 0.0;
        var bodyFinish = neckGirthAndCervicalHeightData.neckBaseCenter;
        var bodyStart = hipGirthAndHeight.heightToHip;
        var range = bodyFinish - bodyStart;
        var sliceShift = 0.02;

        var chestRange = bodyStart + (range * (2/3));
        var chestTopEnd = chestRange - (sliceShift * 2);
        var chestBottomStart = chestRange + sliceShift;
        var chestDepth = chestTopEnd - chestBottomStart;

        var matrixTrans = new THREE.Matrix4();
        var matrixRot = new THREE.Matrix4();

        matrixTrans.makeTranslation(0, -chestBottomStart, 0);
        matrixRot.makeRotationY(angleY);
        matrixTrans = matrixRot.multiply(matrixTrans);

        // slicing
        var resultSlices = slicing.getSlices(matrixTrans, countOfSlices, chestDepth, false);
        var bustSlice = getMaxZSlice(resultSlices);
        var parts = helpers.splitBodyParts(bustSlice);
        var leftBustSide = parts.left;
        var rightBustSide = parts.right;
        var chestLen = parts.len;

        slicing.calcData(leftBustSide);
        slicing.calcData(rightBustSide);
        exports.rightRangeBustUnderRightHand = rightBustSide.sliceInfo.minX;

        if(false/* context.showSlices*/) {
            showSlice(leftBustSide, false, "orange");
            showSlice(rightBustSide, false, "orange");
        }

        var chestGirth = chestLen; //leftBustSide.sliceInfo.len + rightBustSide.sliceInfo.len;
        var chestHeight = leftBustSide.sliceInfo.minY;

/*        showSlice(leftBustSide, false, "#66bbbb");
        showSlice(rightBustSide, false, "#bbbb66");*/

        return {
            left: leftBustSide,
            right: rightBustSide,
            chestGirth: chestGirth,
            chestHeight: chestHeight
        }
    };

    function getNipples(leftBustSide, rightBustSide){

        var center = new THREE.Vector3(0, 0, 1);

        leftBustSide.faces = leftBustSide.faces.filter(function(f){
            return f.main.a.z > (leftBustSide.sliceInfo.maxZ / 2) && helpers.dot(f.normal, center) > 0.8;
        });

        leftBustSide.faces.sort(function(f1, f2){
            return f2.a.x - f1.a.x;
        });

        var leftS = leftBustSide.faces[0];

        rightBustSide.faces = rightBustSide.faces.filter(function(f){
            return f.main.a.z > (rightBustSide.sliceInfo.maxZ / 2) && helpers.dot(f.normal, center) > 0.8;
        });

        rightBustSide.faces.sort(function(f1, f2){
            return f1.a.x - f2.a.x;
        });

        var rightS = rightBustSide.faces[0];

        var bustWidth = leftS.a.x - rightS.a.x;

        showSlice(leftBustSide, false, "black");
        showSlice(rightBustSide, false, "black");

        return {
            bustWidth: bustWidth,
            rightS: rightS,
            leftS: leftS
        };
    }

    function getFrontWaistLine(rightS, chestHeight){

        var nr = neckGirthAndCervicalHeightData.neckRightPoint;

        var direction = helpers.norm({
            x: rightS.main.a.x - nr.main.a.x,
            y: rightS.main.a.y - nr.main.a.y,
            z: rightS.main.a.z - nr.main.a.z
        });

        var angleY = Math.atan2(direction.z, direction.x) - Math.PI;

        var matrixTrans = new THREE.Matrix4();
        var matrixRotX = new THREE.Matrix4();
        var matrixRotY = new THREE.Matrix4();

        matrixTrans.makeTranslation(-nr.main.a.x, nr.main.a.y, nr.main.a.z);
        matrixRotX.makeRotationX(Math.PI / 2);
        matrixRotY.makeRotationY(angleY);

        matrixRotX = matrixRotX.multiply(matrixRotY);
        var matrixRes2 = matrixRotX.multiply(matrixTrans);

        // slicing
        var frontWaistLineSlice = slicing.getSlices(matrixRes2, 1, 0, false, true)[0][0];

        //bustSlice
        var underBustWaistLineFaces = [];
        var frontWaistLineFaces = [];
        var neckShoulderPointToBustLength = 0;

        frontWaistLineSlice.faces.forEach(function(f){
            if( f.main.a.y > chestHeight &&
                f.main.a.z > nr.main.a.z){
                frontWaistLineFaces.push(f);
                neckShoulderPointToBustLength += f.len;
            }

            if( f.main.a.y < chestHeight &&
                f.main.a.y > chestHeight * 0.95 &&
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

        var middleUnderburst = chestHeight - ((chestHeight - (chestHeight * 0.95)) / 2);

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

        if(true || context.showSlices){
            showSlice(frontWaistLineFaces, false, "#bb6600");
            showSlice(underBustWaistLineFaces, false, "#00bb66");
        }

        var underBustGirthHeight = minZFace.main.a.y; // = underBustWaistLineFaces[underBustWaistLineFaces.length / 2];

        return {
            underBustGirthHeight: underBustGirthHeight,
            neckShoulderPointToBustLength: neckShoulderPointToBustLength
        }
    }

    function getUnderbust(frontWaistLine){
        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -frontWaistLine.underBustGirthHeight, 0);

        // UNDERBUST
        var underbustSlice = slicing.getSlices(matrixTrans, 1, 0, false, true)[0][0];
        var underbustGirst = underbustSlice.sliceInfo.len;

        showSlice(underbustSlice, false, "blue");

        return {
            underbustGirst: underbustGirst
        }
    }

    function getFrontWaist(bust, frontWaistLine, waistHeight){

        // waist girth

        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -waistHeight, 0);

        var waistSlice = slicing.getSlices(matrixTrans, 1, 0, false, true)[0][0];

        if(true || context.showSlices){
            showSlice(waistSlice, false, "blue");
        }

        var waistGirth = waistSlice.sliceInfo.len;
        var frontWaistLineLength = frontWaistLine.neckShoulderPointToBustLength + (bust.chestHeight - waistSlice.sliceInfo.maxY);

        return {
            waistGirth: waistGirth,
            frontWaistLineLength: frontWaistLineLength
        }
    }

    function getMaxWaist(maxWaistHeight){

        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -maxWaistHeight, 0);

        var maxWaistSlice = slicing.getSlices(matrixTrans, 1, 0, false, true)[0][0];
        if(true || context.showSlices){
            showSlice(maxWaistSlice, false, "orange")
        }

        var maxWaistGirth = maxWaistSlice.sliceInfo.len;

        return {
            maxWaistGirth: maxWaistGirth
        }
    }

    function getMiddleHip(middleHipHeight){
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -middleHipHeight, 0);

        var middleHipSlice = slicing.getSlices(matrixTrans, 1, 0, false, true)[0][0];
        if(true || context.showSlices){
            showSlice(middleHipSlice, false, "blue")
        }

        var middleHipGirth = middleHipSlice.sliceInfo.len;

        return {
            middleHipGirth: middleHipGirth,
            middleHipSlice: middleHipSlice
        }
    }

    function getLeg(middleHipSlice, waistHeight){
        var maxSlices = middleHipSlice.faces.sort(function(f1, f2){
            return f2.a.x - f1.a.x;
        });

        var angleX = Math.PI / 2;
        var maxXFace = maxSlices[0];
        var depthOfSlice =  maxXFace.a.z;

        var matrixTrans = new THREE.Matrix4();
        var matrixRot = new THREE.Matrix4();

        matrixTrans.makeTranslation(0, -depthOfSlice, 0);
        matrixRot.makeRotationX(angleX);

        matrixTrans = matrixRot.multiply(matrixTrans);

        var leftLegSlice = slicing.getSlices(matrixTrans, 1, 0, false, true)[0][0];

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

        return {
            outsideLegLength: outsideLegLength,
            waistToHip: waistToHip
        }
    }

    function getChestData(){

        var bust = getBust();

        var nipples = getNipples(bust.left, bust.right);

        var frontWaistLine = getFrontWaistLine(nipples.rightS, bust.chestHeight);

        var bustHeight = bust.chestHeight;
        var waistHeight = (bustHeight - hipGirthAndHeight.heightToHip) / 2 + hipGirthAndHeight.heightToHip;
        var middleHipHeight = (bustHeight - hipGirthAndHeight.heightToHip) / 4 + hipGirthAndHeight.heightToHip;
        var maxWaistHeight = (waistHeight - middleHipHeight) / 3 + middleHipHeight;

        var underbust = getUnderbust(frontWaistLine);

        var frontWaist = getFrontWaist(bust, frontWaistLine, waistHeight);

        var maxWaist = getMaxWaist(maxWaistHeight);

        var middleHip = getMiddleHip(middleHipHeight);

        var leg = getLeg(middleHip.middleHipSlice, waistHeight);

        exports.bustHeight = bustHeight;

        exports.underbustGirst = underbust.underbustGirst;

        exports.frontWaistLineLength = frontWaist.frontWaistLineLength;
        exports.waistGirth = frontWaist.waistGirth;

        exports.neckShoulderPointToBustLength = frontWaistLine.neckShoulderPointToBustLength;

        exports.waistHeight = waistHeight;

        exports.chestGirth = bust.chestGirth;
        exports.middleHipGirth = middleHip.middleHipGirth;
        exports.maxWaistGirth = maxWaist.maxWaistGirth;

        exports.bustPointDist = nipples.bustWidth;

        exports.outsideLegLength = leg.outsideLegLength;
        exports.waistToHip = leg.waistToHip;
    }

    exports.getChestData = getChestData;

})(typeof exports === 'undefined'? this['chestData']={}: exports);
