
var aircraftPointData = require('../../utils/genplainData.js')
var operationAreaData = require('../../utils/data.js')
var obj = require('../../utils/functionPackage.js')
var app = getApp();
var Bmob = require('../../utils/bmob.js');
console.log(app.globalData)
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    getUserInfoFail: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfoViewDisplay: 1,


    nickName:'',
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
    operateWidth: 30,//幅宽，也就是作业宽度,初始值为30米
    currentAreaStartPosition: 0,//当前工作区域在polyline中航线的起始点
    currentAreaEndPosition: 0,//当前工作区域在polyline中的航线结束点
    vRadius: 6378136.49,

    mapViewDisplay: 1,//地图view
    setBaselineViewDisplay: 1,//设置基线view
    setOperateWidthViewDisplay: 0,//设置幅宽view
    setPlainLineViewDisplay: 0,//设置向左或者向右的导航线view
    selectPlainlineViewDisplay:0,//选择导航线

    //设置基线的按钮
    startSetBaselineButton:0,
    finishSetBaselineButton:0,
    resetBaselineButton:0,

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

    angle:0,//飞机实时飞行时角度
  },

  // getLiveLocationTimes:1,


  onLoad: function () {
    var _this = this;
    this.mapCtx = wx.createMapContext('map');
    _this.setData({
      userInfo:app.globalData.userInfo,
      nickName: app.globalData.userInfo.nickName,
    })
    //设置基线，点击开始开始记录航迹，点击开始的点为基线的起始点，点击结束时的点为基线的结束点
    wx.showModal({
      title: '提示',
      content: '默认幅宽为30m，是否设置幅宽',
      showCancel: true,
      success(res) {

        if (res.confirm) {
          _this.setData({
            // startSetBaselineButton: 1,
            mapViewDisplay: 0,
            setBaselineViewDisplay: 0,
            setOperateWidthViewDisplay: 1
          })
        } else if (res.cancel) {
          wx.showModal({
            title: '提示',
            content: '请点击开始按钮，设置作业基线',
            showCancel: false,
            success: function () {
              _this.setData({
                mapViewDisplay: 1,
                setOperateWidthViewDisplay: 0,
                setBaselineViewDisplay: 1,
                startSetBaselineButton: 1,
              })
            }
          })
        }



      }
    })

    wx.getLocation({
      success: function (res) {
        _this.setData({
          latitude: res.latitude,
          longitude: res.longitude,

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
  },
  // ***********************************************回到当前位置设置*************************************************
  //生成作业区的点，形成作业区域
  controltap: function (e) {

    if (e.controlId === 1) {
      this.mapCtx.moveToLocation();
      this.changeCircleLocationColor();
    }
  },
  // 设置幅宽
  setOperateWidth: function (e) {
    this.setData({
      operateWidth: parseInt(e.detail.value),
    })
  },
  // 设置幅宽页面的结束按钮
  finishSetOperateWidthView: function () {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '请点击开始按钮，设置作业基线',
      showCancel: false,
      success: function () {
        _this.setData({
          mapViewDisplay: 1,
          setOperateWidthViewDisplay: 0,
          setBaselineViewDisplay: 1,
          startSetBaselineButton: 1,
        })
      }
    })
    
  },

  //设置基线起始的点
  startSetBaseline:function(){
    //如果点击了结束导航，但是依旧要导航
    // if (this.data.isClickFinishButton) {
    //   this.data.startNavigationTimer = setInterval(this.getLiveLocation, 200)
    //   return
    // }
    var _this = this
    wx.getLocation({
      success: function (res) {
        _this.setData({
          baselineStartPoint: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          startSetBaselineButton:0,
          finishSetBaselineButton:1,
          resetBaselineButton:1
        })
      },
    })
    this.data.startNavigationTimer = setInterval(this.getLiveLocation, 1000);
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
        if(res.confirm){
          
          _this.resetBaseline();
          
        }else{
          //根据基线的两个点找到飞机飞行的航向角
          _this.data.headingAngle = obj.GetAzimuth(
            _this.data.baselineStartPoint.latitude,
            _this.data.baselineStartPoint.longitude,
            _this.data.baselineFinishPoint.latitude,
            _this.data.baselineFinishPoint.longitude);
          // 确保_this.data.headingAngle在0-360度之间
          while (_this.data.headingAngle > 360){
            _this.data.headingAngle = _this.data.headingAngle -360;
          }
          
          
          var extensionLine = obj.getExtensionLine(_this.data.baselineStartPoint, _this.data.baselineFinishPoint, 1200, _this.data.headingAngle)
          _this.data.polyline[1] = {
            points: extensionLine,
            color: "#1639E2",
            width: 3,
            dottedLine: true
          }

          if (_this.data.polyline.length % 2 == 0){
            _this.data.polyline[_this.data.polyline.length] = {
              points: [],
              color: "#FF0000DD",
              width: 2,
              dottedLine: false
            }
          }
          _this.data.polyline[_this.data.plainlinePointer] = {
            points: [_this.data.baselineStartPoint, _this.data.baselineFinishPoint],
            color: "#16E28D",
            width: 3,
            dottedLine: false
          }
          _this.setData({
            setBaselineViewDisplay:0,
            setPlainLineViewDisplay:1,
            polyline:_this.data.polyline,
          })
        }
        
      },
      
    })
  },
  //重新设置基线
  resetBaseline:function(){
    this.data.polyline = [];
    clearInterval(this.data.startNavigationTimer);
    this.setData({
      startSetBaselineButton: 1,
      finishSetBaselineButton: 0,
      resetBaselineButton: 0,
      baselineFinishPoint: {},
      baselineStartPoint:{},
      polyline: this.data.polyline,
    })

    console.log("this.data.polyline.length"+this.data.polyline.length);
  },

  //点击左，设置向左飞行的3条航线
  setLeftPlainLine:function(){  
    //如果航向角在0-90度、270-360，向左生成航线应该用航向角的值减去90度，否则应该+90度
    if (this.data.headingAngle >= 90 && this.data.headingAngle <= 270){
      for (var i = 0; i < 3; i++) {
        // this.data.baselineStartPoint, this.data.baselineFinishPoint
        //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
        var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);
        var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);

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
    }else{
      for (var i = 0; i < 3; i++) {
        // this.data.baselineStartPoint, this.data.baselineFinishPoint
        //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
        var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);
        var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);

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
    //如果航向角在0-90度、270-360，向左生成航线应该用航向角的值加90度，否则应该减去90度
    if (this.data.headingAngle >= 90 && this.data.headingAngle <= 270) {
      for (var i = 0; i < 3; i++) {
        // this.data.baselineStartPoint, this.data.baselineFinishPoint
        //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
        var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);
        var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);

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
    } else {
      for (var i = 0; i < 3; i++) {
        // this.data.baselineStartPoint, this.data.baselineFinishPoint
        //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
        var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);
        var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);

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
  previousPlainline: function () {
    //如果飞机请求的航线已经是第一条了，则提示选择下一条航线
    if (this.data.plainlinePointer == 3) {
      wx.showModal({
        title: '提示',
        content: '请选择下一条航线',
      })
    } else {
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
      polyline: this.data.polyline,
      plainlinePointer: this.data.plainlinePointer,
    })
  },

  nextPlainline: function () {
    //如果飞机所在的航线已经是最后一条了，再次点击下一条航线，如果开始点击的是向左（或向右）设置航线，则调用向左（或向右）设置航线
    // leftPlainLineFlag: 0,//向左设置航线，leftPlainLineFlag置为1
    if (this.data.plainlinePointer == this.data.polyline.length - 1) {
      if (this.data.leftPlainLineFlag == 1) {
        //如果航向角在0-90度、270-360，向左生成航线应该用航向角的值减去90度，否则应该+90度
        if (this.data.headingAngle >= 90 && this.data.headingAngle <= 270) {
          for (var i = 0; i < 3; i++) {
            // this.data.baselineStartPoint, this.data.baselineFinishPoint
            //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
            var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);
            var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);

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
        } else {
          for (var i = 0; i < 3; i++) {
            // this.data.baselineStartPoint, this.data.baselineFinishPoint
            //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
            var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);
            var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);

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
        
      } else if (this.data.rightPlainLineFlag == 1) {
        //如果航向角在0-90度、270-360，向左生成航线应该用航向角的值加90度，否则应该减去90度
        if (this.data.headingAngle >= 90 && this.data.headingAngle <= 270) {
          for (var i = 0; i < 3; i++) {
            // this.data.baselineStartPoint, this.data.baselineFinishPoint
            //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
            var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);
            var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle - 90);

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
        } else {
          for (var i = 0; i < 3; i++) {
            // this.data.baselineStartPoint, this.data.baselineFinishPoint
            //通过一条线段的两个端点，找距离该线段30米的另外一条线的两个端点
            var plainLineFirstPoint = obj.computeOffset(this.data.baselineStartPoint.latitude, this.data.baselineStartPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);
            var plainLineEndPoint = obj.computeOffset(this.data.baselineFinishPoint.latitude, this.data.baselineFinishPoint.longitude, this.data.operateWidth, this.data.headingAngle + 90);

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
      }

    } else {
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
    this.data.controls[0].iconPath = '/pages/images/circle_location_green.png';
    this.setData({
      controls: this.data.controls,
    })
    var _this = this;
    setTimeout(function () {
      _this.data.controls[0].iconPath = '/pages/images/circle_location.png';
      _this.setData({
        controls: _this.data.controls,
      })
    }, 1000);
  },
  //结束导航
  finishNavigation: function () {
    var _this = this;
    

      wx.showModal({
        title: '提示',
        content: '确定要结束导航吗',
        success: function (res) {
          if (res.confirm) {
            wx.showModal({
              title: '提示',
              content: '导航结束',
              showCancel: false,
            });
            clearInterval(_this.data.startNavigationTimer);
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

          if (_this.data.navigationDot.length == 1){
            _this.data.angle = obj.GetAzimuth(
              _this.data.navigationDot[0].latitude, 
              _this.data.navigationDot[0].longitude, 
              _this.data.navigationDot[0].latitude, 
              _this.data.navigationDot[0].longitude);
          }else{
            _this.data.angle = obj.GetAzimuth(
              _this.data.navigationDot[_this.data.navigationDot.length - 2].latitude,
              _this.data.navigationDot[_this.data.navigationDot.length - 2].longitude,
              _this.data.navigationDot[_this.data.navigationDot.length - 1].latitude,
              _this.data.navigationDot[_this.data.navigationDot.length - 1].longitude,);
          }
          
          /***************存数据库**************************/
          // wx.request({
          //   url: 'http://localhost:8081', //仅为示例，并非真实的接口地址
          //   method: "POST",
          //   data: {
          //     longitude: res.longitude,
          //     latitude: res.latitude,
          //     nickName:_this.data.nickName,
          //     speed:res.speed,
          //     time: obj.getNowFormatDate(),
          //     angle: _this.data.angle
          
          //     // userInfo:
          //   },
          //   header: {
          //     'content-type': 'application/x-www-form-urlencoded' // 默认值
          //   },
          //   success: function (res) {
          //     console.log(res.data)
          //   },
          //   fail:function(e){
          //     console.log(e)
          //   },
          // })
          // var T_flightPath = Bmob.Object.extend("T_flightPath");
          // var flightPath = new T_flightPath();
          // flightPath.set("longitude", res.longitude);
          // flightPath.set("latitude", res.latitude);
          // flightPath.set("nickName", _this.data.nickName);
          // flightPath.set("speed", res.speed);
          // flightPath.set("angle", _this.data.angle);

          // //添加数据，第一个入口参数是null
          // flightPath.save(null, {
          //   success: function (result) {
          //     // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
          //     console.log("日记创建成功, objectId:" + result.id);
          //   },
          //   error: function (result, error) {
          //     // 添加失败
          //     console.log('创建日记失败');

          //   }
          // });
         

          var Test = Bmob.Object.extend("test");
          var test = new Test();
          test.set("longitude", res.longitude);
          test.set("latitude", res.latitude);
          test.set("nickName", _this.data.nickName);
          test.set("speed", res.speed);
          test.set("angle", _this.data.angle);
          //添加数据，第一个入口参数是null
          test.save(null, {
            success: function (result) {
              // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
              console.log("日记创建成功, objectId:" + result.id);
            },
            error: function (result, error) {
              // 添加失败
              console.log('创建日记失败');

            }
          });            


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
              _this.data.trackPointer = _this.data.trackPointer + 2;
              _this.data.polyline[_this.data.trackPointer] = {
                points: _this.data.navigationDot,
                color: "#128612",
                width: 5,
                dottedLine: false,
              }

            }

            _this.setData({
              polyline: _this.data.polyline,
              liveLocation: _this.data.liveLocation,
              trackPointer: _this.data.trackPointer,
              allNavigationDot: _this.data.allNavigationDot,
              navigationDot: _this.data.navigationDot,
            })
          }

        
      })

    
  },

})
