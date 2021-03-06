var aircraftPointData = require('../../utils/dataTest.js')
var operationAreaData = require('../../utils/data.js')
var obj = require('../../utils/functionPackage.js')
var Bmob = require('../../utils/bmob.js')
Page({
  data: {
    polyline: [],
    markers: [],
    startPosition: {},
    latitude: '',
    longitude: '',
    mapHeight: '',
    scale: '14',
    trackPointer: 0,//指向存航迹的polyline数组下标
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
    operateViewDisplay: 1,//设置作业区view
    setOperateWidthViewDisplay: 0,//设置幅宽view
    navViewDisplay: 0,//开始导航view


    navButtonDisplay: 1,//导航按钮

    headingAngle: 0,//航向角的值

    crossPoints: [],//这个是什么？中间点与作业区的交点吗？

    liveLocation: {},//这是什么？导航时，经过的点？

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


    for (var i = 0; i < this.data.totalOperationArea.length; i++) {
      for (var j = 0; j < this.data.totalOperationArea[i].length - 1; j++) {
        currentOperationArea.push(this.data.totalOperationArea[i][j]);
      }
      this.data.polyline[this.data.polyline.length] = {
        points: currentOperationArea,
        color: "#FF0000DD",
        width: 2,
        dottedLine: false
      }

      currentOperationArea = [];
      this.data.operationArray = this.data.totalOperationArea[i];
      this.generateNavLine();
    }



    this.setData({
      
      polyline: this.data.polyline,
      indexOfAircraftToPointsInPolyline: this.data.polyline.length,
      tempPolyline: this.data.polyline,
      trackPointer: this.data.polyline.length,

    })

    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
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

  setHeadingAngleAndWidth: function () {
    this.setData({
      mapViewDisplay: 0,
      operateViewDisplay: 0,
      setOperateWidthViewDisplay: 1,
    })

  },

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


  startNavigation: function () {

    var _this = this
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        _this.setData({
          baselineStartPoint: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          startDisabled: 0,//开始按钮
          pauseDisabled: 1,//暂停按钮
          finishDisabled: 1,//结束按钮
        })
      },
    })
    this.data.startNavigationTimer = setInterval(this.getLiveLocation, 1000);
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

        // const query = Bmob.Query('tableName');
        // query.set("name", "Bmob")
        // query.set("cover", "后端云")
        // query.save().then(res => {
        //   console.log(res)
        // }).catch(err => {
        //   console.log(err)
        // })
      console.log(res);
        console.log(_this.data.nickName)
          // 将航点存到数据库中
        // var testData = Bmob.Query('test');
        // // var testData = new TestData();
        // testData.set("longitude", res.longitude);
        // testData.set("latitude", res.latitude);
        // testData.set("nickName", "_this.data.nickName");
        // testData.set("speed", res.speed);
        // testData.set("angle", 20);
        // testData.save().then(res => {
        //   console.log("日记创建成功, objectId:" + result.id);
        // }).catch(err => {
        //   console.log('创建日记失败');
        // })
        console.log(_this.data.nickName);
        var Test = Bmob.Object.extend("test");
        var test = new Test();
        test.set("longitude", res.longitude);
        test.set("latitude", res.latitude);
        test.set("nickName", _this.data.nickName);
        test.set("speed", res.speed);
        test.set("angle", 20);
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
          //添加数据，第一个入口参数是null
          // test.save(null, {
          //   success: function (result) {
          //     // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
          //     console.log("日记创建成功, objectId:" + result.id);
          //   },
          //   error: function (result, error) {
          //     // 添加失败
          //     console.log('创建日记失败');

          //   }
          // });

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
  pauseNavigation: function () {
    clearInterval(this.data.startNavigationTimer);
    this.setData({
      startDisabled: 1,//开始按钮
      pauseDisabled: 0,//暂停按钮
      finishDisabled: 1,//结束按钮
      isClickPauseButton: 1,
    })
  },
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
            startDisabled: 0,//开始按钮
            pauseDisabled: 0,//暂停按钮
            finishDisabled: 0,//结束按钮
          })
        } else if (res.cancel) {
          // var _this = this;
          wx.showModal({
            title: '提示',
            content: '点击开始继续导航',
            showCancel: false,
            success(res) {
              _this.setData({
                startDisabled: 0,//开始按钮
                pauseDisabled: 0,//暂停按钮
                finishDisabled: 0,//结束按钮
                // isClickFinishButton: 1,//
              })
            }
          })
        }
      }
    })


  },


  //**************************************************生成航线****************************************
  generateNavLine: function () {
    // var headingAngle = this.data.headingAngle < 0 ? this.data.headingAngle + 180 : this.data.headingAngle;
    var copyOperationArray = JSON.parse(JSON.stringify(this.data.operationArray));//当前作业区
    var longetside;//当前作业区最长边
    longetside = obj.getLongestSide(copyOperationArray);
    var angle = copyOperationArray[copyOperationArray.length - 1].headingAngle
    var headingAngle = angle < 0 ? angle + 180 : angle;
    // console.log("********: " + headingAngle);
    var operateWidth = parseInt(copyOperationArray[copyOperationArray.length - 1].operateWidth);
    // console.log("********: " + operateWidth);
    // this.data.headingAngle < 0 ? this.data.headingAngle + 180 : this.data.headingAngle;

    var length = copyOperationArray.length - 2;
    var cutpoint = [];//最边界的切点，两个切点包围一个作业区域
    cutpoint = obj.getEdgeCutPoint(this.data.polyline[this.data.polyline.length - 1].points, headingAngle);

    var cutPointInLine = [];//存放切线线段的两个端点
    var longestDistance = obj.getLongestDistance(copyOperationArray);//当前作业区域最长距离

    cutPointInLine.push(obj.computeOffset(cutpoint[0].latitude, cutpoint[0].longitude, -longestDistance, headingAngle));
    cutPointInLine.push(obj.computeOffset(cutpoint[0].latitude, cutpoint[0].longitude, longestDistance, headingAngle));

    var basePointOffsetArray = [];
    basePointOffsetArray.push(obj.computeOffset(cutPointInLine[0].latitude, cutPointInLine[0].longitude, operateWidth / 2, headingAngle + 90));
    basePointOffsetArray.push(obj.computeOffset(cutPointInLine[1].latitude, cutPointInLine[1].longitude, operateWidth / 2, headingAngle + 90));


    var crossPoints = [];

    var tempCrossPointArray = [];
    for (var i = 0; i < length; i++) {
      //从偏移点出发的射线和作业区的交点
      tempCrossPointArray = obj.twoLineCross(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, this.data.operationArray[i].latitude, this.data.operationArray[i].longitude, this.data.operationArray[i + 1].latitude, this.data.operationArray[i + 1].longitude);
      if (tempCrossPointArray.length > 0) {
        crossPoints.push({
          longitude: tempCrossPointArray[0].longitude,
          latitude: tempCrossPointArray[0].latitude
        })
      }
    }
    // console.log("crossPoints.length"+crossPoints.length);
    if (crossPoints.length > 0) {
      while (crossPoints.length > 0) {

        this.data.crossPoints.push(crossPoints.slice(0));

        crossPoints.length = 0;
        tempCrossPointArray = [];

        //根据偏移点求偏移点，偏移量是幅宽
        // basePointOffsetArray = [];
        basePointOffsetArray[0] = obj.computeOffset(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, operateWidth, headingAngle + 90);
        basePointOffsetArray[1] = obj.computeOffset(basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, operateWidth, headingAngle + 90);


        for (var i = 0; i < length; i++) {
          //从偏移点出发的射线和作业区的交点
          tempCrossPointArray = obj.twoLineCross(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, this.data.operationArray[i].latitude, this.data.operationArray[i].longitude, this.data.operationArray[i + 1].latitude, this.data.operationArray[i + 1].longitude);
          if (tempCrossPointArray.length > 0) {
            crossPoints.push({
              longitude: tempCrossPointArray[0].longitude,
              latitude: tempCrossPointArray[0].latitude
            })
          }
        }
      }
    } else {

      basePointOffsetArray = [];
      basePointOffsetArray.push(obj.computeOffset(cutPointInLine[0].latitude, cutPointInLine[0].longitude, operateWidth / 2, headingAngle - 90));
      basePointOffsetArray.push(obj.computeOffset(cutPointInLine[1].latitude, cutPointInLine[1].longitude, operateWidth / 2, headingAngle - 90));

      crossPoints = [];
      tempCrossPointArray = [];

      for (var i = 0; i < length; i++) {
        //从偏移点出发的射线和作业区的交点
        tempCrossPointArray = obj.twoLineCross(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, this.data.operationArray[i].latitude, this.data.operationArray[i].longitude, this.data.operationArray[i + 1].latitude, this.data.operationArray[i + 1].longitude);
        if (tempCrossPointArray.length > 0) {
          crossPoints.push({
            longitude: tempCrossPointArray[0].longitude,
            latitude: tempCrossPointArray[0].latitude
          })
        }
      }

      while (crossPoints.length > 0) {

        this.data.crossPoints.push(crossPoints.slice(0));

        crossPoints.length = 0;
        tempCrossPointArray = [];

        //根据偏移点求偏移点，偏移量是幅宽
        // basePointOffsetArray = [];
        // 幅宽：this.data.totalOperationArea[this.data.totalOperationArea.length - 1][0].operateWidth
        basePointOffsetArray[0] = obj.computeOffset(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, operateWidth, headingAngle - 90);
        basePointOffsetArray[1] = obj.computeOffset(basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, operateWidth, headingAngle - 90);


        for (var i = 0; i < length; i++) {
          //从偏移点出发的射线和作业区的交点
          tempCrossPointArray = obj.twoLineCross(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, this.data.operationArray[i].latitude, this.data.operationArray[i].longitude, this.data.operationArray[i + 1].latitude, this.data.operationArray[i + 1].longitude);
          if (tempCrossPointArray.length > 0) {
            crossPoints.push({
              longitude: tempCrossPointArray[0].longitude,
              latitude: tempCrossPointArray[0].latitude
            })
          }
        }
      }

    }


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
      operationArray: this.data.operationArray,
      crossPoints: []
    })

  },
})
