// map.js
// 将以北方向为零点的坐标方位角转化为用于表示斜率的夹角
var vRadius = 6378136.49//地球半径
// 计算起点到终点的航向角
function ComputeHeading(vFromLat, vFromLon, vToLat, vToLon) {
    var vFromLatArc = Angle2Arc(vFromLat);
    var vToLatArc = Angle2Arc(vToLat);
    var vLonArcDif = Angle2Arc(vToLon) - Angle2Arc(vFromLon);
    var rHeading = Arc2Angle(Math.atan2(Math.sin(vLonArcDif) * Math.cos(vToLatArc), Math.cos(vFromLatArc) * Math.sin(vToLatArc) - Math.sin(vFromLatArc) * Math.cos(vToLatArc) * Math.cos(vLonArcDif)));
    while (rHeading >= 360) {
        rHeading -= 360;
    }
    while (rHeading < 0) {
        rHeading += 360;
    }
    return rHeading;
}

/// 角度转弧度
function Angle2Arc(vAngle) {
    return vAngle * Math.PI / 180.0;
}

/// 弧度转角度
function Arc2Angle(vArc) {
    return vArc * 180.0 / Math.PI;
}

// 将以北方向为零点的坐标方位角转化为用于表示斜率的夹角
function Heading2KAndgle(vHeading) {
    while (vHeading >= 360) {
        vHeading -= 360;
    }
    while (vHeading < 0) {
        vHeading += 360;
    }
    var rAngle = 0;
    if (vHeading >= 0 && vHeading < 180) {
        rAngle = 90 - vHeading;
    }
    else {
        rAngle = 270 - vHeading;
    }
    return rAngle;
}

// 判断一个数是否近似为0
function IsApproximateZero(vNum) {
    if (Math.round(vNum * 1e8) == 0) {
        return true;
    }
    else {
        return false;
    }
}

// 获取射线与线段的交点
//vLat0:射线端点纬度 vLon0:射线端点经度 vHeading:射线航向角
//vLat1:线段端点1纬度 vLon1:线段端点1经度 vLat2:线段端点2纬度 vLon2:线段端点2经度
function LineCross(vLat0, vLon0, vHeading, vLat1, vLon1, vLat2, vLon2) {
    //Tuple < double, double > rTuple = null;
    var pKAngle = Heading2KAndgle(vHeading);//航向角
    var tuple = [] //存放射线与线段之间的交点的数组
    //Lon作为X，Lat作为Y，线段方程的参数
    var A2 = vLat2 - vLat1;
    var B2 = vLon1 - vLon2;
    var C2 = vLon2 * vLat1 - vLon1 * vLat2;
    var rLat = 0;
    var rLon = 0;
    if (pKAngle == 90 || pKAngle == -90) {
        if (IsApproximateZero(B2)) {
            //重合
            if (vLon1 == vLon0) {
                rLat = vLat1
                rLon = vLon1
                // tuple.push({longitude:vLon1,latitude:vLat1})
            }
            //平行
            else {
                return [];
            }
        }
        else {
            //tuple.push({ longitude: vLon0, latitude: -(C2 + A2 * vLon0) / B2 })
            rLat = -(C2 + A2 * vLon0) / B2
            rLon = vLon0
        }
        if (rLat >= Math.min(vLat1, vLat2) && rLat <= Math.max(vLat1, vLat2) && rLon >= Math.min(vLon1, vLon2) && rLon <= Math.max(vLon1, vLon2)) {
            tuple.push({longitude: rLon, latitude: rLat})
        }
        else {
            tuple = [];
        }
        return tuple;
    }
    var A1 = Math.tan(pKAngle * Math.PI / 180);
    var B1 = -1;
    var C1 = vLat0 - Math.tan(pKAngle * Math.PI / 180) * vLon0;
    var A1B2A2B1 = A1 * B2 - A2 * B1;
    var A2C1A1C2 = A2 * C1 - A1 * C2;
    var B1C2B2C1 = B1 * C2 - B2 * C1;

    // rLat = 0;
    // rLon = 0;

    //前四种情况计算出的值不够准确，会被认为交点不在线上，故单独处理
    if (IsApproximateZero(A1) && !IsApproximateZero(B1) && !IsApproximateZero(A2)) {
        //rLat = (vP1Lat2 + vP1Lat1) / 2.0;
        rLat = -C1 / B1;
        rLon = (-C2 - B2 * rLat) / A2;
    }
    else if (!IsApproximateZero(A1) && IsApproximateZero(A2) && !IsApproximateZero(B2)) {
        rLat = (vLat2 + vLat1) / 2.0;
        //rLat = -C2 / B2;
        rLon = (-C1 - B1 * rLat) / A1;
    }
    else if (!IsApproximateZero(A1) && IsApproximateZero(B1) && !IsApproximateZero(B2)) {
        //rLon = (vP1Lon1 + vP1Lon2) / 2.0;
        rLon = -C1 / A1;
        rLat = (-C2 + A2 * rLon) / B2;
    }
    else if (!IsApproximateZero(B1) && !IsApproximateZero(A2) && IsApproximateZero(B2)) {
        rLon = (vLon1 + vLon2) / 2.0;
        //rLon = -C2 / A2;
        rLat = (-C1 - A1 * rLon) / B1;
    }
    else if (IsApproximateZero(A1B2A2B1)) {
        return [];
    }
    else {
        rLat = A2C1A1C2 / A1B2A2B1;
        rLon = B1C2B2C1 / A1B2A2B1;
    }
    //如果交点在线段内且在射线的方向上再返回
    //&&Math.abs(vHeading - GetAzimuth(vLat0, vLon0, rLat, rLon)) < 90
    //为什么没有满足if条件还能返回值
    if (rLat >= Math.min(vLat1, vLat2) && rLat <= Math.max(vLat1, vLat2) && rLon >= Math.min(vLon1, vLon2) && rLon <= Math.max(vLon1, vLon2)) {
        tuple.push({longitude: rLon, latitude: rLat})
    }
    else {
        tuple = [];
    }
    return tuple;
}

//求1到2的方位角(圆心在1上，角度制)
function GetAzimuth(vLat1, vLon1, vLat2, vLon2) {
    return ComputeHeading(vLat1, vLon1, vLat2, vLon2);
}

// 获取两点间线段距离
function GetLatLonDistance(vLat1, vLon1, vLat2, vLon2) {
    return Math.sqrt(Math.pow(vLat1 - vLat2, 2) + Math.pow(vLon1 - vLon2, 2));
}

/// 获取航点到航线的最短距离
function GetLatLonMinDistance(vPoint, vLine) {
    if (vPoint == null || vLine == null) return double.NaN;
    return GetLatLonMinDistance(vPoint.Lat, vPoint.Lon, vLine.Lat1, vLine.Lon1, vLine.Lat2, vLine.Lon2);
}

/// 计算点到直线的最短距离
function GetLatLonMinDistance(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2) {
    var pFootPointLat = 0;
    var pFootPointLon = 0;
    GetLatLonFootPoint(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2);
    return ComputeSpacialDistance(vLat0, vLon0, pFootPointLat, pFootPointLon);
}


Page({
    data: {
        polyline: [],
        markers:[],
        startPosition:{},
        latitude:'',
        longitude:'',
        mapHeight:'',
        scale:'14',
        operationDisplay:1,//控制是否显示设置作业区的按钮的选项
        operationArray:[],//生成作业区的各个坐标点的数组
        operateWidth:100,//幅宽，也就是作业宽度

        mapViewDisplay:1,//地图view
        operateViewDisplay:1,//设置作业区view
        setOperateWidthViewDisplay:0,//设置幅宽view
        navViewDisplay:0,//开始导航view

        navButtonDisplay:1,//导航按钮

        headingAngle: 30,//航向角的值

        crossPoints:[],
    },
    onLoad:function(){
        var _this = this;
        this.mapCtx = wx.createMapContext('map');
        wx.getLocation({
            success: function (res) {
                _this.setData({
                    latitude:res.latitude,
                    longitude:res.longitude
                })
            },
        })
        //获取屏幕信息，设置操作地图的控件
        wx.getSystemInfo({
            success: function(res){
                _this.setData({
                    windowHeight: res.windowHeight,//屏幕高度
                    mapHeight: res.windowHeight-106,//46
                    controls: [{
                        id: 1,
                        iconPath: '/pages/images/location3.png',
                        position: {
                            left: res.windowWidth / 2 - 12,
                            top: res.windowHeight / 2 - 58,
                            width: 26,
                            height: 36
                        },
                        clickable: true
                    },{
                        id: 2,
                        iconPath: '/pages/images/circle_location.png',
                        position: {
                            left: res.windowWidth-60,
                            top: res.windowHeight-206,//待调整
                            width: 40,
                            height: 40
                        },
                        clickable: true
                    }]
                })
            }
        })
    },

    controltap:function(e) {
        var _this = this;
        if (e.controlId === 1) {//红色的定位
            this.data.operationDisplay?'':
                this.mapCtx.getCenterLocation({
                    success:function(res){
                        var len = _this.data.operationArray.length
                        if (len <=2) {
                            _this.data.operationArray.push({
                                longitude: res.longitude,
                                latitude: res.latitude
                            });//少于3点的时候，直接添加进去，

                            //2个点的，末尾位置放第一个点
                            if (len == 2){
                                _this.data.operationArray.push(_this.data.operationArray[0])
                            }
                        } else if (len > 2) {

                            //大于2个点的时候，直接在倒数第二个位置放置新添加的点
                            _this.data.operationArray.splice(_this.data.operationArray.length - 1, 0, {
                                longitude: res.longitude,
                                latitude: res.latitude
                            })
                        }
                        _this.data.polyline[0] = {
                            points: _this.data.operationArray,
                            color: "#FF0000DD",
                            width: 2,
                            dottedLine: true
                        }
                        _this.setData({
                            operationArray: _this.data.operationArray,
                            polyline: _this.data.polyline
                        })
                    }
                })

        } else if (e.controlId === 2) {
            this.mapCtx.moveToLocation();
            this.changeCircleLocationColor();
        }
    },
    setOperationArea:function(){
        var _this = this;
        _this.setData({
            operationDisplay:0,
        })
        // wx.showModal({
        //     title: '提示',
        //     content: '点击屏幕中央的红色定位按钮，设置作业区',
        //     showCancel:false,
        //     success:function(){
        //         _this.setData({
        //             operationDisplay:0,
        //         })
        //     }
        // })
    },
    reSetOperationArea:function(){
        this.data.operationArray = [];
        this.data.polyline[0] = {
            points: this.data.operationArray,
            color: "#FF0000DD",
            width: 2,
            dottedLine: true
        }
        this.data.polyline.length = 1;
        this.setData({
            operationArray: this.data.operationArray,
            polyline: this.data.polyline
        })
    },
    finishSetOperationArea:function(){
        // this.setData({
        //     mapViewDisplay:0,
        //     operateViewDisplay:0,
        //     setOperateWidthViewDisplay:1,
        // })
       // var minPointIndex = this.findMinLength();
        this.generateNavLine();
    },
    setOperateWidth:function(e){
        this.setData({
            operateWidth:e.detail.value,
        })
    },
    finishSetOperateWidthView:function(){
        this.setData({

            mapViewDisplay:1,
            operateViewDisplay:0,
            setOperateWidthViewDisplay:0,

            navViewDisplay:1,
        })
        this.generateNavLine();

    },

    changeCircleLocationColor:function(){
        this.data.controls[1].iconPath = '/pages/images/circle_location_green.png';
        this.setData({
            controls:this.data.controls,
        })
        var _this = this;
        setTimeout(function(){
            _this.data.controls[1].iconPath = '/pages/images/circle_location.png';
            _this.setData({
                controls:_this.data.controls,
            })
        },1000);
    },

    //生成航线
    generateNavLine:function() {
        var _this = this;
        var weiduMinPoint, jingduMinPoint;
        var copyOperationArray = JSON.parse(JSON.stringify(_this.data.operationArray));

        weiduMinPoint = copyOperationArray[0];
        jingduMinPoint = copyOperationArray[0];

        var length = copyOperationArray.length - 1;

        for (var i = 0; i < length; i++) {
            if (copyOperationArray[i].latitude < weiduMinPoint.latitude) {
                weiduMinPoint = copyOperationArray[i]
            }
            if (copyOperationArray[i].longitude < jingduMinPoint.longitude) {
                jingduMinPoint = copyOperationArray[i]
            }
        }

        var basePoint = this.basePoint(jingduMinPoint.latitude, jingduMinPoint.longitude, this.data.headingAngle, weiduMinPoint.latitude);

        //第一次根据基准点求偏移点，偏移量是幅宽的一半
        var basePointOffset = this.ComputeOffset(basePoint.latitude, basePoint.longitude, this.data.operateWidth /2 , this.data.headingAngle + 90);

        //放置的根据每一个偏移点和作业区的交点的集合。如果为空，就说明根据该偏移点，没有航线生成，求航线的逻辑可以结束。
        var crossPoints = [];

        var tempCrossPointArray = [];

        for (var i = 0; i < length; i++) {
            //从偏移点出发的射线和作业区的交点
            tempCrossPointArray = LineCross(basePointOffset.latitude, basePointOffset.longitude, this.data.headingAngle, this.data.operationArray[i].latitude, this.data.operationArray[i].longitude, this.data.operationArray[i + 1].latitude, this.data.operationArray[i + 1].longitude)
            if (tempCrossPointArray.length > 0) {
                crossPoints.push({
                    longitude: tempCrossPointArray[0].longitude,
                    latitude: tempCrossPointArray[0].latitude
                })
            }
        }

        while( crossPoints.length > 0 ){

            this.data.crossPoints.push(crossPoints.slice(0));

            crossPoints.length=0;
            //根据偏移点求偏移点，偏移量是幅宽
            basePointOffset = this.ComputeOffset(basePointOffset.latitude, basePointOffset.longitude, this.data.operateWidth, this.data.headingAngle + 90);

            tempCrossPointArray = [];

            for (var i = 0; i < length; i++) {
                //从偏移点出发的射线和作业区的交点
                tempCrossPointArray = LineCross(basePointOffset.latitude, basePointOffset.longitude, this.data.headingAngle, this.data.operationArray[i].latitude, this.data.operationArray[i].longitude, this.data.operationArray[i + 1].latitude, this.data.operationArray[i + 1].longitude)
                if (tempCrossPointArray.length > 0) {
                    crossPoints.push({
                        longitude: tempCrossPointArray[0].longitude,
                        latitude: tempCrossPointArray[0].latitude
                    })
                }
            }
        }

        for (var j = 0; j < this.data.crossPoints.length; j++) {

            this.data.polyline[j + 1] = {
                points: this.data.crossPoints[j],
                color: "#128612",
                width: 2,
                dottedLine: false,
            }
            this.setData({
                polyline: this.data.polyline
            })

        }

    },
    //找到中间点的基点，即第一个点的函数,求航线和作业区交点的第一个点，（这个点根据已知直线和点以及点在直线的角度，求交点得出的）
    basePoint:function(vLat0, vLon0, vHeading, vLat1) {
        var basepoint = []
        var pKAngle = Heading2KAndgle(vHeading);
        var A0 = Math.tan(pKAngle * Math.PI / 180);
        var B0 = -1;
        var C0 = vLat0 - Math.tan(pKAngle * Math.PI / 180) * vLon0;
        basepoint.push({
            longitude: -(C0 + B0 * vLat1) / A0,
            //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
            latitude: vLat1
        })
        return {
            longitude: -(C0 + B0 * vLat1) / A0,
            //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
            latitude: vLat1
        };
    },
    //已知一个点、距离、航向角，求终点
    ComputeOffset:function(vLat, vLon, vDistance, vHeading) {
        var pDistanceArc = vDistance / vRadius;
        var pHArc = Angle2Arc(vHeading);
        var pLatArc = Angle2Arc(vLat);
        var pDAC = Math.cos(pDistanceArc);
        var pDAS = Math.sin(pDistanceArc);
        var pLAS = Math.sin(pLatArc);
        var pLAC = Math.cos(pLatArc);
        var rLatS = pDAC * pLAS + pDAS * pLAC * Math.cos(pHArc);
        return {
            latitude:Arc2Angle(Math.asin(rLatS)),
            longitude:Arc2Angle(Angle2Arc(vLon) + Math.atan2(pDAS * pLAC * Math.sin(pHArc), pDAC - pLAS * rLatS))
        }
    },

})
