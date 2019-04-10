(function(exports){

    function getNeckGirthAndCervicalHeightData(context){

        var detectionLevel = 1.2;
        var countOfSlices = 20;

        var angleX = -0.39;

        var bottomStart = 0.75;
        var topEnd = 0.85;
        var depth = topEnd - bottomStart;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -bottomStart, 0);

        // rotate X
        var matrixRot = new THREE.Matrix4();
        matrixRot.makeRotationX(angleX);

        var matrix = matrixTrans.multiply(matrixRot);

        // slicing
        var resultSlices = slicing.getSlices(matrix, countOfSlices, depth, true || context.showSlices, true);



        // looking to slice with min length
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
        }

        // moving down from min length slice to detection level
        for(var i = index; i >= 0; i--){
            var slice = resultSlices[i][0];

            if(minLen < (slice.sliceInfo.len / detectionLevel)){
                if(true /*context.showSlices*/) {
                    showSlice(minSlice, false, "red");
                    showSlice(slice, false, "blue");
                }


                var neckRightPoint = minSlice.faces.sort(function(f1, f2){
                    return f2.a.x - f1.a.x;
                })[0];

                exports.neckRightPoint = neckRightPoint;
                exports.neckGirth = minSlice.sliceInfo.len;
                exports.neckBaseDiameter = slice.sliceInfo.maxX - slice.sliceInfo.minX;
                exports.neckBaseGirth = slice.sliceInfo.len;
                exports.heightToNeck = slice.sliceInfo.maxY;
                exports.neckBaseCenter = slice.sliceInfo.centerY;

                return ;
            }
        }


        if(true /*context.showSlices*/) {
            showSlice(minSlice, false, "red");
        }

        var neckRightPoint = minSlice.faces.sort(function(f1, f2){
            return f2.a.x - f1.a.x;
        });

        exports.neckGirth = minSlice.sliceInfo.len;
        exports.neckRightPoint = neckRightPoint[0];
        exports.neckBaseDiameter = minSlice.sliceInfo.maxX - minSlice.sliceInfo.minX;
        exports.neckBaseGirth = minSlice.sliceInfo.len;
        exports.heightToNeck = minSlice.sliceInfo.maxY;
        exports.neckBaseCenter = minSlice.sliceInfo.centerY;
    }

    exports.getNeckGirthAndCervicalHeightData = getNeckGirthAndCervicalHeightData;

})(typeof exports === 'undefined'? this['neckGirthAndCervicalHeightData']={}: exports);
