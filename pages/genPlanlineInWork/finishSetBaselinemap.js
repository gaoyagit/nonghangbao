
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
    operateViewDisplay: 0,//设置作业区view
    setOperateWidthViewDisplay: 0,//设置幅宽view
    navViewDisplay: 0,//开始导航view
    selectPlanlineViewDisplay:1,//选择导航线


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
    // computeOffset(vLat, vLon, vDistance, vHeading)
    // this.data.totalOperationArea[this.data.totalOperationArea.length - 1][0].operateWidth / 2
    // var testResultDot1 = computeOffset(testFirstDot.latitude, testFirstDot.longitude, 11 ,80);
    // var testResultDot2 = computeOffset(testSecondDot.latitude, testSecondDot.longitude, 11, 80);
    // console.log("testResultDot1" + "  latitude:" + testResultDot1.latitude +",  longitude:"+testResultDot1.longitude);
    // console.log("testResultDot2" + "  latitude:" + testResultDot2.latitude + ",  longitude:" + testResultDot2.longitude);


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
    console.log("indexOfAircraftToPointsInPolyline" + this.data.indexOfAircraftToPointsInPolyline);

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
          },
          // {
          //     id: 3,
          //     iconPath: '/pages/images/previous.png',
          //     position: {
          //       left: res.windowWidth - 370,
          //       top: res.windowHeight/2-50,
          //       width: 60,
          //       height: 60
          //     },
          //     clickable: true
          // },
          // {
          //   id: 4,
          //   iconPath: '/pages/images/next.png',
          //   position: {
          //     left: res.windowWidth - 60,
          //     top: res.windowHeight / 2 - 50,
          //     width: 60,
          //     height: 60
          //   },
          //   clickable: true
          // }


          ]
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

        console.log(" this.data.navPoints.length" + this.data.navPoints.length);
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
      // this.navOneAreaing = 0

      // wayPointsArray: fileData.mtData().list,//存放测试航点的数组
      // wayPointIndex:0//存放当前应该经过航点的坐标
      //如果运行完以后，就结束导航
      if (this.data.wayPointIndex == (this.data.wayPointsArray.length - 1) && this.data.wayPointSubIndex == (this.data.wayPointsArray[this.data.wayPointsArray.length - 1].length - 1)) {
        this.finishNavigation();

      }
      if (this.data.wayPointsArray[this.data.wayPointIndex] != null) {
        if (this.data.wayPointsArray[this.data.wayPointIndex][this.data.wayPointSubIndex] == null) {
          this.data.wayPointIndex++;
          this.data.wayPointSubIndex = 0;
          // this.data.navigationDot = [];
          // console.log("我运行到这一步了");
        }
        this.data.liveLocation = {
          latitude: this.data.wayPointsArray[this.data.wayPointIndex][this.data.wayPointSubIndex].latitude,
          longitude: this.data.wayPointsArray[this.data.wayPointIndex][this.data.wayPointSubIndex].longitude,
        };

        this.data.navigationDot.push({
          longitude: this.data.wayPointsArray[this.data.wayPointIndex][this.data.wayPointSubIndex].longitude,
          latitude: this.data.wayPointsArray[this.data.wayPointIndex][this.data.wayPointSubIndex].latitude
        });//将飞机飞行经过的点存放在navigationDot数组中


        //指向下一个即将经过的导航点
        if ((this.data.navIndex > (this.data.currentAreaEndPosition - this.data.currentAreaStartPosition) * 2) && (obj.ComputeSpacialDistance(
          this.data.liveLocation.latitude,
          this.data.liveLocation.longitude,
          this.data.navPoints[this.data.navPoints.length - 1].latitude,
          this.data.navPoints[this.data.navPoints.length - 1].longitude,
          this.data.vRadius)) < 100) {
          this.data.navOneAreaing = 0;
          this.data.navIndex = 0;
          this.data.allOperationAreaInPolyline[this.data.currentAreaStartPosition - 1].flag = 1 // 将当前作业区设置为1
          console.log("this.data.allOperationAreaInPolyline[this.data.currentAreaStartPosition - 1].flag" + this.data.allOperationAreaInPolyline[this.data.currentAreaStartPosition - 1].flag);
          for (var i = this.data.currentAreaStartPosition - 1; i <= this.data.currentAreaEndPosition; i++) {
            this.data.polyline[i].color = "#999999";
          }

        } else {

          var len = obj.ComputeSpacialDistance(
            this.data.liveLocation.latitude,
            this.data.liveLocation.longitude,
            this.data.navPoints[this.data.navIndex].latitude,
            this.data.navPoints[this.data.navIndex].longitude,
            this.data.vRadius);

          //距离小于10m时，自动导航到下一个点
          if (len <= 100) {
            this.data.navIndex++;
          }

          this.data.polyline[this.data.indexOfAircraftToPointsInPolyline] = {
            points: [this.data.liveLocation, this.data.navPoints[this.data.navIndex]], //this.data.liveLocation, navPoints[navIndex]
            color: "#0618EF",
            width: 2,
            dottedLine: false,
          }

        }

        this.data.polyline[this.data.aircraftPointArrayInPolylineIndex] = {
          points: this.data.navigationDot,
          color: "#128612",
          width: 5,
          dottedLine: false,
        }
        //存航点
        var navigationLastDot;//navigationDot数组中的最后一个点
        if (this.data.polyline[this.data.aircraftPointArrayInPolylineIndex].points.length > 500) {
          this.data.allNavigationDot = this.data.allNavigationDot.concat(this.data.navigationDot);
          // 放到 + 1的时候，前面的navigationDot数据就不用写进 + 1位置了，所以就清空了，把navigationDot的最后一个数据写进去 + 1位置，是为了让polyline相连，不至于断一节
          navigationLastDot = this.data.navigationDot[this.data.navigationDot.length - 1];
          this.data.navigationDot = [];
          this.data.navigationDot.push({
            latitude: navigationLastDot.latitude,
            longitude: navigationLastDot.longitude
          });
          this.data.aircraftPointArrayInPolylineIndex = this.data.aircraftPointArrayInPolylineIndex + 1;
          this.data.polyline[this.data.aircraftPointArrayInPolylineIndex] = {
            points: this.data.navigationDot,
            color: "#128612",
            width: 5,
            dottedLine: false,
          }

        }

        this.setData({
          polyline: this.data.polyline,
          liveLocation: this.data.liveLocation,
          navigationDot: this.data.navigationDot
        })
        this.data.wayPointSubIndex++;

      } else {
        clearInterval(this.data.startNavigationTimer);
      }

    }
  },
  pauseNavigation: function () {
    clearInterval(this.data.startNavigationTimer);
    this.setData({
      // indexOfAircraftToPointsInPolyline: this.data.polyline.length - 2,

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
