(function(exports){


    exports.allFaces = [];


    function lerp (start, end, amt){
        return (1-amt)*start+amt*end
    }

    function normalizeAxias(position, axias, normalize){
        //console.log("Vertices Normalizing");

        var pointStep = 3;
        var pointsCount = position.length / pointStep;

        for(var i = 0; i < pointsCount; i++) {
            var p = position;
            p[i * pointStep + 0] -= axias.center_x;
            p[i * pointStep + 1] -= axias.center_y;
            p[i * pointStep + 2] -= axias.center_z;
        }

        if(normalize){
            var max_length = Math.max(
                axias.length_x,
                axias.length_y,
                axias.length_z);

            for(i = 0; i < pointsCount; i++) {
                p = position;
                p[i * pointStep + 0] = p[i * pointStep + 0] / max_length;
                p[i * pointStep + 1] = p[i * pointStep + 1] / max_length;
                p[i * pointStep + 2] = p[i * pointStep + 2] / max_length;
            }
        }
    }

    function getAxias(position, bottomShift){
        var axias = {
            min_x: Infinity,
            min_y: Infinity,
            min_z: Infinity,
            max_x: -Infinity,
            max_y: -Infinity,
            max_z: -Infinity
        };

        var pointStep = 3;
        var pointsCount = position.length / pointStep;

        for(var i = 0; i < pointsCount; i++) {
            var p = position;
            var x = p[i * pointStep + 0];
            var y = p[i * pointStep + 1];
            var z = p[i * pointStep + 2];

            axias.min_x = Math.min(axias.min_x, x);
            axias.min_y = Math.min(axias.min_y, y);
            axias.min_z = Math.min(axias.min_z, z);

            axias.max_x = Math.max(axias.max_x, x);
            axias.max_y = Math.max(axias.max_y, y);
            axias.max_z = Math.max(axias.max_z, z);
        };

        if(bottomShift){
            axias.min_y -= bottomShift;
        }

        axias.length_x = (axias.max_x - axias.min_x);
        axias.length_y = (axias.max_y - axias.min_y);
        axias.length_z = (axias.max_z - axias.min_z);

        axias.center_x = (axias.min_x + axias.max_x) / 2;
        axias.center_y = (axias.min_y + axias.max_y) / 2;
        axias.center_z = (axias.min_z + axias.max_z) / 2;

        //console.log("Axias: ", axias);

        return axias;
    }

    function getDistance(l){
        var line0 = l[0];
        var line1 = l[1];

        var range = line0[1].y - line0[0].y;
        var shift = - line0[0].y;
        var percent0 = shift / range;

        var p0 = {
            x: line0[0].x + ((line0[1].x - line0[0].x) * percent0),
            y: 0,
            z: line0[0].z + ((line0[1].z - line0[0].z) * percent0)
        };

        range = line1[1].y - line1[0].y;
        shift = - line1[0].y;
        var percent1 = shift / range;

        var p1 = {
            x: line1[0].x + ((line1[1].x - line1[0].x) * percent1),
            y: 0,
            z: line1[0].z + ((line1[1].z - line1[0].z) * percent1)
        };

        var x = Math.abs(p1.x - p0.x);
        var z = Math.abs(p1.z - p0.z);

        var len = Math.sqrt(x * x + z * z);
        return {
            len: len,
            percent0: percent0,
            percent1: percent1
        };
    }

    function calculateDistance(f){
        var step = 0;
        var ab = (f.a.y > f.b.y) ? [f.b, f.a] : [f.a, f.b];
        var ac = (f.a.y > f.c.y) ? [f.c, f.a] : [f.a, f.c];
        var bc = (f.c.y > f.b.y) ? [f.b, f.c] : [f.c, f.b];

        var lines = [];

        if (ab[0].y <= step && step < ab[1].y) {
            lines.push(ab);
        }

        if (ac[0].y <= step && step < ac[1].y) {
            lines.push(ac);
        }

        if (bc[0].y <= step && step < bc[1].y) {
            lines.push(bc);
        }

        if(lines.length !== 2){
            console.log("error>>>");
            return 0;
        }

        return getDistance(lines);
    }

    function dot(v1, v2){
        return (v2.x * v1.x) + (v2.y * v1.y) + (v2.z * v1.z)
    }

    function norm(v){
        var l = Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z));

        return new THREE.Vector3(v.x / l, v.y / l, v.z / l)
    }

    function buildTriangles(p){
        exports.allFaces.length = 0;
        var step = 3 * 3;
        var size = p.length / step;

        for(var i = 0; i < size; i++){
            var shift = i * step;

            var f = {
                a: new THREE.Vector3(p[shift], p[shift + 1], p[shift + 2]),
                b: new THREE.Vector3(p[shift + 3], p[shift + 4], p[shift + 5]),
                c: new THREE.Vector3(p[shift + 6], p[shift + 7], p[shift + 8])
            };

            exports.allFaces.push(f);
        }
    }

    function fixRotation(){
        var legsHeightStart = 0.01;
        var legsHeightTest = 0.15;
        var depth = legsHeightStart - legsHeightTest;
        var countOfSlices = 12;

        var biggestSlice = {
            f1: {
                len:0
            },
            f2: {
                len:0
            }
        };

        var matrix = new THREE.Matrix4();
        matrix.makeTranslation(0, -legsHeightTest, 0);

        var topSlice = slicing.getSlices(matrix, 1, 0, false, true);

        var topObjects = topSlice[0];
        if(topObjects.length !== 2){
            console.log("3d-object with errors");
            return 0;
        }

        var topSlice = {
            f1: topObjects[0].sliceInfo,
            f2: topObjects[1].sliceInfo
        };

        var matrix = new THREE.Matrix4();
        matrix.makeTranslation(0, -legsHeightStart, 0);

        var slices = slicing.getSlices(matrix, countOfSlices, -depth, false, true);


        for(var j = 0; j < slices.length; j++) {
            var objects = slices[j];
            if (objects.length < 2) {
                continue;
            }

            objects.sort(function(a, b){
                return b.sliceInfo.len - a.sliceInfo.len;
            });

            if(objects.length > 2){
                objects.length = 2;
            }

            if(biggestSlice.f1.len < objects[0].sliceInfo.len) {
                biggestSlice.f1 = objects[0].sliceInfo;
                biggestSlice.f2 = objects[1].sliceInfo;
            }
        }

        var top = topSlice;
        var bot = biggestSlice;

        var t = norm({
            x: top.f2.centerX - top.f1.centerX,
            z: top.f2.centerZ - top.f1.centerZ,
            y: 0
        });

        var rad = Math.atan2(t.z, t.x);

        var b = norm({
            x: top.f2.centerX - bot.f1.centerX,
            z: top.f2.centerZ - bot.f1.centerZ,
            y: 0
        });

        var rad2 = Math.atan2(b.z, b.x);

        if(rad2 > rad){
            rad = rad + Math.PI
        }

        return {
            rad:rad,
            y: -bot.f1.minY
        };
    }

    function alignModel(obj) {
        var positions = obj;

        var axias = getAxias(positions);

        axias.center_y -= (axias.length_y / 2);

        normalizeAxias(positions, axias, true);

        buildTriangles(positions);

        var rotationData = fixRotation();

        turnAroundAndAlignObject(positions, rotationData.rad, rotationData.y);

        var axias = getAxias(positions, rotationData.y / 2);

        axias.center_y -= (axias.length_y / 2);

        normalizeAxias(positions, axias, true);

        // rebuild triangles
        buildTriangles(positions);

        return obj;
    }

    function turnAroundAndAlignObject(positions, rad, baseY){
        for(var i = 0; i < positions.length / 3; i++) {
            var x = positions[i * 3];
            var y = positions[i * 3 + 1];
            var z = positions[i * 3 + 2];

            var _x = Math.sin(rad);
            var _z = Math.cos(rad);

            positions[i * 3] = (x * _z) + (z * _x);
            positions[i * 3 + 2] = (z * _z) - (x * _x);
            positions[i * 3 + 1] = y + baseY;
        }
    }

    function buildNormals(faces){
        for(var i = 0; i < faces.length; i++) {
            var fc = faces[i].main;
            var ab = getDirection(fc.a, fc.b);
            var cb = getDirection(fc.c, fc.b);
            faces[i].normal = norm(crossProduct(cb, ab));
        }
    }

    /*function splitBodyParts2(slice){
        var start = new THREE.Vector3(-1,0,0);
        var end = new THREE.Vector3(1,0,0);
        var top = new THREE.Vector3(0,1,0);
        var bottom = new THREE.Vector3(0,-1,0);


        buildNormals(slice.faces);

        slice.faces.sort(function(f1, f2){
            return f2.main.a.x - f1.main.a.x;
        });

        var frontOfBody=[];
        var backOfBody=[];

        var centerX = slice.sliceInfo.centerX;
        var centerZ = slice.faces[0].a.z;

        slice.faces.forEach(function(f){
            f._s = dot(f.normal, start);
            f._e = dot(f.normal, end);
            f._t = dot(f.normal, top);
            f._b = dot(f.normal, bottom);
            f._isFront = (f.main.a.z > centerZ);
            f._isLeft = (f.main.a.x > centerX);
        });

        var bodyPart = [[]];
        var frontBodyPartIndex = 0;
        var backBodyPartIndex = 0;

        var lastFront = null;
        var lastBack = null;


        var lastMax = -Infinity;
        var lastMin = Infinity;

        var state = "up";

        slice.faces.forEach(function(f) {
            if(f._isFront){

                if(state === "up"){

                    // UP

                    // store max
                    if(f.main.a.z > lastMax){
                        lastMax = f.main.a.z;
                    }

                    // sa
                    if(f.main.a.z < (lastMax * 1.1)){
                        state = "down";
                        // change direction
                        lastMax = -Infinity;
                    }

                    bodyPart[frontBodyPartIndex].push(f);
                }else if(state === "down"){

                    // DOWN

                    // store mun
                    if(f.main.a.z < lastMin){
                        lastMin = f.main.a.z;
                    }


                }else if(state === "search"){

                }

                lastFront = f;
            }else{

            }
        });
    }*/

    function computeSide(slice, isR){
        var len = 0;

        var side = slice.faces.filter(function(face){
            if(isR)
                return 0 >= face.main.a.x;
            else
                return 0 < face.main.a.x;
        });

        // detecting hand by normal orientation
        var hand = side.filter(function(face){
            var pt = {
                x: face.main.a.x,
                y: 0,
                z: face.main.a.z
            };
            var res = dot(face.normal, norm(pt));

            return res < 0;
        });

        //showSlice(hand, false, isR ? "#ff5555" : "#ff5555");

        var sideCalc = {
            faces: []
        };

        if(hand.length) {
            hand.sort(function(f1, f2){
                return f2.main.a.z - f1.main.a.z;
            });

            //basis(group, hand[0].main.a);

            var maxZ = hand[0].main.a.z + 0.005;

            hand.sort(function(f1, f2){
                return isR ? f2.main.a.x - f1.main.a.x : f1.main.a.x - f2.main.a.x;
            });

            var maxX = hand[0].main.a.x;

            console.log("maxX : " + maxX);

            // forward

            var forwardTest = side.filter(function (face) {
                return face.main.a.z > maxZ /*&& (isR ? face.main.a.x > maxX * 1.2 : face.main.a.x < maxX * 1.2 )*/;
            });

            var fPoint = forwardTest.sort(function (f1, f2) {
                return f1.main.a.z - f2.main.a.z
            });

            var forward = forwardTest;

            /// back

            var back = side.filter(function(face){
                return (isR ? (face.main.a.x > maxX * 0.95) : (face.main.a.x < maxX * 0.95)) &&
                    face.main.a.z < -0.02;
            });

            var bPoint = back.sort(function (f1, f2) {
                return isR ? f1.main.a.x - f2.main.a.x : f2.main.a.x - f1.main.a.x;
            });

            if(fPoint.length && bPoint.length) {

                /*basis(group, fPoint[0].main.a);
                basis(group, bPoint[0].main.a);*/

                var dist = fPoint[0].main.a.distanceTo(bPoint[0].main.a);

                var backLen = 0;
                var forwardLen = 0;

                var result = [];
                len = 0;



                forward.forEach(function (f) {
                    forwardLen += f.len;
                });
                len += forwardLen;

                result = forward;
                showSlice(forward, false, "blue", 1);
                console.log(">>>>>>> len forward : " + forwardLen * window.modelStorage.height);



                back.forEach(function (f) {
                    backLen += f.len;
                });
                len += backLen;

                result = result.concat(back);

                showSlice(back, false, "black", 1);
                console.log(">>>>>>> len back : " + backLen * window.modelStorage.height);



                console.log(">>>>>>> +dist : " + dist * window.modelStorage.height);
                len += dist;

                sideCalc = result;
            }else{
                len = sideCalc.sliceInfo.len;
            }

            return {
                side: sideCalc,
                len: len
            };

        }
        else {
            sideCalc.faces = side;
            slicing.calcData(sideCalc);

            len = sideCalc.sliceInfo.len;

            console.log(">>>>>>> len : " + sideCalc.sliceInfo.len * 159.3);


            return {
                side: sideCalc,
                len: len
            };
        }
    }

/*    function computeRightSide(slice){
        var rightSide = slice.faces.filter(function(face){
            return 0 >= Math.min(face.main.a.x,face.main.b.x,face.main.c.x);
        });

        var rightHand = rightSide.filter(function(face){
            var pt = {
                x: face.main.a.x,
                y: 0,
                z: face.main.a.z
            };

            var res = dot(face.normal, norm(pt));

            //console.log("R: " + res);

            return res < 0;
        });

        rightHand.sort(function(f1, f2){
            return f2.main.a.x - f1.main.a.x;
        });

        var maxRight = rightHand[0].a.x;

        var rightSideBody = rightSide.filter(function(face){
            return face.main.a.x > maxRight
        });

        rightSideBody.sort(function(f1, f2){
            return f2.main.a.x - f1.main.a.x;
        });

        forward = [];
        back = [];

        rightSideBody.forEach(function(face){
            if(face.main.a.z > 0){
                forward.push(face)
            }else{
                back.push(face)
            }
        });

        fPoint = forward.sort(function(f1, f2){
            return f1.main.a.z - f2.main.a.z
        });

        bPoint = back.sort(function(f1, f2){
            return f2.main.a.z - f1.main.a.z
        });

        dist = fPoint[0].a.distanceTo(bPoint[0].a);

        var rightSideCalc = {
            faces: rightSideBody
        };

        slicing.calcData(rightSideCalc);

        rightSideCalc.sliceInfo.len += dist;

        return rightSideCalc;
    }*/

    function splitBodyParts(slice){
        buildNormals(slice.faces);

        var left = computeSide(slice, false);
        var right = computeSide(slice, true);

        return {
            left: {
                faces: left.side,
                sliceInfo: {}
            },
            right: {
                faces: right.side,
                sliceInfo: {}
            },
            len: left.len + right.len
        }
    }

    function getDirection(a, b){
        return {
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z
        }
    }

    function crossProduct(v1, v2) {
        return {
            x: ((v1.y * v2.z) - (v1.z * v2.y)),
            y: -((v1.x * v2.z) - (v1.z * v2.x)),
            z: ((v1.x * v2.y) - (v1.y * v2.x))
        }
    }



    exports.lerp = lerp;
    exports.normalizeAxias = normalizeAxias;
    exports.getAxias = getAxias;
    exports.getDistance = getDistance;
    exports.calculateDistance = calculateDistance;
    exports.dot = dot;
    exports.norm = norm;
    exports.buildTriangles = buildTriangles;
    exports.fixRotation = fixRotation;
    exports.alignModel = alignModel;
    exports.turnAroundAndAlignObject = turnAroundAndAlignObject;
    exports.splitBodyParts = splitBodyParts;
    exports.getDirection = getDirection;
    exports.crossProduct = crossProduct;
    exports.buildNormals = buildNormals;

})(typeof exports === 'undefined'? this['helpers']={}: exports);
