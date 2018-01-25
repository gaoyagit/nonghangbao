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
        polylineAllLength:0,//全局polyline长度
        operationDisplay:1,//控制是否显示设置作业区的按钮的选项
        allOperationArray: [],//所有作业区域的坐标点，例如allOperationArray[0]存放第一个作业区，allOperationArray[1]存放第二个作业区
        operationArray:[],//生成单个作业区的各个坐标点的数组
        operateWidth:0,//幅宽，也就是作业宽度

        mapViewDisplay:1,//地图view
        operateViewDisplay:1,//设置作业区view
        setOperateWidthViewDisplay:0,//设置幅宽view
        navViewDisplay:0,//开始导航view

        navButtonDisplay:1,//导航按钮

        headingAngle:0,//航向角的值

        crossPoints:[],//这个是什么？中间点与作业区的交点吗？

        liveLocation:{},//这是什么？导航时，经过的点？

        stopFlag: 0,//当stopFlag为1时清空导航的计时器，结束导航

        navigationDot: [],//飞机飞行经过的点
    },
    onLoad:function(){
        var _this = this;
        this.mapCtx = wx.createMapContext('map');
        wx.getLocation({
            success: function (res) {
                _this.setData({
                    latitude:res.latitude,
                    longitude:res.longitude,
                    startPosition:{
                        latitude:res.latitude,
                        longitude:res.longitude,
                    }
                })
            },
        })
        //获取屏幕信息，设置操作地图的控件
        wx.getSystemInfo({
            success: function(res){
                _this.setData({
                    windowHeight: res.windowHeight,//屏幕高度
                    mapHeight: res.windowHeight-46,//46
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
                            top: res.windowHeight-146,//待调整
                            width: 40,
                            height: 40
                        },
                        clickable: true
                    }]
                })
            }
        })
    },
    // ***********************************************作业区域设置*************************************************
    //生成作业区的点，形成作业区域
    controltap:function(e) {
        var _this = this;
        // var polylineLen;//存放polyline的长度
        // polylineLen = _this.data.polyline.length;//点击一次长度会加1
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
                        
                        // console.log(polylineLen);
                        console.log("作业区域" + _this.data.polylineAllLength);
                        _this.data.polyline[_this.data.polylineAllLength] = {
                            points: _this.data.operationArray,
                            color: "#FF0000DD",
                            width: 2,
                            dottedLine: true
                        }
                        _this.setData({
                            operationArray: _this.data.operationArray,
                            polyline: _this.data.polyline
                        })
                        console.log("设置作业区域之后polyline的长度" + _this.data.polyline.length);
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
    // *****************************************需要重写**************************************************
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
    setHeadingAngleAndWidth:function(){
        this.setData({
            mapViewDisplay:0,
            operateViewDisplay:0,
            setOperateWidthViewDisplay:1,
        })
        //this.generateNavLine();
        //异步处理，设置新生成的航线可能没重新渲染完毕
        //setTimeout(this.startNavigation,500);
        //this.startNavigation();
    },
    setOperateWidth:function(e){
        this.setData({
            operateWidth:parseInt(e.detail.value),
        })
    },
    setHeadingAngle:function(e){
        this.setData({
            headingAngle:parseInt(e.detail.value),
        })
    },
    finishSetOperateWidthView:function(){
        var _this = this;
        _this.setData({
            mapViewDisplay:1,
            operateViewDisplay:1,
            setOperateWidthViewDisplay:0,
            navViewDisplay:0,
        })
        _this.generateNavLine();
        _this.data.polylineAllLength = _this.data.polyline.length;
        
         console.log("生成航下后的长度"+_this.data.polylineAllLength);
         
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
// ************************************************设置下一个作业区域**************************************************************
    nextAndFinishSetOperationArea:function(){
      var self = this;
      var polylineLength;
      var allOperationArrayLength ;//self.data.allOperationArray.length;
      self.data.allOperationArray.push(self.data.operationArray);
      wx.showModal({
        title: '提示',
        content: '是否设置下一个作业区域',
        success: function (res) {
          if (res.confirm) {
            
            console.log('设置下一个作业区')//设置下一个作业区域
            self.setData({
              mapViewDisplay: 1,
              operateViewDisplay: 1,
              setOperateWidthViewDisplay: 0,
              navViewDisplay: 0,
              
            })
            // console.log(self.data.allOperationArray);
            allOperationArrayLength = self.data.allOperationArray.length;
            console.log("作业区总个数"+allOperationArrayLength);
            polylineLength = self.data.polyline.length;
            // console.log(polylineLength);
            // for(var i = 0 ;i<allOperationArrayLength;i++){
            //   self.data.polyline[polylineLength] = {
            //     points: self.data.allOperationArray[i],
            //     color: "#FF0000DD",
            //     width: 2,
            //     dottedLine: true
            //   }
            // }
            
            self.data.operationArray = [];
            self.setData({
              // operationArray: _this.data.operationArray,
              operationArray: self.data.operationArray,
              allOperationArray: self.data.allOperationArray,
              polyline: self.data.polyline
            })
            console.log("当前作业区域的里面的节点个数" + self.data.operationArray.length);
          } else if (res.cancel) {
            wx.showModal({
              title: '提示',
              content: '是否结束设置作业区域',
              success: function (res) {
                if (res.confirm) {
                  console.log('导航')//回到开始导航的页面
                  self.setData({
                    mapViewDisplay: 1,
                    operateViewDisplay: 0,
                    setOperateWidthViewDisplay: 0,
                    navViewDisplay: 1,
                  })
                } else if (res.cancel) {
                  console.log('回到作业区页面')//如果用户点击取消，回到设置作业区域的页面
                }
              }
            })
          }
        }
      })
    },

    // *********************************************************导航***********************************************************************   
    //开始导航
    startNavigation:function(){
        this.data.liveLocation = this.data.startPosition;
        var _this = this;
        var polylineLength = this.data.polyline.length;

        var result = this.findLatelyNavLine(this.data.liveLocation,this.data.polyline);
        //this.data.polyline[result.lineIndex].points[result.linePointsIndex]是什么意思？是不是找到最近的点？
        this.data.polyline[polylineLength] = {
            points: [this.data.liveLocation,this.data.polyline[result.lineIndex].points[result.linePointsIndex]],
            color: "#128612",
            width: 2,
            dottedLine: true,
        }

        this.setData({
            polyline:this.data.polyline
        })

        var navPoints=[];

        if( result.lineIndex == 1 ){
            for( var i = 1 ; i < this.data.polyline.length ; i ++ ) {
                if(result.linePointsIndex==0){
                    if(i % 2 == 0){
                        navPoints.push(this.data.polyline[i].points[1])
                        navPoints.push(this.data.polyline[i].points[0])
                    }else{
                        navPoints.push(this.data.polyline[i].points[0])
                        navPoints.push(this.data.polyline[i].points[1])
                    }
                }else{
                    if(i % 2 == 0){
                        navPoints.push(this.data.polyline[i].points[0])
                        navPoints.push(this.data.polyline[i].points[1])
                    }else{
                        navPoints.push(this.data.polyline[i].points[1])
                        navPoints.push(this.data.polyline[i].points[0])
                    }
                }
            }
        }else{
            for( var i = this.data.polyline.length - 1 ,count=1; i > 0 ; i -- ,count++) {
                if(result.linePointsIndex == 0 ){
                    if( count% 2 == 0 ){
                        navPoints.push(this.data.polyline[i].points[1])
                        navPoints.push(this.data.polyline[i].points[0])
                    }else{
                        navPoints.push(this.data.polyline[i].points[0])
                        navPoints.push(this.data.polyline[i].points[1])
                    }
                }else{
                    if( count% 2 == 0 ){
                        navPoints.push(this.data.polyline[i].points[0])
                        navPoints.push(this.data.polyline[i].points[1])
                    }else{
                        navPoints.push(this.data.polyline[i].points[1])
                        navPoints.push(this.data.polyline[i].points[0])
                    }
                }
            }
        }

        // var startNav = setInterval(getLiveLocation,2000);
        var polylineLengthNav = this.data.polyline.length;//找到polyline的长度，在polyline[polylineLengthNav]存放飞机作业时经过的点
        var startGetLiveLocation = setInterval(getLiveLocation, 2000);
        var navIndex = 0;
        function getLiveLocation(){
          if (_this.data.stopFlag){
                clearInterval(startGetLiveLocation);
                return;
              }
            wx.getLocation({
                type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
                success: function (res) {
                    _this.data.liveLocation = {
                        latitude: res.latitude,
                        longitude: res.longitude,
                    };

                    _this.data.navigationDot.push({
                      longitude: res.longitude,
                      latitude: res.latitude
                    });//将飞机飞行经过的点存放在navigationDot数组中

                    var len = Math.pow( ((res.longitude - navPoints[navIndex].longitude)*111000),2)+Math.pow( ((res.latitude - navPoints[navIndex].latitude)*111000),2);

                    //距离小于5m时，自动导航到下一个点
                    if(len <= 5){
                        navIndex ++ ;
                    }

                    _this.data.polyline[polylineLength] = {
                        points: [_this.data.liveLocation,navPoints[navIndex]],
                        color: "#128612",
                        width: 2,
                        dottedLine: true,
                    }

                  _this.data.polyline[polylineLengthNav] = {
                    points: _this.data.navigationDot,
                    color: "#898989",
                    width: 10,
                    dottedLine: false,
                  }

                    _this.setData({
                        polyline:_this.data.polyline,
                        liveLocation:_this.data.liveLocation,
                        navigationDot: _this.data.navigationDot
                    })
                }
            })
        }
    },

    //结束导航
    finishNavigation:function(){
      // clearInterval(startNav);
      this.setData({
        stopFlag:1
      })
    },
    
    //找到离出发点最近的航线，以及该航线上离出发点最近的点。
    findLatelyNavLine:function(startPoint,polyline){
        var polylineLength = polyline.length;

        var lenOfFirstNavLine0 = {
            value:Math.pow( ((startPoint.longitude-polyline[1].points[0].longitude)*111000),2)+Math.pow( ((startPoint.latitude-polyline[1].points[0].latitude)*111000),2),
            lineIndex:1,
            linePointsIndex:0,
        };
        var lenOfFirstNavLine1 = {
            value:Math.pow( ((startPoint.longitude-polyline[1].points[1].longitude)*111000),2)+Math.pow( ((startPoint.latitude-polyline[1].points[1].latitude)*111000),2),
            lineIndex:1,
            linePointsIndex:1,
        };
        var lenOfLastNavLine0 = {
            value:Math.pow( ((startPoint.longitude-polyline[polylineLength-1].points[0].longitude)*111000),2)+Math.pow( ((startPoint.latitude-polyline[polylineLength-1].points[0].latitude)*111000),2),
            lineIndex:polylineLength-1,
            linePointsIndex:0,
        };

        var lenOfLastNavLine1 = {
            value:Math.pow( ((startPoint.longitude-polyline[polylineLength-1].points[1].longitude)*111000),2)+Math.pow( ((startPoint.latitude-polyline[polylineLength-1].points[1].latitude)*111000),2),
            lineIndex:polylineLength-1,
            linePointsIndex:1,
        };
        var arr = [lenOfFirstNavLine0,lenOfFirstNavLine1,lenOfLastNavLine0,lenOfLastNavLine1];
        arr.sort(function(itema,itemb){
            return itema.value-itemb.value
        });
        return {
            lineIndex:arr[0].lineIndex,
            linePointsIndex:arr[0].linePointsIndex,
        }

    },
    //**************************************************生成航线****************************************
    generateNavLine:function() {
        // var _this = this;
        console.log("生成航线模块" + this.data.polylineAllLength);
        var weiduMinPoint, jingduMinPoint;
        var headingAngle = this.data.headingAngle < 0 ? this.data.headingAngle+180 : this.data.headingAngle;
        var copyOperationArray = JSON.parse(JSON.stringify(this.data.operationArray));
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

        var basePoint = this.basePoint(jingduMinPoint.latitude, jingduMinPoint.longitude, headingAngle, weiduMinPoint.latitude,this.data.polyline[this.data.polylineAllLength].points);
        //第一次根据基准点求偏移点，偏移量是幅宽的一半
        var basePointOffset = this.ComputeOffset(basePoint.latitude, basePoint.longitude, this.data.operateWidth /2 , headingAngle + 90);

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
            basePointOffset = this.ComputeOffset(basePointOffset.latitude, basePointOffset.longitude, this.data.operateWidth, headingAngle + 90);

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
        // var j = this.data.polylineAllLength;
        
        console.log(this.data.polylineAllLength);
        // ****************为什么可以对polyline赋值，并没有影响前面polyline数组里面的值*****************
        for (var j = 0; j < (this.data.crossPoints.length); j++) {
            console.log("循环内的polyline长度"+this.data.polyline.length);
            this.data.polyline[j + 1] = {
                points: this.data.crossPoints[j],
                color: "#128612",
                width: 2,
                dottedLine: false,
            }
        }
        console.log(this.data.polyline);
        this.setData({
            polyline: this.data.polyline,
            operationArray:this.data.operationArray
        })

    },
    //找到中间点的基点，即第一个点的函数,求航线和作业区交点的第一个点，（这个点根据已知直线和点以及点在直线的角度，求交点得出的）
    basePoint:function(vLat0, vLon0, vHeading, vLat1, allPoints) {
        // A0*X + Bo*Y + C0 = 0
        var pKAngle = Heading2KAndgle(vHeading);
        var A0 = Math.tan(pKAngle * Math.PI / 180);//斜率
        var B0 = -1;
        var C0 = vLat0 - Math.tan(pKAngle * Math.PI / 180) * vLon0;

        //求出距离 经过最小经度点的直线的左边最远的点
        var result = 0,resultKey = 0,flag = false;

        for(var i = 0 ; i < allPoints.length-1 ; i ++ ){
            if(A0*allPoints[i].longitude+B0*allPoints[i].latitude+C0 < result){
                resultKey=i;
                result = A0*allPoints[i].longitude+B0*allPoints[i].latitude+C0;
                flag = true;
            }
        }
        //如果有点在直线的左边，那就重新设置C0
        if(flag){
            C0 = allPoints[resultKey].latitude - Math.tan(pKAngle * Math.PI / 180) * allPoints[resultKey].longitude;
        }

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
