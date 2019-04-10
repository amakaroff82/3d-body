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
        var resultSlices = slicing.getSlices(matrix, 1, 0, context.showSlices, true);

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


        var minSlice = resultSlices[0][0];

        var heightToNeck = neckGirthAndCervicalHeightData.heightToNeck;
        var heightToHip = hipGirthAndHeight.heightToHip;

        var faces = [];
        var len = 0;

        var minSliceY = minSlice.sliceInfo.minY;

        minSlice.faces.forEach(function(face){
            var fc = face.main;
            if(fc.a.z < 0 && fc.a.y < heightToNeck && fc.a.y > heightToHip){
                faces.push(face);
                len += face.len;
            }
        });

        minSlice.faces = faces;

        if(true /*context.showSlices*/) {
            showSlice(minSlice, false, "red");
        }

        exports.heightToCrotch = minSlice.minY;
        exports.backSideLength = len;
        exports.trunckLength = heightToNeck - minSliceY;
    }

    exports.getVerticalBodySlice = getVerticalBodySlice;

})(typeof exports === 'undefined'? this['verticalBodySlice']={}: exports);
