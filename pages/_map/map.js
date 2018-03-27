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


 /// 计算两点间的球面距离（单位为米）<param name="vRadius"></param>vRadius = EarthRadius
function ComputeSpacialDistance(vLat1, vLon1, vLat2,vLon2, vRadius)
{
  var pLat1Arc = Angle2Arc(vLat1);
  var pLat2Arc = Angle2Arc(vLat2);
  var pLon1Arc = Angle2Arc(vLon1);
  var pLon2Arc = Angle2Arc(vLon2);
  var pArcDistance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((pLat1Arc - pLat2Arc) / 2), 2) + Math.cos(pLat1Arc) * Math.cos(pLat2Arc) * Math.pow((Math.sin(pLon1Arc - pLon2Arc) / 2), 2)));
  return pArcDistance * vRadius;
}


/************************************************************************* 导航部分的代码*********************************************************/
/// 获取点到直线的距离，用于初略计算飞机所在位置距离哪一条航线的距离最近,X->lat(纬度)
function GetPointToLMinDistance(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2) {
  if (vLon0 == null || vLon1 == null || vLon2 == null) return -1;
  var A0 = vLon2 - vLon1;
  var B0 = vLat1 - vLat2;
  var C0 = vLon1 * vLat2 - vLat1 * vLon2;
  return Math.abs(A0 * vLat0 + B0 * vLon0 + C0) / Math.sqrt(A0 * A0 + B0 * B0);
}

///找到最短距离所在的位置
function GetMinDistancePostion(minDistanceArray) {
  var length = minDistanceArray.length;
  var minPosition = 0;//存放最短距离所在的位置
  for (var i = 0; i < length; i++) {
    if (minDistanceArray[i] == -1) {
      continue;
    } else {
      if (minDistanceArray[i] < minDistanceArray[minPosition]) {
        minPosition = i;
      }
    }
  }
  return minPosition;
}

//找到该航线所在的作业区域在polyline中的坐标,minDisPosition是飞机距离左右航线最短航线的polyline的坐标点,polylineArray:整个polyline数组
function GetNavAreaPosition(polylineArray,minDisPosition) {
  var flag = 0;
  var areaPosition;
  for (var i = minDisPosition; i >= 0; i--) {
    if (polylineArray[i].points.length > 3 && flag == 1) {
      areaPosition = i;
      flag = 0;
      break;
    } else {
      flag = 1;
      continue;
    }
  }
  return areaPosition;
}

//选中作业区域在polyline数组中最后一个航线的位置,StartPosition当前作业区域在polyline中的位置，polylineArray实参为polyline数组
function CurrentNavAreaEnd(polylineArray, StartPosition) {
  var endPosition;//存放选中作业区域在polyline数组中最后一个航线的位置
  for (var i = StartPosition + 1; i < polylineArray.length; i++) {
    if (i == polylineArray.length - 1){ // 最后一个了
      endPosition = i;
      break;
    }else if (polylineArray[i].points.length > 3){ //下一个作业区的位置
      endPosition = i-1;
      break;
    }
  }
  return endPosition;
}

//排序
function compat(v1,v2){
  if(v1>v2){
    return 1;
  }else if(v1<v2){
    return -1;
  }else{
    return 0;
  }
}

//找到离飞机所在位置最近的作业区域的坐标点，polylineArray----->实参为polyline数组,airPosition---->实参飞机所在的位置,allOperationAreaInPolyline---->所有作业区域数组,与polyline数组一一对应
function GetRecentAreaPosition(polylineArray, airPosition,allOperationAreaInPolyline) {

	var length = polylineArray.length - 2;//由于polyline最后一个位置存的是所有的导航经过的点，长度大于3，在进行找区域的操作中，应该舍弃
  var shortestAreaIndex = 0;//存放离飞机位置最近的作业区的索引
  var aircraftToSingleAreaDistance=[];//存放飞机距离每个作业区的边界点的距离
  var aircraftToAreaDistance=[];//存放飞机距离每个作业区的边界点的最短距离
  
  for (var i = 0; i < length; i++) {
    if (polylineArray[i].points.length > 3) {

			aircraftToSingleAreaDistance = [];
      //进行操作；把作业区域所有的点与飞机所在位置的点计算距离，写入airToSingleAreaDistance数组中
      for (var j = 0; j < polylineArray[i].points.length; j++) {
				aircraftToSingleAreaDistance.push(ComputeSpacialDistance(polylineArray[i].points[j].latitude, polylineArray[i].points[j].longitude, airPosition.latitude, airPosition.longitude, 6378136.49));
      }
			aircraftToAreaDistance.push(aircraftToSingleAreaDistance.sort(compat));
    } else {
			aircraftToAreaDistance.push(-1);
    }
  }


  // 找到距离飞机最近的作业区域在polyline中的位置
  for (var i = 0; i < length; i++) {
  	if(aircraftToAreaDistance[i] !== -1){
			if (( aircraftToAreaDistance[i][0] < aircraftToAreaDistance[shortestAreaIndex][0] ) && ( allOperationAreaInPolyline[i].flag == 0 )) {
				shortestAreaIndex = i;
			}
		}
  }

  return shortestAreaIndex;
}
//判断两个数组是否相同
function checkArr(arr1, arr2) {
  for (var i = 0; i < arr1.length; i++) {
    if ((arr1[i].latitude != arr2[i].latitude) || (arr1[i].longitude != arr2[i].longitude)) {
      return false;
    }
  }
  return true;

}


//判断作业区域的所有flag，未作业的flag = 0；作业过的flag = 1，若有未作业过的区域，返回true，全部作业返回,false，aircraftToNavIndexInPolyline由于allOperationAreaInPolyline是polyline数组的再现，包括飞机作业时的航点，在polyline【polyline.length】>2,所以传进来aircraftToNavIndexInPolyline作为找作业区域的终止长度
function getJudgmentAreaFlag(allOperationAreaInPolyline, aircraftToNavIndexInPolyline){
  
  var len = aircraftToNavIndexInPolyline;
  for(var i = 0 ;i< len;i++){
    if (allOperationAreaInPolyline[i] != -1 && allOperationAreaInPolyline[i].flag == 0){      
      return true;
      break;
    }
  } 
  return false;
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
        EarthRadius:6378136.49,
        polylineAllLength:0,//全局polyline长度
        operationDisplay:1,//控制是否显示设置作业区的按钮的选项
        allOperationArray: [],//所有作业区域的坐标点，例如allOperationArray[0]存放第一个作业区，allOperationArray[1]存放第二个作业区
        operationArray:[],//生成单个作业区的各个坐标点的数组
        operateWidth:0,//幅宽，也就是作业宽度
        currentAreaStartPosition:0,//当前工作区域在polyline中航线的起始点
        currentAreaEndPosition:0,//当前工作区域在polyline中的航线结束点
        vRadius:6378136.49,

        mapViewDisplay:1,//地图view
        operateViewDisplay:1,//设置作业区view
        setOperateWidthViewDisplay:0,//设置幅宽view
        navViewDisplay:0,//开始导航view

        resetDisabled:1,//重置按钮是否可用
        dataDisabled:1,//航向角幅宽按钮
        nextDisabled:0,//设置下一个按钮

        navButtonDisplay:1,//导航按钮

        headingAngle:0,//航向角的值

        crossPoints:[],//这个是什么？中间点与作业区的交点吗？

        liveLocation:{},//这是什么？导航时，经过的点？

        stopFlag: 0,//当stopFlag为1时清空导航的计时器，结束导航

        navigationDot: [],//飞机飞行经过的点
        startNavigationTimer: null,

        aircraftToNavIndexInPolyline:-1,//飞机与导航点的连线在polyline中的位置
        navOneAreaing: 0, //判断是否在导航一个区域，
        allOperationAreaInPolyline: [], //和polyline中的索引一一对应，航线的位置填-1
        navPoints: [],//每一次导航的时候，要飞航线点的顺序集合
        navIndex: 0,//导航的时候，navPoints航线点的索引

    },


	  
    // getLiveLocationTimes:1,
    

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
                    },
									  liveLocation:{
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
                        
                        
                       
                        _this.data.polyline[_this.data.polylineAllLength] = {
                            points: _this.data.operationArray,
                            color: "#FF0000DD",
                            width: 2,
                            dottedLine: false
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
        // _this.setData({
        //     operationDisplay:0,
        // })
        wx.showModal({
            title: '提示',
            content: '点击屏幕中央的红色定位按钮，并按照顺时针方向设置作业区',
            showCancel:false,
            success:function(){
                _this.setData({
                    operationDisplay:0,
                })
            }
        })
    },
    // *****************************************重新设置作业区**************************************************
    reSetOperationArea:function(){
        this.setData({
            operationArray: [],
            polyline:[],
            allOperationArray: [],
            polylineAllLength: 0
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
            dataDisabled:0,
            nextDisabled:1
        })
        _this.generateNavLine();
        _this.data.polylineAllLength = _this.data.polyline.length;
        
         
         
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
      self.data.allOperationArray.push({
        areaArray: self.data.operationArray,
        flag:0
      });
      wx.showModal({
        title: '提示',
        content: '是否设置下一个作业区域',
        success: function (res) {
          if (res.confirm) {          
            self.setData({
              mapViewDisplay: 1,
              operateViewDisplay: 1,
              setOperateWidthViewDisplay: 0,
              navViewDisplay: 0,
              nextDisabled:0,
              dataDisabled:1
              
            })
            
            allOperationArrayLength = self.data.allOperationArray.length;
            
            polylineLength = self.data.polyline.length;
            
            
            self.data.operationArray = [];
            self.setData({
              // operationArray: _this.data.operationArray,
              operationArray: self.data.operationArray,
              allOperationArray: self.data.allOperationArray,
              polyline: self.data.polyline
            })
            
          } else if (res.cancel) {
            wx.showModal({
              title: '提示',
              content: '是否结束设置作业区域',
              success: function (res) {
                if (res.confirm) {
                  // console.log('导航')//回到开始导航的页面
                  self.setData({
                    mapViewDisplay: 1,
                    operateViewDisplay: 0,
                    setOperateWidthViewDisplay: 0,
                    navViewDisplay: 1,
                    aircraftToNavIndexInPolyline:self.data.polyline.length
                  })

                  for (var i = 0; i < self.data.polyline.length; i++) {
                    if (self.data.polyline[i].points.length > 3) {//作业区
                      for (var j = 0; j < self.data.polyline[i].points.length;j++)
                        console.log("self.data.polyline[i].points" +"["+i+"]"+ self.data.polyline[i].points[j].latitude + "self.data.polyline[i].points" + self.data.polyline[i].points[j].longitude)
                    } 

                  }

                } else if (res.cancel) {
                  console.log('回到作业区页面')//如果用户点击取消，回到设置作业区域的页面
                }
              }
            })
          }
        }
      })
    },

	startNavigation:function(){

    this.data.allOperationAreaInPolyline = [];
    
		for (var i = 0,index = 0; i < this.data.polyline.length; i++) {
			if (this.data.polyline[i].points.length > 3) {//作业区
				this.data.allOperationAreaInPolyline.push(this.data.allOperationArray[index]);
				index++;
			} else {//航线
				this.data.allOperationAreaInPolyline.push(-1);
			}
      
		}

    

    // console.log("startNavigation" + this.data.aircraftToNavIndexInPolyline);
		this.data.startNavigationTimer = setInterval(this.getLiveLocation,2000)
	},
	getLiveLocation:function(){

    	if(!this.data.navOneAreaing){//是否在导航一个区域。如果没有，那就寻找下一个导航区域
				this.data.navOneAreaing = 1
				//判断是否还有区域没有 导航
        if (getJudgmentAreaFlag(this.data.allOperationAreaInPolyline, this.data.aircraftToNavIndexInPolyline)) {

					var aircraftPosition = this.data.liveLocation ;//飞机所在的位置

					//  要导航区域的索引
					var navAreaIndex = GetRecentAreaPosition(this.data.polyline, aircraftPosition, this.data.allOperationAreaInPolyline);//当前作业区在polyline中的位置

					var navAreaStartPosition = navAreaIndex + 1; //开始导航的索引
					var navAreaEndPosition = CurrentNavAreaEnd(this.data.polyline, navAreaIndex); //结束导航的索引

					//改变选中作业区域的颜色
					this.data.polyline[navAreaStartPosition].color = "#424200";

					//改变作业区域的航线的颜色
					for (var i = navAreaStartPosition; i <= navAreaEndPosition; i++) {
						this.data.polyline[i].color = "#ff44ff"
					}
					// this.data.allOperationAreaInPolyline[navAreaIndex].flag = 1 // 将当前作业区设置为1

					var shortestLine = this.findLatelyNavLine(aircraftPosition, this.data.polyline, navAreaStartPosition, navAreaEndPosition, this.data.vRadius);//离飞机位置最近的航线

					

					this.data.navPoints = [] ;//当前区域导航的时候，要飞的航线的顺序集合

					/****************************************找到飞机实际飞行应该经过的点，也就是跳转的点*********************************************/
					if (shortestLine.lineIndex == navAreaStartPosition + 1) {
						for (var i = navAreaStartPosition; i < (navAreaEndPosition + 1); i++) {
              
							if (navAreaStartPosition % 2 == 0) {
								if (shortestLine.linePointsIndex == 0) {
									if (i % 2 == 0) {
										this.data.navPoints.push(this.data.polyline[i].points[0])
										this.data.navPoints.push(this.data.polyline[i].points[1])
									} else {
										this.data.navPoints.push(this.data.polyline[i].points[1])
										this.data.navPoints.push(this.data.polyline[i].points[0])
									}
								} else {
									if (i % 2 == 0) {
										this.data.navPoints.push(this.data.polyline[i].points[1])
										this.data.navPoints.push(this.data.polyline[i].points[0])
									} else {
										this.data.navPoints.push(this.data.polyline[i].points[0])
										this.data.navPoints.push(this.data.polyline[i].points[1])
									}
								}
							} else {
								if (shortestLine.linePointsIndex == 0) {
									if (i % 2 == 0) {
										this.data.navPoints.push(this.data.polyline[i].points[1])
										this.data.navPoints.push(this.data.polyline[i].points[0])
									} else {
										this.data.navPoints.push(this.data.polyline[i].points[0])
										this.data.navPoints.push(this.data.polyline[i].points[1])
									}
								} else {
									if (i % 2 == 0) {
										this.data.navPoints.push(this.data.polyline[i].points[0])
										this.data.navPoints.push(this.data.polyline[i].points[1])
									} else {
										this.data.navPoints.push(this.data.polyline[i].points[1])
										this.data.navPoints.push(this.data.polyline[i].points[0])
									}
								}
							}

						}
					} else {
						for (var i = navAreaEndPosition; i > navAreaStartPosition-1; i--) {
						
              if (navAreaEndPosition % 2 == 0) {
                if (shortestLine.linePointsIndex == 0) {
                  if (i % 2 == 0) {
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                  } else {
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                  }
                } else {
                  if (i % 2 == 0) {
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                  } else {
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                  }
                }
              } else {
                if (shortestLine.linePointsIndex == 0) {
                  if (i % 2 == 0) {
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                  } else {
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                  }
                } else {
                  if (i % 2 == 0) {
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                  } else {
                    this.data.navPoints.push(this.data.polyline[i].points[1])
                    this.data.navPoints.push(this.data.polyline[i].points[0])
                  }
                }
              }
						}
					}

          this.data.polyline[this.data.aircraftToNavIndexInPolyline] = {
            points: [aircraftPosition, this.data.navPoints[this.data.navIndex]],
            color: "#128612",
            width: 2,
            dottedLine: false,
          }
          
					this.setData({
						polyline: this.data.polyline,
						currentAreaStartPosition: navAreaStartPosition,
						currentAreaEndPosition: navAreaEndPosition
					})

				}else{
					console.log('导航结束了')
					this.finishNavigation();
				}
			}else{
        // this.navOneAreaing = 0
    		var _this = this ;
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


            if ((_this.data.navIndex > (_this.data.currentAreaEndPosition - _this.data.currentAreaStartPosition) * 2) && (ComputeSpacialDistance(
              res.latitude,
              res.longitude,
              _this.data.navPoints[_this.data.navPoints.length - 1].latitude,
              _this.data.navPoints[_this.data.navPoints.length - 1].longitude,
              _this.data.vRadius)) < 1000) {
              _this.data.navOneAreaing = 0;
              _this.data.navIndex = 0;
              _this.data.allOperationAreaInPolyline[_this.data.currentAreaStartPosition - 1].flag = 1 // 将当前作业区设置为1
              for (var i = _this.data.currentAreaStartPosition -1 ; i <= _this.data.currentAreaEndPosition; i++) {
                _this.data.polyline[i].color = "#999999";
              }

            }else{

              var len = ComputeSpacialDistance(
                _this.data.liveLocation.latitude,
                _this.data.liveLocation.longitude,
                _this.data.navPoints[_this.data.navIndex].latitude,
                _this.data.navPoints[_this.data.navIndex].longitude,
                _this.data.vRadius);

              //距离小于10m时，自动导航到下一个点
              if (len <= 1000) {
                _this.data.navIndex++;
              }

              _this.data.polyline[_this.data.aircraftToNavIndexInPolyline] = {
                points: [_this.data.liveLocation, _this.data.navPoints[_this.data.navIndex]], //_this.data.liveLocation, navPoints[navIndex]
                color: "#128612",
                width: 2,
                dottedLine: false,
              }

            } 

            //存航点
            _this.data.polyline[_this.data.aircraftToNavIndexInPolyline +1] = {
              points: _this.data.navigationDot,
              color: "#128612",
              width: 2,
              dottedLine: false,
            }

            console.log("_this.data.navigationDot" + _this.data.polyline.length);
            // if (_this.data.polyline.length == _this.data.aircraftToNavIndexInPolyline + 1){

            //   _this.data.polyline[_this.data.polyline.length] = {
            //     points: _this.data.navigationDot,
            //     color: "#128612",
            //     width: 2,
            //     dottedLine: false,
            //   }

            // }else{

            //   _this.data.polyline[_this.data.polyline.length - 1] = {
            //     points: _this.data.navigationDot,
            //     color: "#128612",
            //     width: 2,
            //     dottedLine: false,
            //   }

            // }


            _this.setData({
              polyline: _this.data.polyline,
              liveLocation: _this.data.liveLocation,
              navigationDot: _this.data.navigationDot
            })
            						
					}
				})
			}
		},
  pauseNavigation:function(){
    clearInterval(this.data.startNavigationTimer);
    this.setData({
      aircraftToNavIndexInPolyline: this.data.polyline.length-2
    })
  },
	finishNavigation:function(){
    var _this = this;
    clearInterval(this.data.startNavigationTimer);
    
      if (!getJudgmentAreaFlag(this.data.allOperationAreaInPolyline, this.data.aircraftToNavIndexInPolyline)){
        wx.showModal({
          title: '提示',
          content: '导航结束',
          showCancel: false,
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '确定要结束导航吗',
          success: function (res) {
            if (res.confirm) {
              wx.showModal({
                title: '提示',
                content: '导航结束',
                showCancel: false,
              })
            } else if (res.cancel) {
              // var _this = this;
              wx.showModal({
                title: '提示',
                content: '点击开始继续导航',
                showCancel: false,
                success(res){
                  _this.setData({
                    aircraftToNavIndexInPolyline: _this.data.polyline.length - 2
                  })
                }
              })
            }
          }
        })
      }
     
	},
   
    //找到离出发点最近的航线，以及该航线上离出发点最近的点。startPoint:飞机当前的位置，polyline：整个polyline数组；areaStartPostion：当前作业区域在polyline数组中的坐标，areaEndPosition：当前作业区域最后一条航线在polyline数组中的坐标,vRadius地球半径
    findLatelyNavLine: function (startPoint, polyline, areaStartPostion, areaEndPosition, vRadius){
        // var polylineLength = polyline.length;
      
        var lenOfFirstNavLine0 = {
          value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaStartPostion + 1].points[0].latitude, polyline[areaStartPostion + 1].points[0].longitude, vRadius),//飞机所在的位置距离作业区第一条航线的第一个端点的距离
          lineIndex: areaStartPostion + 1,//代表的是第几条线
          linePointsIndex: 0,//linePointIndex代表的是这个线的哪个端点
        };
        var lenOfFirstNavLine1 = {
          value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaStartPostion + 1].points[1].latitude, polyline[areaStartPostion + 1].points[1].longitude, vRadius),
          lineIndex: areaStartPostion + 1,
          linePointsIndex:1,
        };
        var lenOfLastNavLine0 = {
          value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaEndPosition].points[0].latitude, polyline[areaEndPosition].points[0].longitude, vRadius),
          lineIndex: areaEndPosition,
          linePointsIndex:0,
        };

        var lenOfLastNavLine1 = {
          value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaEndPosition].points[1].latitude, polyline[areaEndPosition].points[1].longitude, vRadius),
          lineIndex: areaEndPosition,
          linePointsIndex: 1,
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

        var basePoint = this.basePoint(jingduMinPoint.latitude, jingduMinPoint.longitude, headingAngle, weiduMinPoint.latitude,this.data.polyline[this.data.polyline.length-1].points);
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
        
        // ****************为什么可以对polyline赋值，并没有影响前面polyline数组里面的值*****************
        var crossPointsLength = this.data.crossPoints.length;//单个作业区域航线的个数
        for (var j = 0; j < crossPointsLength; j++) {
            this.data.polyline[this.data.polyline.length] = {
                points: this.data.crossPoints[j],
                color: "#128612",
                width: 2,
                dottedLine: false,
            }
        }
        
        this.setData({
            polyline: this.data.polyline,
            operationArray:this.data.operationArray,
            crossPoints:[]
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
