(function(exports){

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
            Complexity: ""
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
            Complexity: "****"
        },
        {
            Name: "BACK WIDTH",
            Ru: "ширина спины",
            Complexity: "**"
        },
        {
            Name: "BACK WAIST LENGTH",
            Ru: "длинна от шеи до пояса сзади",
            Complexity: "*"
        },
        {
            Name: "FRONT WAIST LENGTH",
            Ru: "длинна от шеи до пояса спереди",
            Complexity: "*"
        },
        {
            Name: "NECK SHOULDER POINT TO BUST POINT",
            Ru: "длинна от шеи до груди спереди",
            Complexity: "*"
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
            Complexity: ""
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
            Complexity: ""
        },
        {
            Name: "TOTAL CROTCH LENGTH",
            Ru: "общая длинна промежности (до пояса)",
            Complexity: "???"
        },
        {
            Name: "CROTCH LENGTH FRONT",
            Ru: "длинна промежнасти спереди (до пояса)",
            Complexity: "???"
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
            Complexity: "****"
        },
        {
            Name: "UPPER ARM LENGTH",
            Ru: "длинна верхней части руки",
            Complexity: "**"
        },
        {
            Name: "UPPER ARM GIRTH",
            Ru: "обхват верхней части руки",
            Complexity: ""
        },
        {
            Name: "ELBOW GIRTH",
            Ru: "обхват локтя",
            Complexity: ""
        },
        {
            Name: "FOREARM GIRTH",
            Ru: "обхват предплечья",
            Complexity: ""
        },
        {
            Name: "WRIST GIRTH",
            Ru: "обхват запястья",
            Complexity: ""
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
        verticalBodySlice.getVerticalBodySlice(sharedConfig);
        chestData.getChestData(sharedConfig);

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
