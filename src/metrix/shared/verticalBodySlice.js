(function(exports){

    function getVerticalBodySlice(context){
        var angleZ = Math.PI / 2;
        var posX = -hipGirthAndHeight.hipCenterX;

        // rotate X
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationZ(angleZ);

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(posX, 0, 0);


        var matrix = matrixRot.multiply(matrixTrans);

        // slicing
        var verticalBodySlice = slicing.getSlices(matrix, 1, 0, context.showSlices, true)[0][0];

    /*    // looking to slice with min length
        var minLen = Infinity;
        var minSlice = null;
        var index = -1;

        for(var i = 0; i < resultSlices.length; i++){
            var slice = resultSlices[i][0];

            if(minLen > slice.sliceInfo.len){
                minSlice = slice;
                minLen = Math.min(minLen, slice.sliceInfo.len);
                index = i;
            }
        }*/
    /*    // moving down from min length slice to detection level
        for(var i = index; i >= 0; i--){
            var slice = resultSlices[i][0];

            if(minLen < (slice.sliceInfo.len / detectionLevel)){
                if(context.showSlices) {
                    showSlice(minSlice, false, "red");
                    showSlice(slice, false, "blue");
                }

                neckGirthAndCervicalHeightData = {
                    neckBaseDiameter: slice.sliceInfo.maxX - slice.sliceInfo.minX,
                    neckGirth: minSlice.sliceInfo.len,
                    neckBaseGirth: slice.sliceInfo.len,
                    cervicalHeight: slice.sliceInfo.maxY
                };

                return ;
            }
        }*/

        var heightToNeck = neckGirthAndCervicalHeightData.heightToNeck;
        var heightToHip = hipGirthAndHeight.heightToHip;
        var waistHeight = chestData.waistHeight;

        var backSideFaces = [];
        var backSideLength = 0;

        var crotchLengthFrontFaces = [];
        var crotchLengthFrontLength = 0;

        var totalCrotchLengthFaces = [];
        var totalCrotchLength = 0;

        var backWaistLengthFaces = [];
        var backWaistLength = 0;

        var minSliceY = verticalBodySlice.sliceInfo.minY;

        verticalBodySlice.faces.forEach(function(face){
            var fc = face.main;
            if(fc.a.z < 0 && fc.a.y < heightToNeck && fc.a.y > heightToHip){
                backSideFaces.push(face);
                backSideLength += face.len;
            }

            if(fc.a.y < waistHeight && fc.a.z > hipGirthAndHeight.hipCenterZ){
                crotchLengthFrontFaces.push(face);
                crotchLengthFrontLength += face.len;
            }


            if(fc.a.y < waistHeight && fc.a.z > hipGirthAndHeight.hipCenterZ){
                totalCrotchLengthFaces.push(face);
                totalCrotchLength += face.len;
            }

            if(fc.a.y < heightToNeck && fc.a.z <= hipGirthAndHeight.hipCenterZ){
                totalCrotchLengthFaces.push(face);
                totalCrotchLength += face.len;
            }

            if(fc.a.y < heightToNeck && fc.a.y > chestData.waistHeight && fc.a.z <= hipGirthAndHeight.hipCenterZ){
                backWaistLengthFaces.push(face);
                backWaistLength += face.len;
            }

        });

        //verticalBodySlice.faces = faces;

        if(true /*context.showSlices*/) {
            showSlice(crotchLengthFrontFaces, false, "#aa33aa");
            showSlice(backSideFaces, false, "#33aaaa");
            showSlice(totalCrotchLengthFaces, false, "#aaaa33");
            showSlice(backWaistLengthFaces, false, "#33aa33");
        }


        exports.backWaistLength = backWaistLength;
        exports.crotchLengthFrontLength = crotchLengthFrontLength;
        exports.totalCrotchLength = totalCrotchLength;

        exports.heightToCrotch = verticalBodySlice.sliceInfo.minY;
        exports.backSideLength = backSideLength;
        exports.trunckLength = heightToNeck - minSliceY;
    }

    exports.getVerticalBodySlice = getVerticalBodySlice;

})(typeof exports === 'undefined'? this['verticalBodySlice']={}: exports);
