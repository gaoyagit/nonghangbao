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

///判断起始位置离第一条航线近还是最后一条航线近，并找到航线的起始点
function FindStartLine(vLat0, vLon0, tuple) {//飞机起始位置的维度、经度、航线点
    var A1, A2;//Ax+By+C=0
    var B1, B2;
    var C1, C2;
    var d1, d2;//点到线段的距离
    var d11, d12, d21, d22;//起始点到first[0][0],first[0][1],last[0][0],last[0][1]的距离
    var first = tuple[0];//tuple[0]
    var last = tuple[tuple.length - 1];//tuple[tuple.length - 1]
    // tuple[0][0]相当于第一个点  tuple[0][1]相当于第二个点
    A1 = first[0].latitude - first[1].latitude;//latitude-->y  longitude-->x
    B1 = first[1].longitude - first[0].longitude;
    C1 = (first[0].longitude * first[1].latitude) - (first[1].longitude * first[0].latitude);
    d1 = Math.abs(A1 * vLon0 + B1 * vLat0 + C1) / Math.sqrt(A1 * A1 + B1 * B1);
    d11 = Math.pow((first[0][0].latitude - vLat0), 2) + Math.pow((first[0][0].longitude - vLon0), 2);
    d12 = Math.pow((first[0][first[0].length - 1].latitude - vLat0), 2) + Math.pow((first[0][first[0].length - 1].longitude - vLon0), 2);

    A2 = last[0].latitude - last[1].latitude;//latitude-->y  longitude-->x
    B2 = last[1].longitude - last[0].longitude;
    C2 = (last[0].longitude * last[1].latitude) - (last[1].longitude * last[0].latitude);
    d2 = Math.abs(A2 * vLon0 + B2 * vLat0 + C2) / Math.sqrt(A2 * A2 + B2 * B2);
    d21 = Math.pow((last[0][0].latitude - vLat0), 2) + Math.pow((last[0][0].longitude - vLon0), 2);
    d22 = Math.pow((last[0][last[0].length - 1].latitude - vLat0), 2) + Math.pow((last[0][last[0].length - 1].longitude - vLon0), 2);

    if (d1 <= d2) {
        if (d11 < d12) {
            for (var i = 0; i < tuple.length; i++) {
                if (i / 2 != 0) {
                    tuple[i] = tuple[i].reverse();
                }
            }
        } else {
            for (var i = 0; i < tuple.length; i++) {
                if (i / 2 == 0) {
                    tuple[i] = tuple[i].reverse();
                }
            }
        }
    } else {
        tuple = tuple.reverse();
        if (d21 < d22) {
            for (var i = 0; i < tuple.length; i++) {
                if (i / 2 != 0) {
                    tuple[i] = tuple[i].reverse();
                }
            }
        } else {
            for (var i = 0; i < tuple.length; i++) {
                if (i / 2 == 0) {
                    tuple[i] = tuple[i].reverse();
                }
            }
        }

    }
    return tuple;

}


Page({
    onReady: function (e) {
        // 使用 wx.createMapContext 获取 map 上下文
        this.mapCtx = wx.createMapContext('myMap')
    },
    data: {
        displayText: '设置作业区域',
        mapHeight: 0,
        scale: 13,
        latitude: "",
        longitude: "",
        markers: [],
        circles: [],
        latitude0: '',
        longitude0: '',
        fukuan: 0,//幅宽的值
        headingangle: 0,//航向角的值


        display: 'none',
        items: [
            {name: 'zuoyequ', value: '作业区'},
            {name: 'bizhangdian', value: '避障点'},
            {name: 'jinfeiqu', value: '禁飞区'},
            // { name: 'shengchenghangxian', value: '生成航线' },
        ],

        setupType: -1,//0作业区,1避障点，2禁飞区,
        setupFlag: 0,//是否点击了设置
        windowHeight: 0,//屏幕的高度，不同的设备获取的高度不一样，这样做为了自适应


        zuoyeArray: [],//作业区的点的数组
        bizhangArray: [],//避障点的数组
        jinfeiArray: [],//禁飞区点的数组
        polyline: [], //polyline[0]存放作业区的点，polyline[1]存放禁飞区的点
        markersArray: [],
        zhongjiandian: [],//存放生成航线的中间点
        tuple: [],//存放射线与线段之间的交点的数组
        map: [],
    },
    onLoad: function () {
        var _this = this;
        wx.getLocation({
            success: function (res) {
                latitude0: res.latitude   //飞机当前位置的维度
                longitude0: res.longitude //飞机当前位置的经度
            },
        })
        wx.getSystemInfo({
            success: function (res) {
                //设置map高度，根据当前设备宽高满屏显示
                _this.setData({
                    windowHeight: res.windowHeight,//屏幕高度
                    mapHeight: res.windowHeight - 45,
                    controls: [{
                        id: 1,
                        iconPath: '/pages/images/jia.jpg',
                        position: {
                            left: res.windowWidth - 50,
                            top: 10,
                            width: 20,
                            height: 20
                        },
                        clickable: true
                    },
                        {
                            id: 2,
                            iconPath: '/pages/images/jian.jpg',
                            position: {
                                left: res.windowWidth - 30,
                                top: 10,
                                width: 20,
                                height: 20
                            },
                            clickable: true
                        },
                        {
                            id: 3,
                            iconPath: '/pages/images/location1.png',
                            position: {
                                left: res.windowWidth / 2 - 15,
                                top: (res.windowHeight - 45) / 2 - 30,
                                width: 30,
                                height: 30
                            },
                            clickable: true
                        }
                    ]
                })
            }
        })

        wx.getLocation({
            type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            success: function (res) {

                _this.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                })
            }
        })
    },
    //点击缩放按钮动态请求数据
    controltap(e) {
        //console.log(e)
        var that = this;

        //console.log("scale===" + that.data.scale)
        if (e.controlId === 1) {
            that.setData({
                scale: ++that.data.scale
            })

        } else if (e.controlId === 2) {
            that.setData({
                scale: --that.data.scale
            })
        } else if (e.controlId === 3) {
            if (that.data.setupType == 0) {
                this.mapCtx.getCenterLocation({
                    success: function (res) {
                        var len = that.data.zuoyeArray.length
                        if (len < 2) {
                            that.data.zuoyeArray.push({
                                longitude: res.longitude,
                                latitude: res.latitude
                            });//只有一个点的时候，直接添加进去第二个点，
                        } else if (len == 2) {
                            //只有2个点的时候，直接添加进去第3个点，然后，末尾位置放第一个点
                            that.data.zuoyeArray.push({
                                longitude: res.longitude,
                                latitude: res.latitude
                            })
                            that.data.zuoyeArray.push(that.data.zuoyeArray[0])
                        } else if (len > 2) {
                            // console.log(that.data.zuoyeArray)
                            //大于2个点的时候，直接在倒数第二个位置放置新添加的点
                            that.data.zuoyeArray.splice(that.data.zuoyeArray.length - 1, 0, {
                                longitude: res.longitude,
                                latitude: res.latitude
                            })
                            // console.log(that.data.zuoyeArray)
                        }
                        that.data.polyline[0] = {
                            points: that.data.zuoyeArray,
                            color: "#FF0000DD",
                            width: 2,
                            dottedLine: true
                        }
                        that.setData({
                            zuoyeArray: that.data.zuoyeArray,
                            polyline: that.data.polyline
                        })
                    }
                })
            } else if (that.data.setupType == 1) {
                //避障点的处理
                this.mapCtx.getCenterLocation({
                    success: function (res) {
                        var len = that.data.bizhangArray.length
                        that.data.bizhangArray.push({
                            longitude: res.longitude,
                            latitude: res.latitude,
                            // iconPath: '/pages/images/4.jpg'
                        });
                        //console.log(len)
                        var longitude1 = that.data.bizhangArray[0].longitude
                        var latitude1 = that.data.bizhangArray[0].latitude
                        //console.log(longitude1)
                        for (var i = 0; i <= that.data.bizhangArray.length; i++) {
                            that.data.markers.push({
                                id: i,
                                longitude: res.longitude,
                                latitude: res.latitude,
                                iconPath: '/pages/images/biaoji.png'

                            })
                        }
                        that.setData({
                            bizhangArray: that.data.bizhangArray,
                            markers: that.data.markers,
                        })
                    }
                })
            } else if (that.data.setupType == 2) {
                //禁飞区处理
                if (that.data.polyline[0] == null) {
                    wx.showModal({
                        title: '提示',
                        content: '请先设置作业区',
                    })
                } else {
                    this.mapCtx.getCenterLocation({
                        success: function (res) {
                            var len = that.data.jinfeiArray.length
                            if (len < 2) {
                                that.data.jinfeiArray.push({
                                    longitude: res.longitude,
                                    latitude: res.latitude
                                });//只有一个点的时候，直接添加进去第二个点，
                            } else if (len == 2) {
                                //只有2个点的时候，直接添加进去第3个点，然后，末尾位置放第一个点
                                that.data.jinfeiArray.push({
                                    longitude: res.longitude,
                                    latitude: res.latitude
                                })
                                that.data.jinfeiArray.push(that.data.jinfeiArray[0])
                            } else if (len > 2) {
                                //大于2个点的时候，直接在倒数第二个位置放置新添加的点
                                //splice(index,howmany,item1...itemx)index:规定添加/删除位置.howmany:删除数量
                                //item1...itemx:(可选)添加新项目
                                that.data.jinfeiArray.splice(that.data.jinfeiArray.length - 1, 0, {
                                    longitude: res.longitude,
                                    latitude: res.latitude
                                })
                            }
                            that.data.polyline[1] = {
                                points: that.data.jinfeiArray,
                                color: "#000000",
                                width: 2,
                                dottedLine: true
                            }
                            that.setData({
                                jinfeiArray: that.data.jinfeiArray,
                                polyline: that.data.polyline
                            })
                        }
                    })
                }
            }
        }
    },
    setHeight: function () {
        if (this.data.setupFlag == 1) {
            var that = this;
            wx.showModal({
                title: '提示',
                content: '是否生成航线',
                success: function (res) {
                    if (res.confirm) {
                        that.data.setupType = -1
                        that.data.controls[2].position.top = that.data.setupFlag == 0 ? (that.data.windowHeight - 150) / 2 - 30 : (that.data.windowHeight - 45) / 2 - 30;
                        that.setData({
                            setupFlag: that.data.setupFlag == 0 ? 1 : 0,
                            mapHeight: that.data.setupFlag == 0 ? that.data.windowHeight - 150 : that.data.windowHeight - 45,
                            displayText: "生成航线",
                            display: that.data.setupFlag == 0 ? 'block' : 'none',
                            controls: that.data.controls,
                        })
                        var mubiaodian//存放维度最小的点
                        //为了解除引用关系复制对象或者数组，如果是浅层的数组或对象(也就是数组中不包含对象或数组)，可以通过slice或者concat方法直接实现。
                        var testArray = JSON.parse(JSON.stringify(that.data.zuoyeArray))  //testArray作业点的备份
                        // var testArray = that.data.zuoyeArray.slice(0)
                        // testArray[0] = 0
                        var minlatitude = testArray[0].latitude
                        var maxlatitude = testArray[0].latitude
                        var maxlongitude = testArray[0].longitude
                        var minlongitude = testArray[0].longitude
                        var len1 = testArray.length
                        //var testarry = polyline[0].sort();
                        //console.log(minlatitude)
                        //找到最大最小经纬度
                        for (var i = 0; i < len1; i++) {
                            if (testArray[i].latitude < minlatitude) {
                                minlatitude = testArray[i].latitude
                            } else if (testArray[i].latitude > maxlatitude) {
                                maxlatitude = testArray[i].latitude
                            }
                            if (testArray[i].longitude < minlongitude) {
                                minlongitude = testArray[i].longitude
                            } else if (testArray[i].longitude > maxlongitude) {
                                maxlongitude = testArray[i].longitude
                            }
                        }

                        //找到最小的经度的点作为起始点

                        var mubiaodian0//最小维度的点为mubiaodian0
                        var headingangle = parseInt(that.data.headingangle)//航向角的值
                        for (var i = 0; i < len1; i++) {
                            if (testArray[i].longitude == minlongitude) {
                                mubiaodian = testArray[i]
                            }
                            if (testArray[i].latitude == minlatitude) {
                                mubiaodian0 = testArray[i]
                            }
                        }

                        /****************************************已知一个点、距离、航向角，求终点********************************** */
                        var rLat
                        var rLon

                        function ComputeOffset(vLat, vLon, vDistance, vHeading) {
                            var pDistanceArc = vDistance / vRadius;
                            var pHArc = Angle2Arc(vHeading);
                            var pLatArc = Angle2Arc(vLat);
                            var pDAC = Math.cos(pDistanceArc);
                            var pDAS = Math.sin(pDistanceArc);
                            var pLAS = Math.sin(pLatArc);
                            var pLAC = Math.cos(pLatArc);
                            var rLatS = pDAC * pLAS + pDAS * pLAC * Math.cos(pHArc);
                            rLat = Arc2Angle(Math.asin(rLatS));
                            rLon = Arc2Angle(Angle2Arc(vLon) + Math.atan2(pDAS * pLAC * Math.sin(pHArc), pDAC - pLAS * rLatS));
                        }

                        /************************************************************************** */

                        //找到中间点的基点，即第一个点的函数
                        function basePoint(vLat0, vLon0, vHeading, vLat1) {
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
                            return basepoint
                        }

                        //***********************************找第一个中间点********************************************** */
                        var fukuan = parseInt(that.data.fukuan)
                        var fukuanHeadingangle = parseInt(headingangle + 90)//生成每一个中间点的方向角
                        var baseradia2line//找到中间点的基点与作业区之间的交点
                        var baseradia2lineArray = []//找到中间点的基点与作业区之间的交点存放到baseradia2lineArray
                        var centerangle = parseInt(fukuanHeadingangle - 180) //与中间点的航向角相反的角度
                        var basepoint0 = basePoint(mubiaodian.latitude, mubiaodian.longitude, headingangle, mubiaodian0.latitude)
                        mubiaodian.latitude = basepoint0[0].latitude
                        mubiaodian.longitude = basepoint0[0].longitude
                        for (var i = 0; i < that.data.zuoyeArray.length - 1; i++) {
                            baseradia2line = LineCross(mubiaodian.latitude, mubiaodian.longitude, headingangle, that.data.zuoyeArray[i].latitude, that.data.zuoyeArray[i].longitude, that.data.zuoyeArray[i + 1].latitude, that.data.zuoyeArray[i + 1].longitude)
                            if (baseradia2line.length > 0) {
                                baseradia2lineArray.push({
                                    longitude: baseradia2line.longitude,
                                    latitude: baseradia2line.latitude
                                })
                                baseradia2line.length = 0
                            }

                        }
                        while (baseradia2lineArray.length > 0) {
                            baseradia2lineArray.length = 0
                            ComputeOffset(mubiaodian.latitude, mubiaodian.longitude, fukuan, centerangle)
                            mubiaodian.latitude = rLat
                            mubiaodian.longitude = rLon
                            for (var i = 0; i < that.data.zuoyeArray.length - 1; i++) {
                                baseradia2line = LineCross(mubiaodian.latitude, mubiaodian.longitude, headingangle, that.data.zuoyeArray[i].latitude, that.data.zuoyeArray[i].longitude, that.data.zuoyeArray[i + 1].latitude, that.data.zuoyeArray[i + 1].longitude)
                                if (baseradia2line.length > 0) {
                                    baseradia2lineArray.push({
                                        longitude: baseradia2line.longitude,
                                        latitude: baseradia2line.latitude
                                    })
                                    baseradia2line.length = 0
                                }
                            }
                        }

                        /********************************************************************************* */



                        //把第一个目标点，也就是基点(最小经度的点，纬度设置成最小的维度)放进zhongjiandian
                        //mubiaodian.latitude = minlatitude,
                        that.data.zhongjiandian.push({
                            longitude: mubiaodian.longitude,
                            latitude: mubiaodian.latitude
                        })

                        var minlon2maxlonlength = maxlongitude - minlongitude
                        //1度相当于111km
                        var fukuan = parseInt(that.data.fukuan)

                        for (var i = 0; i < minlon2maxlonlength * 111000; i = i + fukuan) {
                            if (mubiaodian.latitude == that.data.zhongjiandian[0].latitude && mubiaodian.longitude == that.data.zhongjiandian[0].longitude) {
                                ComputeOffset(mubiaodian.latitude, mubiaodian.longitude, fukuan / 2, fukuanHeadingangle)
                            } else {
                                ComputeOffset(mubiaodian.latitude, mubiaodian.longitude, fukuan, fukuanHeadingangle)
                            }

                            mubiaodian.latitude = rLat
                            mubiaodian.longitude = rLon
                            that.data.zhongjiandian.push({
                                longitude: mubiaodian.longitude,
                                latitude: mubiaodian.latitude
                            })
                        }

                        //找到中间点使中间点的latitude都设置成最小的latitude
                        for (var i = 0; i < that.data.zhongjiandian.length; i++) {
                            that.data.markers.push({
                                longitude: that.data.zhongjiandian[i].longitude,
                                latitude: that.data.zhongjiandian[i].latitude,
                                iconPath: '/pages/images/dot.png'
                            })
                        }

                        if (that.data.polyline[1] == null) {//如果没有设置禁飞区，就把禁飞区定义成一个空数组
                            that.data.polyline[1] = {
                                points: [],
                                color: "#128612",
                                width: 3,
                                dottedLine: false,
                            }
                        }


                        /************************************找射线与线段的交点***************************************/

                        var radial2line = []//射线与线段的交点
                        var radial2linemap = []//存放每一个中间点发出的射线与作业区的交点
                        for (var i = 0; i < that.data.zhongjiandian.length; i++) {
                            for (var j = 0; j < that.data.zuoyeArray.length - 1; j++) {

                                radial2line = LineCross(that.data.zhongjiandian[i].latitude, that.data.zhongjiandian[i].longitude, headingangle,
                                    that.data.zuoyeArray[j].latitude, that.data.zuoyeArray[j].longitude, that.data.zuoyeArray[j + 1].latitude, that.data.zuoyeArray[j + 1].longitude)

                                if (radial2line.length > 0) {
                                    radial2linemap.push({
                                        longitude: radial2line[0].longitude,
                                        latitude: radial2line[0].latitude,
                                    })
                                }
                                radial2line.length = 0
                            }
                            that.data.tuple[i] = radial2linemap
                            radial2linemap = []
                        }
                        //console.log(that.data.tuple[1][0])
                        //tuple射线与线段的交点
                        for (var i = 0; i < that.data.tuple.length; i++) {
                            for (var j = 0; j < that.data.tuple[i].length; j++) {
                                that.data.markers.push({
                                    longitude: that.data.tuple[i][j].longitude,
                                    latitude: that.data.tuple[i][j].latitude,
                                    iconPath: '/pages/images/biaoji.png'
                                })
                            }
                            that.data.polyline[i + 2] = {
                                points: that.data.tuple[i],
                                color: "#128612",
                                width: 3,
                                dottedLine: false,
                            }

                        }
                        that.setData({
                            markers: that.data.markers,
                            polyline: that.data.polyline
                        })

                    } else if (res.cancel) {
                        return;
                    }
                }
            })
        } else {
            this.data.controls[2].position.top = this.data.setupFlag == 0 ? (this.data.windowHeight - 150) / 2 - 30 : (this.data.windowHeight - 45) / 2 - 30;
            this.setData({
                setupFlag: this.data.setupFlag == 0 ? 1 : 0,
                mapHeight: this.data.setupFlag == 0 ? this.data.windowHeight - 150 : this.data.windowHeight - 45,
                displayText: this.data.setupFlag == 0 ? '设置完毕' : '设置作业区域',
                display: this.data.setupFlag == 0 ? 'block' : 'none',
                controls: this.data.controls,
            })
        }
    },
    radioChange: function (e) {
        //console.log('radio发生change事件，携带value值为：', e.detail.value)
        if (e.detail.value == 'zuoyequ') {
            this.setData({
                setupType: 0,
            })
            console.log('这是作业区')
        } else if (e.detail.value == 'bizhangdian') {
            this.setData({
                setupType: 1,
            })
            console.log('这是避障点')
        } else if (e.detail.value == 'jinfeiqu') {
            this.setData({
                setupType: 2,
            })
            console.log('这是禁飞区')
        }
    },

    widthInput: function (e) {
        this.setData({
            fukuan: e.detail.value
        })
    },

    headingAngleInput: function (e) {
        this.setData({
            headingangle: e.detail.value
        })
    }
})