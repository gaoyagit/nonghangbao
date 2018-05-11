
var aircraftPointData = require('../../utils/genplainData.js')
var operationAreaData = require('../../utils/data.js')
var obj = require('../../utils/functionPackage.js')
Page({
  data: {
    polyline: [],
    markers: [],
    startPosition: {},
    latitude: '',
    longitude: '',
    mapHeight: '',
    scale: '14',
    EarthRadius: 6378136.49,
    polylineAllLength: 0,//全局polyline长度
    // operationDisplay: 1,//控制是否显示设置作业区的按钮的选项
    allOperationArray: [],//所有作业区域的坐标点，例如allOperationArray[0]存放第一个作业区，allOperationArray[1]存放第二个作业区
    operationArray: [],//生成单个作业区的各个坐标点的数组
    operateWidth: 0,//幅宽，也就是作业宽度
    currentAreaStartPosition: 0,//当前工作区域在polyline中航线的起始点
    currentAreaEndPosition: 0,//当前工作区域在polyline中的航线结束点
    vRadius: 6378136.49,

    mapViewDisplay: 1,//地图view
    setBaselineViewDisplay: 0,//设置基线view
    setOperateWidthViewDisplay: 0,//设置幅宽view
    setPlainLineViewDisplay: 1,//设置向左或者向右的导航线view
    selectPlainlineViewDisplay:0,//选择导航线

    //设置基线的按钮
    startSetBaselineButton:1,
    finishSetBaselineButton:1,
    resetBaselineButton:1,

    //设置向左飞还是向右飞的按钮
    setLeftPlainLineButton:1,
    setRightPlainLineButton:1,
    leftPlainLineFlag: 0,//向左设置航线，leftPlainLineFlag置为1
    rightPlainLineFlag: 0,//向右设置航线，rightPlainLineFlag置为1

    //设置上一条下一条以及结束导航按钮
    previousPlainlineButton:1,
    finishNavigationButton:1,
    nextPlainlineButton:1,

    baselineStartPoint: {},//基线开始的点
    baselineFinishPoint: {},//基线结束的点
    trackPointer:0,//指向存航迹的polyline数组下标，偶数存航迹
    plainlinePointer:3,//指向存航线的polyline数组下标，奇数存航线，以及辅助导航线,0放轨迹，1放即将作业导航线的延长线，从3开始放航线

    navButtonDisplay: 1,//导航按钮

    headingAngle: 0,//航向角的值

    crossPoints: [],//这个是什么？中间点与作业区的交点吗？

    liveLocation: {},//飞机实时所在的位置

    stopFlag: 0,//当stopFlag为1时清空导航的计时器，结束导航

    navigationDot: [],//飞机飞行经过的点
    allNavigationDot: [],//总数组  飞机飞行经过的点

    startNavigationTimer: null,

    indexOfAircraftToPointsInPolyline: -1,//飞机与导航点的连线在polyline中的位置
    navOneAreaing: 0, //判断是否在导航一个区域，
    allOperationAreaInPolyline: [], //和polyline中的索引一一对应，航线的位置填-1
    navPoints: [],//每一次导航的时候，要飞航线点的顺序集合
    navIndex: 0,//导航的时候，navPoints航线点的索引

    totalOperationArea: operationAreaData.mtData().list,//存放全部作业区域的数组

    wayPointsArray: aircraftPointData.mtData().list,//存放测试航点的数组
    wayPointIndex: 0,//二维坐标存放当前应该经过航点的数组坐标
    wayPointSubIndex: 0,//存放当前应该经过航点的坐标

    aircraftPointArrayInPolylineIndex: 0,//航点存放在polyline的位置

    startDisabled: 1,//开始按钮
    pauseDisabled: 0,//暂停按钮
    finishDisabled: 0,//结束按钮
    isClickPauseButton: 0,//是否点击了暂停按钮,
    isClickFinishButton: 0,//是否点击了结束按钮，并且想继续作业
    tempPolyline: [],//重现polyline，只有航线和作业区
  },

  // getLiveLocationTimes:1,


  onLoad: function () {
    var _this = this;
    this.mapCtx = wx.createMapContext('map');
    // //设置基线，点击开始开始记录航迹，点击开始的点为基线的起始点，点击结束时的点为基线的结束点
    // wx.showModal({
    //   title: '提示',
    //   content: '请设置基线', 
    //   success(res){
    //     _this.setData({
    //       startSetBaselineButton: 1,
    //       finishSetBaselineButton: 0,
    //       resetBaselineButton: 0,
    //     })
    //   } 
    // })
    // console.log(obj.Angle2Arc(20));
    //设置作业区域以及生成航线
    var currentOperationArea = [];//当前作业区域
    var longestSideArray;//存放最长边的信息
    // var headingAngle = 0;//最长边的角度
    var resultTest;

    var testFirstDot = {
      latitude: 46.1258794458852, longitude: 123.807504487728
    }
    var testSecondDot = {
      latitude: 46.120289377425, longitude: 123.809036698577,
    };
   
    
    // for (var i = 0; i < this.data.totalOperationArea.length; i++) {
    //   for (var j = 0; j < this.data.totalOperationArea[i].length - 1; j++) {
    //     currentOperationArea.push(this.data.totalOperationArea[i][j]);
    //   }
    //   this.data.polyline[this.data.polyline.length] = {
    //     points: currentOperationArea,
    //     color: "#FF0000DD",
    //     width: 2,
    //     dottedLine: false
    //   }

    //   currentOperationArea = [];
    //   this.data.operationArray = this.data.totalOperationArea[i];
    //   this.generateNavLine();
    // }

    this.data.polyline[this.data.polyline.length]={
      points: this.data.wayPointsArray,
      color: "#FF0000DD",
      width:2,
      dottedLine:false
    }

    this.data.baselineStartPoint = {
       latitude: 46.1246360206895, longitude: 123.815861216952 
    }

    this.data.baselineFinishPoint = {
      latitude: 46.1169805905205, longitude: 123.817905188901
    }
    //根据基线的两个点找到飞机飞行的航向角
    this.data.headingAngle = obj.GetAzimuth(
      this.data.baselineStartPoint.latitude,
      this.data.baselineStartPoint.longitude,
      this.data.baselineFinishPoint.latitude,
      this.data.baselineFinishPoint.longitude);
    // function computeOffset(vLat, vLon, vDistance, vHeading) {
    // function getExtensionLine(firstPoint, secondPoint, vDistance, vHeading) {
    var extensionLine = obj.getExtensionLine(this.data.baselineStartPoint, this.data.baselineFinishPoint, 1200, this.data.headingAngle)
    this.data.polyline[this.data.polyline.length] = {
      points: extensionLine,
      color: "#1639E2",
      width: 3,
      dottedLine: true
    }
    // console.log("this.data.polyline.length111111111:" + this.data.polyline.length);
    if (this.data.polyline.length % 2 == 0){
      this.data.polyline[this.data.polyline.length] = {
        points: [],
        color: "#FF0000DD",
        width: 2,
        dottedLine: false
      }
    }
    // console.log("this.data.polyline.length22222222:" + this.data.polyline[2].points.length);
    this.data.polyline[this.data.polyline.length] = {
      points: [this.data.baselineStartPoint, this.data.baselineFinishPoint],
      color: "#16E28D",
      width: 3,
      dottedLine: false
    }

    // console.log("this.data.polyline.length:"+this.data.polyline.length);
    
    this.setData({
      polyline: this.data.polyline,
      indexOfAircraftToPointsInPolyline: this.data.polyline.length,
      tempPolyline: this.data.polyline,

    })
    // console.log("indexOfAircraftToPointsInPolyline" + this.data.indexOfAircraftToPointsInPolyline);

    wx.getLocation({
      success: function (res) {
        _this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          startPosition: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          liveLocation: {
            latitude: res.latitude,
            longitude: res.longitude,
          }
        })
      },
    })
    //获取屏幕信息，设置操作地图的控件
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,//屏幕高度
          mapHeight: res.windowHeight - 46,//46
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
          }, {
            id: 2,
            iconPath: '/pages/images/circle_location.png',
            position: {
              left: res.windowWidth - 60,
              top: res.windowHeight - 146,
              width: 40,
              height: 40
            },
            clickable: true
          }]
        })
      }
    })

    // //请求测试
    // wx.request({
    //   url: 'http://123.127.160.69:8080/survey/jaxrs/surveydata/shapes', //仅为示例，并非真实的接口地址
    //   data: {
    //     "equipID": "qd0004",
    //     "equipPassword": "qd0004",
    //     "startTime": "2017-01-31 00:00:00",
    //     "endTime": "2017-05-31 00:00:00"
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   // method:GET,
    //   // dataType:JSON,
    //   success: function (res) {
    //     console.log(res.data)
    //   }
    // })
  },
  // ***********************************************回到当前位置设置*************************************************
  //生成作业区的点，形成作业区域
  controltap: function (e) {
    // var _this = this;

    if (e.controlId === 2) {
      this.mapCtx.moveToLocation();
      this.changeCircleLocationColor();
    }
  },
  //设置基线起始的点
  startSetBaseline:function(){
    //如果点击了结束导航，但是依旧要导航
    if (this.data.isClickFinishButton) {
      this.data.startNavigationTimer = setInterval(this.getLiveLocation, 200)
      return
    }
    var _this = this
    wx.getLocation({
      success: function (res) {
        _this.setData({
          baselineStartPoint: {
            latitude: res.latitude,
            longitude: res.longitude,
          }
        })
      },
    })
    this.data.startNavigationTimer = setInterval(this.getLiveLocation, 2000);
  },
  //设置基线的结束点
  finishSetBaseline:function(){
    var _this = this
    wx.getLocation({
      success: function (res) {
        _this.setData({
          baselineFinishPoint: {
            latitude: res.latitude,
            longitude: res.longitude,
          }
        })
      },
    });
    wx.showModal({
      title: '设置基线',
      content: '是否重设基线',
      success(res){

      }
    })
  },
  //重新设置基线
  resetBaseline:function(){
    this.setData({
      baselineFinishPoint: {},
      baselineStartPoint:{},
    })
  },

  //点击左，设置向左飞行的3条航线
  setLeftPlainLine:function(){  
    for(var i = 0 ;i < 3;i++){
      // this.data.baselineStartPoint, this.data.baselineFinishPoint
      //通过一条线段的两个端点，找距离该线段50米的另外一条线的两个端点
      var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, 50, this.data.headingAngle+90);
      var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, 50, this.data.headingAngle+90);

      if (this.data.polyline.length % 2 == 0) {
        this.data.polyline[this.data.polyline.length] = {
          points: [],
          color: "#FF0000DD",
          width: 2,
          dottedLine: false
        }
      }
      // console.log("this.data.polyline.length22222222:" + this.data.polyline[2].points.length);
      this.data.polyline[this.data.polyline.length] = {
        points: [plainLineFirstPoint, plainLineEndPoint],
        color: "#9515CA",
        width: 2,
        dottedLine: false
      }

      this.data.baselineStartPoint = plainLineFirstPoint
      this.data.baselineFinishPoint = plainLineEndPoint;
      plainLineFirstPoint = {};
      plainLineEndPoint={};

    }

    this.setData({
      polyline:this.data.polyline,
      baselineStartPoint: this.data.baselineStartPoint,
      baselineFinishPoint: this.data.baselineFinishPoint,
      setLeftPlainLineButton : 0,
      setRightPlainLineButton : 0,
      setPlainLineViewDisplay:0,
      selectPlainlineViewDisplay: 1,
      leftPlainLineFlag: 1,      
    })

  },

  //点击右，设置向右飞行的3条航线
  setRightPlainLine: function () {
    for (var i = 0; i < 3; i++) {
      // this.data.baselineStartPoint, this.data.baselineFinishPoint
      //通过一条线段的两个端点，找距离该线段50米的另外一条线的两个端点
      var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, 50, this.data.headingAngle - 90);
      var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, 50, this.data.headingAngle - 90);

      if (this.data.polyline.length % 2 == 0) {
        this.data.polyline[this.data.polyline.length] = {
          points: [],
          color: "#FF0000DD",
          width: 2,
          dottedLine: false
        }
      }
      // console.log("this.data.polyline.length22222222:" + this.data.polyline[2].points.length);
      this.data.polyline[this.data.polyline.length] = {
        points: [plainLineFirstPoint, plainLineEndPoint],
        color: "#9515CA",
        width: 2,
        dottedLine: false
      }

      this.data.baselineStartPoint = plainLineFirstPoint
      this.data.baselineFinishPoint = plainLineEndPoint;
      plainLineFirstPoint = {};
      plainLineEndPoint = {};

    }

    this.setData({
      polyline: this.data.polyline,
      baselineStartPoint: this.data.baselineStartPoint,
      baselineFinishPoint: this.data.baselineFinishPoint,
      setLeftPlainLineButton : 0,
      setRightPlainLineButton: 0,
      setPlainLineViewDisplay:0,
      selectPlainlineViewDisplay:1,
      rightPlainLineFlag: 1,
      
    })
  },

  //点击上一条，即将飞上一条的航线，把该航线的延长，提示飞机按照延长线来飞,3、5、7、9...存放的是航线，plainlinePointer的值是哪个，飞机就会飞哪条航线
  previousPlainline:function(){
    //如果飞机请求的航线已经是第一条了，则提示选择下一条航线
    if (this.data.plainlinePointer == 3){
      wx.showModal({
        title: '提示',
        content: '请选择下一条航线',
      })
    }else{
      this.data.plainlinePointer = this.data.plainlinePointer - 2;
      var extensionLine = obj.getExtensionLine(
        this.data.polyline[this.data.plainlinePointer].points[0],
        this.data.polyline[this.data.plainlinePointer].points[1],
        1200,
        this.data.headingAngle
      );
      this.data.polyline[1].points = [];
      this.data.polyline[1] = {
        points: extensionLine,
        color: "#1639E2",
        width: 3,
        dottedLine: true
      }

      // obj.getExtensionLine(this.data.baselineStartPoint, this.data.baselineFinishPoint, 1200, this.data.headingAngle)

    }
    this.setData({
      polyline:this.data.polyline,
      plainlinePointer: this.data.plainlinePointer,
    })
  },

  nextPlainline:function(){
    //如果飞机所在的航线已经是最后一条了，再次点击下一条航线，如果开始点击的是向左（或向右）设置航线，则调用向左（或向右）设置航线
    // leftPlainLineFlag: 0,//向左设置航线，leftPlainLineFlag置为1
    if (this.data.plainlinePointer == this.data.polyline.length - 1){
      if (this.data.leftPlainLineFlag == 1){
        //再次向左生成3条航线
        for (var i = 0; i < 3; i++) {
          // this.data.baselineStartPoint, this.data.baselineFinishPoint
          //通过一条线段的两个端点，找距离该线段50米的另外一条线的两个端点
          var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, 50, this.data.headingAngle + 90);
          var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, 50, this.data.headingAngle + 90);

          if (this.data.polyline.length % 2 == 0) {
            this.data.polyline[this.data.polyline.length] = {
              points: [],
              color: "#FF0000DD",
              width: 2,
              dottedLine: false
            }
          }
          // console.log("this.data.polyline.length22222222:" + this.data.polyline[2].points.length);
          this.data.polyline[this.data.polyline.length] = {
            points: [plainLineFirstPoint, plainLineEndPoint],
            color: "#9515CA",
            width: 2,
            dottedLine: false
          }

          this.data.baselineStartPoint = plainLineFirstPoint
          this.data.baselineFinishPoint = plainLineEndPoint;
          plainLineFirstPoint = {};
          plainLineEndPoint = {};

        }
      } else if (this.data.rightPlainLineFlag == 1){
        for (var i = 0; i < 3; i++) {
          // this.data.baselineStartPoint, this.data.baselineFinishPoint
          //通过一条线段的两个端点，找距离该线段50米的另外一条线的两个端点
          var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, 50, this.data.headingAngle - 90);
          var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, 50, this.data.headingAngle - 90);

          if (this.data.polyline.length % 2 == 0) {
            this.data.polyline[this.data.polyline.length] = {
              points: [],
              color: "#FF0000DD",
              width: 2,
              dottedLine: false
            }
          }
          // console.log("this.data.polyline.length22222222:" + this.data.polyline[2].points.length);
          this.data.polyline[this.data.polyline.length] = {
            points: [plainLineFirstPoint, plainLineEndPoint],
            color: "#9515CA",
            width: 2,
            dottedLine: false
          }

          this.data.baselineStartPoint = plainLineFirstPoint
          this.data.baselineFinishPoint = plainLineEndPoint;
          plainLineFirstPoint = {};
          plainLineEndPoint = {};

        }
      }
      
    }else{
      this.data.plainlinePointer = this.data.plainlinePointer + 2;
      var extensionLine = obj.getExtensionLine(
        this.data.polyline[this.data.plainlinePointer].points[0],
        this.data.polyline[this.data.plainlinePointer].points[1],
        1200,
        this.data.headingAngle
      );
      this.data.polyline[1].points = [];
      this.data.polyline[1] = {
        points: extensionLine,
        color: "#1639E2",
        width: 3,
        dottedLine: true
      }
    }

    this.setData({
      polyline: this.data.polyline,
      baselineStartPoint: this.data.baselineStartPoint,
      baselineFinishPoint: this.data.baselineFinishPoint,
      plainlinePointer: this.data.plainlinePointer,
    })
  },

  setHeadingAngleAndWidth: function () {
    this.setData({
      mapViewDisplay: 0,
      operateViewDisplay: 0,
      setOperateWidthViewDisplay: 1,
    })

  },

  //回到当前位置
  changeCircleLocationColor: function () {
    this.data.controls[1].iconPath = '/pages/images/circle_location_green.png';
    this.setData({
      controls: this.data.controls,
    })
    // var _this = this;
    setTimeout(function () {
      this.data.controls[1].iconPath = '/pages/images/circle_location.png';
      this.setData({
        controls: this.data.controls,
      })
    }, 1000);
  },
  //结束导航
  finishNavigation: function () {
    var _this = this;
    clearInterval(this.data.startNavigationTimer);

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
            _this.setData({
              previousPlainlineButton: 0,
              finishNavigationButton: 0,
              nextPlainlineButton: 0,
            })
          } else if (res.cancel) {
            _this.setData({
              isClickFinishButton: 1,
            })
          }
        }
      })
    

  },

  getLiveLocation: function () {
      var _this = this;
      wx.getLocation({
        type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
        success: function (res) {
          //飞机当前的位置
          _this.data.liveLocation = {
            latitude: res.latitude,
            longitude: res.longitude,
          };

          _this.data.navigationDot.push({
            longitude: res.longitude,
            latitude: res.latitude
          });//将飞机飞行经过的点存放在navigationDot数组中


          _this.data.polyline[_this.data.trackPointer] = {
            points: _this.data.navigationDot,
            color: "#128612",
            width: 5,
            dottedLine: false,
          }
          //存航点
          var navigationLastDot;//navigationDot数组中的最后一个点
          if (_this.data.polyline[_this.data.trackPointer].points.length > 500) {
            _this.data.allNavigationDot = _this.data.allNavigationDot.concat(_this.data.navigationDot);
            // 放到 + 1的时候，前面的navigationDot数据就不用写进 + 1位置了，所以就清空了，把navigationDot的最后一个数据写进去 + 1位置，是为了让polyline相连，不至于断一节
            navigationLastDot = _this.data.navigationDot[_this.data.navigationDot.length - 1];
            _this.data.navigationDot = [];
            _this.data.navigationDot.push({
              latitude: navigationLastDot.latitude,
              longitude: navigationLastDot.longitude
            });
            _this.data.allNavigationDot = _this.data.allNavigationDot + 2;
            _this.data.polyline[_this.data.allNavigationDot] = {
              points: _this.data.navigationDot,
              color: "#128612",
              width: 5,
              dottedLine: false,
            }

          }

          _this.setData({
            polyline: _this.data.polyline,
            liveLocation: _this.data.liveLocation,
            navigationDot: _this.data.navigationDot
          })

        }
      })

    
  },

})
