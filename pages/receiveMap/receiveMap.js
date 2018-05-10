
var aircraftPointData = require('../../utils/dataTest.js')
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

    })

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

    if (this.data.isClickPauseButton || this.data.isClickFinishButton) {
      this.setData({
        isClickPauseButton: 0,
        isClickFinishButton: 0,
        startDisabled: 0,//开始按钮
        pauseDisabled: 1,//暂停按钮
        finishDisabled: 1,//结束按钮
      })
      this.data.startNavigationTimer = setInterval(this.getLiveLocation, 200)
      return
    }
    this.data.allOperationAreaInPolyline = [];
    this.data.aircraftPointArrayInPolylineIndex = this.data.polyline.length + 1;
    for (var i = 0; i < this.data.polyline.length; i++) {
      if (this.data.polyline[i].points.length > 3) {//作业区
        this.data.allOperationAreaInPolyline.push({
          areaArray: this.data.polyline[i].points,
          flag: 0
        });
      } else {//航线
        this.data.allOperationAreaInPolyline.push(-1);
      }

    }

    // this.data.polyline[4].width = 10;

    this.setData({
      startDisabled: 0,//开始按钮
      pauseDisabled: 1,//暂停按钮
      finishDisabled: 1,//结束按钮
    })

    // console.log("startNavigation" + this.data.indexOfAircraftToPointsInPolyline);
    this.data.startNavigationTimer = setInterval(this.getLiveLocation, 200)
  },
  getLiveLocation: function () {

    if (!this.data.navOneAreaing) {//是否在导航一个区域。如果没有，那就寻找下一个导航区域
      this.data.navOneAreaing = 1
      //判断是否还有区域没有 导航
      if (obj.getJudgmentAreaFlag(this.data.allOperationAreaInPolyline, this.data.indexOfAircraftToPointsInPolyline)) {

        /**********为什么navPoints的值一直包括上次的数据*****/
        this.data.navPoints = [];//当前区域导航的时候，要飞的航线的顺序集合
        this.setData({
          navPoints: this.data.navPoints,
        })

        var aircraftPosition = this.data.liveLocation;//飞机所在的位置

        //  要导航区域的索引
        var navAreaIndex = obj.GetRecentAreaPosition(this.data.polyline, aircraftPosition, this.data.allOperationAreaInPolyline);//当前作业区在polyline中的位置

        var navAreaStartPosition = navAreaIndex + 1; //开始导航的索引
        var navAreaEndPosition = obj.CurrentNavAreaEnd(this.data.tempPolyline, navAreaIndex); //结束导航的索引

        //改变选中作业区域的颜色
        this.data.polyline[navAreaStartPosition].color = "#424200";

        //改变作业区域的航线的颜色
        for (var i = navAreaStartPosition; i <= navAreaEndPosition; i++) {
          this.data.polyline[i].color = "#ff44ff"
        }
        // this.data.allOperationAreaInPolyline[navAreaIndex].flag = 1 // 将当前作业区设置为1


        var shortestLine = obj.findLatelyNavLine(aircraftPosition, this.data.polyline, navAreaIndex, navAreaEndPosition, this.data.vRadius);//离飞机位置最近的航线





        /*************找到飞机实际飞行应该经过的点，也就是跳转的点************/
        if (shortestLine.lineIndex == navAreaStartPosition) {
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
          for (var i = navAreaEndPosition; i > navAreaStartPosition - 1; i--) {

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

        // console.log(" this.data.navPoints.length" + this.data.navPoints.length);
        this.data.polyline[this.data.indexOfAircraftToPointsInPolyline] = {
          points: [aircraftPosition, this.data.navPoints[this.data.navIndex]],
          color: "#0618EF",
          width: 2,
          dottedLine: false,
        }

        this.setData({
          polyline: this.data.polyline,
          currentAreaStartPosition: navAreaStartPosition,
          currentAreaEndPosition: navAreaEndPosition
        })

      } else {
        console.log('导航结束了')
        this.finishNavigation();
      }
    } else {
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

          //如果飞机飞完当前的作业区，将当前作业区域的颜色置为灰色，navOneAreaing = 0;navIndex = 0;回到初始状态
          if ((_this.data.navIndex > (_this.data.currentAreaEndPosition - _this.data.currentAreaStartPosition) * 2) && (obj.ComputeSpacialDistance(
            res.latitude,
            res.longitude,
            _this.data.navPoints[_this.data.navPoints.length - 1].latitude,
            _this.data.navPoints[_this.data.navPoints.length - 1].longitude,
            _this.data.vRadius)) < 1000) {
            _this.data.navOneAreaing = 0;
            _this.data.navIndex = 0;
            _this.data.allOperationAreaInPolyline[_this.data.currentAreaStartPosition - 1].flag = 1 // 将当前作业区设置为1
            for (var i = _this.data.currentAreaStartPosition - 1; i <= _this.data.currentAreaEndPosition; i++) {
              _this.data.polyline[i].color = "#999999";
            }

          } else {
            //飞机当前位置离辅助导航点的距离，如果两者之间的长度小于100米，则跳到下一个辅助导航点
            var len = obj.ComputeSpacialDistance(
              _this.data.liveLocation.latitude,
              _this.data.liveLocation.longitude,
              _this.data.navPoints[_this.data.navIndex].latitude,
              _this.data.navPoints[_this.data.navIndex].longitude,
              _this.data.vRadius);

            //距离小于100m时，自动导航到下一个点
            if (len <= 100) {
              _this.data.navIndex++;
            }

            _this.data.polyline[_this.data.indexOfAircraftToPointsInPolyline] = {
            points: [_this.data.liveLocation, _this.data.navPoints[_this.data.navIndex]], //this.data.liveLocation, navPoints[navIndex]
            color: "#0618EF",
            width: 2,
            dottedLine: false,
          }

          }


        _this.data.polyline[_this.data.aircraftPointArrayInPolylineIndex] = {
          points: _this.data.navigationDot,
          color: "#128612",
          width: 5,
          dottedLine: false,
        }
        //存航点
        var navigationLastDot;//navigationDot数组中的最后一个点
        if (_this.data.polyline[_this.data.aircraftPointArrayInPolylineIndex].points.length > 500) {
          _this.data.allNavigationDot = _this.data.allNavigationDot.concat(_this.data.navigationDot);
          // 放到 + 1的时候，前面的navigationDot数据就不用写进 + 1位置了，所以就清空了，把navigationDot的最后一个数据写进去 + 1位置，是为了让polyline相连，不至于断一节
          navigationLastDot = _this.data.navigationDot[_this.data.navigationDot.length - 1];
          _this.data.navigationDot = [];
          _this.data.navigationDot.push({
            latitude: navigationLastDot.latitude,
            longitude: navigationLastDot.longitude
          });
          _this.data.aircraftPointArrayInPolylineIndex = _this.data.aircraftPointArrayInPolylineIndex + 1;
          _this.data.polyline[_this.data.aircraftPointArrayInPolylineIndex] = {
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

    }
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

    if (!obj.getJudgmentAreaFlag(this.data.allOperationAreaInPolyline, this.data.indexOfAircraftToPointsInPolyline)) {
      wx.showModal({
        title: '提示',
        content: '导航结束',
        showCancel: false,
      })
    } else {
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
                  indexOfAircraftToPointsInPolyline: _this.data.polyline.length - 2,
                  startDisabled: 1,//开始按钮
                  pauseDisabled: 0,//暂停按钮
                  finishDisabled: 0,//结束按钮
                  isClickFinishButton: 1,//
                })
              }
            })
          }
        }
      })
    }

  },






  //**************************************************生成航线****************************************
  generateNavLine: function () {

    var copyOperationArray = JSON.parse(JSON.stringify(this.data.operationArray));//当前作业区
    var longetside;//当前作业区最长边
    longetside = obj.getLongestSide(copyOperationArray);
    // var headingAngle = GetAzimuth(longetside.firstDot.latitude, longetside.firstDot.longitude, longetside.secondDot.latitude, longetside.secondDot.longitude);
    //  var headingAngle = 169;
    var headingAngle = copyOperationArray[copyOperationArray.length - 1].headingAngle;
    var operateWidth = copyOperationArray[copyOperationArray.length - 1].operateWidth;
    // this.data.headingAngle < 0 ? this.data.headingAngle + 180 : this.data.headingAngle;

    var length = copyOperationArray.length - 2;
    var cutpoint = [];//最边界的切点，两个切点包围一个作业区域
    // cutpoint = getEdgeCutPoint(this.data.polyline[this.data.polyline.length - 1].points, headingAngle);
    //这是正确的计算方式，但是为了测试，修改了cutpoint，后续应该改过来
    // cutpoint.push(longetside.firstDot);
    // cutpoint.push(longetside.secondDot);
    cutpoint.push(copyOperationArray[copyOperationArray.length - 2]);
    cutpoint.push(copyOperationArray[copyOperationArray.length - 2]);
    // cutpoint.push({
    //   latitude: 46.12579712418785, longitude: 123.80705816114897
    // });
    // cutpoint.push({
    //   latitude: 46.12075881433827, longitude: 123.808443362397
    // });
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
