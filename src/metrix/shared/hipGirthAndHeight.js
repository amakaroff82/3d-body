(function(exports){


    function getHipGirthAndHeight(context){

        var countOfSlices = 20;

        var bottomStart = 0.46;
        var topEnd = 0.57;
        var depth = topEnd - bottomStart;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -bottomStart, 0);

        // slicing
        var resultSlices = slicing.getSlices(matrixTrans, countOfSlices, depth, context.showSlices, true);

        // looking to slice with max length
        var minLen = Infinity;
        var maxSlice = null;
        var index = -1;

        for(var i = 0; i < resultSlices.length; i++){
            var slice = resultSlices[i][0];

            if(context.showSlices) {
                //showSlice(slice, false, "black");
            }

            if(minLen > slice.sliceInfo.minZ){
                maxSlice = slice;
                minLen = Math.min(minLen, slice.sliceInfo.minZ);
                index = i;
            }
        }

        if(true /*context.showSlices*/) {
            showSlice(maxSlice, false, "red");
        }

        var hipCenterX = ((maxSlice.sliceInfo.maxX - maxSlice.sliceInfo.minX) / 2) + maxSlice.sliceInfo.minX;
        var hipCenterZ = ((maxSlice.sliceInfo.maxZ - maxSlice.sliceInfo.minZ) / 2) + maxSlice.sliceInfo.minZ;


        exports.hipCenterZ = hipCenterZ;
        exports.hipCenterX = hipCenterX;
        exports.hipGirth = maxSlice.sliceInfo.len;
        exports.heightToHip = maxSlice.sliceInfo.maxY;
    }

    exports.getHipGirthAndHeight = getHipGirthAndHeight;

})(typeof exports === 'undefined'? this['hipGirthAndHeight']={}: exports);
