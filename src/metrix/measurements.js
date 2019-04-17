(function(exports){

    function getArmLength(){
        return armsData.armLength;
    }

    function getUpperArmLength(){
        return armsData.upperArmLength;
    }

    function getWristGirth(){
        return armsData.wristGirth;
    }

    function getElbowGirth(){
        return armsData.elbowGirth;
    }

    function getMiddleForearmGirth(){
        return armsData.middleForearmGirth;
    }

    function getUpperArmGirth(){
        return armsData.upperArmGirth;
    }

    function getShoulderLength(){
        return shoulderData.shoulderLength;
    }

    function getAkromionWide(){
        return shoulderData.akromionWide
    }

    function getUnderbustGirst(){
        return chestData.underbustGirst;
    }

    function getTotalCrotchLength() {
        return verticalBodySlice.totalCrotchLength;
    }

    function getCrotchLengthFrontLength() {
        return verticalBodySlice.crotchLengthFrontLength;
    }

    function getBackWaistLength(){
        return verticalBodySlice.backWaistLength;
    }

    function getNeckShoulderPointToBustLength(){
        return chestData.neckShoulderPointToBustLength;
    }

    function getFrontWaistLineLength() {
        return chestData.frontWaistLineLength;
    }

    function getBustHeight(){
        return chestData.bustHeight;
    }

    function getCervicalHeight(){
        return verticalBodySlice.backSideLength + hipGirthAndHeight.heightToHip;
    }

    function getCervicalToKneeHollow(){
        var heightToKnee = hipGirthAndHeight.heightToHip / 2.2;
        return verticalBodySlice.backSideLength + heightToKnee;
    }

    function getHeadGirth(context){
        var countOfSlices = 10;

        var bottomStart = 0.93;
        var topEnd = 0.95;
        var depth = topEnd - bottomStart;

        // translate Y
        var matrixTrans = new THREE.Matrix4();
        matrixTrans.makeTranslation(0, -bottomStart, 0);

        // slicing
        var resultSlices = slicing.getSlices(matrixTrans, countOfSlices, depth, context.showSlices);

        // looking to slice with max length
        var maxLen = -Infinity;
        var maxSlice = null;
        var index = -1;

        for(var i = 0; i < resultSlices.length; i++){
            var slice = resultSlices[i][0];

            if(context.showSlices) {
                //showSlice(slice, false, "black");
            }

            if(maxLen < slice.sliceInfo.len){
                maxSlice = slice;
                maxLen = Math.max(maxLen, slice.sliceInfo.len);
                index = i;
            }
        }

        if(true /*context.showSlices*/) {
            showSlice(maxSlice, false, "red");
        }

        return maxSlice.sliceInfo.len;
    }

    function getOutsideLegLength(){
        return chestData.outsideLegLength;
    }


    function getTrunckLength(){
        return verticalBodySlice.trunckLength;
    }

    function getWaistToHip(){
        return chestData.waistToHip
    }

    function getWaistGirth(){
        return chestData.waistGirth;
    }

    function getWaistHeight(){
        return chestData.waistHeight;
    }

    function getBustPointDist(){
        return chestData.bustPointDist;
    }

    function getChestGirth(){
        return chestData.chestGirth;
    }

    function getNeckBaseDiameter(){
        return neckGirthAndCervicalHeightData.neckBaseDiameter;
    }

    function getNeckBaseGirth(){
        return neckGirthAndCervicalHeightData.neckBaseGirth;
    }

    function getNeckGirth(){
        return neckGirthAndCervicalHeightData.neckGirth;
    }

    function getHipGirth(){
        return hipGirthAndHeight.hipGirth;
    }

    function getMaxWaistGirth(){
        return chestData.maxWaistGirth;
    }

    function getMiddleHipGirth(){
        return chestData.middleHipGirth;
    }



    var config = [
        {
            Name: "CERVICAL HEIGTH",
            Ru: "высота до шеи",
            Complexity: "**",
            code: getCervicalHeight,
            showSlices: true
        },
        {
            Name: "CERVICAL TO KNEE HOLLOW",
            Ru: "от шеи до колен",
            Complexity: "**",
            code: getCervicalToKneeHollow,
            showSlices: true
        },
        {
            Name: "HEAD GIRTH",
            Ru: "обхват головы",
            Complexity: "",
            code: getHeadGirth,
            showSlices: true
        },
        {
            Name: "BUST HEIGHT",
            Ru: "высота до груди",
            Complexity: "",
            code: getBustHeight,
            showSlices: true
        },
        {
            Name: "OUTSIDE LEG LENGTH",
            Ru: "внешняя длинная ноги",
            Complexity: "**",
            code: getOutsideLegLength,
            showSlice: true
        },
        {
            Name: "WAIST HEIGHT",
            Ru: "высота до талии",
            Complexity: "",
            code: getWaistHeight,
            showSlice: true
        },
        {
            Name: "TRUNCK LENGTH",
            Ru: "длинна тела до шеи",
            Complexity: "*",
            code: getTrunckLength,
            showSlice: true
        },
        {
            Name: "CHEST GIRTH",
            Ru: "обхват груди",
            Complexity: "",
            code: getChestGirth,
            showSlice: true
        },
        {
            Name: "UNDERBUST GIRTH",
            Ru: "обхват под грудью",
            Complexity: "",
            code: getUnderbustGirst
        },
        {
            Name: "NECK GIRTH",
            Ru: "обхват шеи",
            Complexity: "*** (*)",
            code: getNeckGirth
        },
        {
            Name: "NECK BASE GIRTH",
            Ru: "обхват у основания шеи",
            Complexity: "*** (?)",
            code: getNeckBaseGirth
        },
        {
            Name: "NECK BASE DIAMETER",
            Ru: "диаметр основания шеи",
            Complexity: "",
            code: getNeckBaseDiameter
        },
        {
            Name: "SHOULDER LENGTH",
            Ru: "длинна плеча",
            Complexity: "****",
            code: getShoulderLength,
            showSlices: true
        },
        {
            Name: "BACK WIDTH",
            Ru: "ширина спины",
            Complexity: "**"
        },
        {
            Name: "BACK WAIST LENGTH",
            Ru: "длинна от шеи до пояса сзади",
            Complexity: "*",
            code: getBackWaistLength,
            showSlice: true
        },
        {
            Name: "FRONT WAIST LENGTH",
            Ru: "длинна от шеи до пояса спереди",
            Complexity: "*",
            code: getFrontWaistLineLength,
            showSlice: true
        },
        {
            Name: "NECK SHOULDER POINT TO BUST POINT",
            Ru: "длинна от шеи до груди спереди",
            Complexity: "*",
            code: getNeckShoulderPointToBustLength,
            showSlices: true
        },
        {
            Name: "BUST POINT DISTANCE",
            Ru: "дистанция между сосками",
            Complexity: "**",
            code: getBustPointDist,
            showSlices: true
        },
        {
            Name: "AXLE LENGTH",
            Ru: "дистанция от шеи под лопатки сзади",
            Complexity: ""
        },
        {
            Name: "AKROMION WIDE",
            Ru: "ширина по между ключицами (спина)",
            Complexity: "",
            code: getAkromionWide,
            showSlices: true
        },
        {
            Name: "UPPER FRONT WIDE",
            Ru: "ширина до подмышек над грудью",
            Complexity: ""
        },
        {
            Name: "WAIST GIRTH",
            Ru: "обхват талии",
            Complexity: "",
            code: getWaistGirth,
            showSlice: true
        },
        {
            Name: "HIP GIRTH",
            Ru: "обхват бедер",
            Complexity: "",
            code: getHipGirth,
            showSlices: true
        },
        {
            Name: "WAIST TO HIP",
            Ru: "длина от талии до линни обхвата бедра",
            Complexity: "",
            code: getWaistToHip,
            showSlices: true
        },
        {
            Name: "TOTAL CROTCH LENGTH",
            Ru: "общая длинна промежности (до пояса)",
            Complexity: "???",
            code: getTotalCrotchLength,
        },
        {
            Name: "CROTCH LENGTH FRONT",
            Ru: "длинна промежнасти спереди (до пояса)",
            Complexity: "???",
            code: getCrotchLengthFrontLength,
            showSlice: true
        },
        {
            Name: "MIDDLE HIP GIRTH",
            Ru: "обхват нижней части живота",
            Complexity: "",
            code: getMiddleHipGirth,
            showSlices: true
        },
        {
            Name: "MAXIMUM WAIST GIRTH",
            Ru: "максимальный обхват пояса",
            Complexity: "",
            code: getMaxWaistGirth
        },
        {
            Name: "ARM LENGTH",
            Ru: "длинна руки",
            Complexity: "****",
            code: getArmLength,
            showSlices: true
        },
        {
            Name: "UPPER ARM LENGTH",
            Ru: "длинна верхней части руки",
            Complexity: "**",
            code: getUpperArmLength,
            showSlices: true
        },
        {
            Name: "UPPER ARM GIRTH",
            Ru: "обхват верхней части руки",
            Complexity: "",
            code: getUpperArmGirth,
            showSlices: true
        },
        {
            Name: "ELBOW GIRTH",
            Ru: "обхват локтя",
            Complexity: "",
            code: getElbowGirth,
            showSlices: true
        },
        {
            Name: "FOREARM GIRTH",
            Ru: "обхват предплечья",
            Complexity: "",
            code: getMiddleForearmGirth,
            showSlices: true
        },
        {
            Name: "WRIST GIRTH",
            Ru: "обхват запястья",
            Complexity: "",
            code: getWristGirth,
            showSlices: true
        },
        {
            Name: "ARM LENGTH FROM THE SEV. CERV. VERT.",
            Ru: "длинна руки от центра шеи сзади",
            Complexity: ""
        }
    ];

    function getConfigResults(name){
        var conf = config.find(function(item){
            return item.Name === name
        });

        if(!conf){
            alert("Wrong name of metric - " + name);
            return;
        }

        if(conf.results){
            alert("Not executed yet - " + name);
            return
        }

        return conf.results;
    }

    function run(updateResults){

        var sharedConfig = {
            showSlices: false
        };

        if(updateResults) {
            updateResults();
        }

        // shared
        neckGirthAndCervicalHeightData.getNeckGirthAndCervicalHeightData(sharedConfig);
        hipGirthAndHeight.getHipGirthAndHeight(sharedConfig);
        chestData.getChestData(sharedConfig);
        verticalBodySlice.getVerticalBodySlice(sharedConfig);
        shoulderData.getShoulderData(sharedConfig);
        armsData.getArmsData(sharedConfig);


        for(var c in config){
            var conf = config[c];
            if(conf.code) {
                var key = "Calculation: " + conf.Name.toLowerCase();

                console.log(key);
                conf.result = conf.code({
                    showSlices: sharedConfig.showSlices,
                    getConfigResults: getConfigResults
                });
//                console.timeLog(key);

                if(updateResults) {
                    updateResults();
                }
            }
        }

        return config;
    }


    function sendData(){

    }


    exports.config = config;
    exports.run = run;


})(typeof exports === 'undefined'? this['measurements']={}: exports);
