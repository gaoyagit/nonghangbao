
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
    operationDisplay: 1,//控制是否显示设置作业区的按钮的选项
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

    resetDisabled: 1,//重置按钮是否可用
    dataDisabled: 1,//航向角幅宽按钮
    nextDisabled: 0,//设置下一个按钮

    trackPointer: 0,//指向存航迹的polyline数组下标

    navButtonDisplay: 1,//导航按钮

    headingAngle: 0,//航向角的值

    crossPoints: [],//这个是什么？中间点与作业区的交点吗？

    liveLocation: {},//这是什么？导航时，经过的点？
    allNavigationDot: [],//总数组  飞机飞行经过的点

    stopFlag: 0,//当stopFlag为1时清空导航的计时器，结束导航

    navigationDot: [],//飞机飞行经过的点
    startNavigationTimer: null,

    aircraftToNavIndexInPolyline: -1,//飞机与导航点的连线在polyline中的位置
    navOneAreaing: 0, //判断是否在导航一个区域，
    allOperationAreaInPolyline: [], //和polyline中的索引一一对应，航线的位置填-1
    navPoints: [],//每一次导航的时候，要飞航线点的顺序集合
    navIndex: 0,//导航的时候，navPoints航线点的索引



    startDisabled: 1,//开始按钮
    pauseDisabled: 0,//暂停按钮
    finishDisabled: 0,//结束按钮
    isClickPauseButton: 0,//是否点击了暂停按钮,
    isClickFinishButton: 0,//是否点击了结束按钮，并且想继续作业
  },



  // getLiveLocationTimes:1,


  onLoad: function () {
    var _this = this;
    this.mapCtx = wx.createMapContext('map');
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
              top: res.windowHeight - 146,//待调整
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
  controltap: function (e) {
    var _this = this;
    if (e.controlId === 1) {//红色的定位
      this.data.operationDisplay ? '' :
        this.mapCtx.getCenterLocation({
          success: function (res) {
            var len = _this.data.operationArray.length
            if (len <= 2) {
              _this.data.operationArray.push({
                longitude: res.longitude,
                latitude: res.latitude
              });//少于3点的时候，直接添加进去，

              //2个点的，末尾位置放第一个点
              if (len == 2) {
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
  setOperationArea: function () {
    var _this = this;
    // _this.setData({
    //     operationDisplay:0,
    // })
    wx.showModal({
      title: '提示',
      content: '点击屏幕中央的红色定位按钮，并按照顺时针方向设置作业区',
      showCancel: false,
      success: function () {
        _this.setData({
          operationDisplay: 0,
        })
      }
    })
  },
  // *****************************************重新设置作业区**************************************************
  reSetOperationArea: function () {
    this.setData({
      operationArray: [],
      polyline: [],
      allOperationArray: [],
      polylineAllLength: 0
    })
  },
  

  changeCircleLocationColor: function () {
    this.data.controls[1].iconPath = '/pages/images/circle_location_green.png';
    this.setData({
      controls: this.data.controls,
    })
    var _this = this;
    setTimeout(function () {
      _this.data.controls[1].iconPath = '/pages/images/circle_location.png';
      _this.setData({
        controls: _this.data.controls,
      })
    }, 1000);
  },
  // ************************************************设置下一个作业区域**************************************************************
  nextAndFinishSetOperationArea: function () {
    var self = this;
    var polylineLength;
    // var allOperationArrayLength;//self.data.allOperationArray.length;
    this.data.polylineAllLength = this.data.polyline.length;
    this.data.allOperationArray.push({
      areaArray: self.data.operationArray,
      flag: 0
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
            nextDisabled: 0,
            dataDisabled: 1

          })

          // allOperationArrayLength = self.data.allOperationArray.length;

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
                  trackPointer: self.data.polyline.length
                })
                console.log("trackPointer" + self.data.trackPointer)
                // for (var i = 0; i < self.data.polyline.length; i++) {
                //   if (self.data.polyline[i].points.length > 3) {//作业区
                //     for (var j = 0; j < self.data.polyline[i].points.length; j++)
                //       console.log("self.data.polyline[i].points" + "[" + i + "]" + self.data.polyline[i].points[j].latitude + "self.data.polyline[i].points" + self.data.polyline[i].points[j].longitude)
                //   }

                // }

              } else if (res.cancel) {
                console.log('回到作业区页面')//如果用户点击取消，回到设置作业区域的页面
              }
            }
          })
        }
      }
    })
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


    this.setData({
      startDisabled: 0,//开始按钮
      pauseDisabled: 1,//暂停按钮
      finishDisabled: 1,//结束按钮
    })

    this.data.startNavigationTimer = setInterval(this.getLiveLocation, 2000)
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


  // getLiveLocation: function () {
  //     // this.navOneAreaing = 0
  //     var _this = this;
  //     wx.getLocation({
  //       type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
  //       success: function (res) {
  //         _this.data.liveLocation = {
  //           latitude: res.latitude,
  //           longitude: res.longitude,
  //         };

  //         _this.data.navigationDot.push({
  //           longitude: res.longitude,
  //           latitude: res.latitude
  //         });//将飞机飞行经过的点存放在navigationDot数组中

  //         //存航点
  //         _this.data.polyline[_this.data.polyline.length] = {
  //           points: _this.data.navigationDot,
  //           color: "#128612",
  //           width: 2,
  //           dottedLine: false,
  //         }

  //         _this.setData({
  //           polyline: _this.data.polyline,
  //           liveLocation: _this.data.liveLocation,
  //           navigationDot: _this.data.navigationDot
  //         })

  //       }
  //     })
    
  // },
  //暂停导航
  pauseNavigation: function () {
    clearInterval(this.data.startNavigationTimer);
    this.setData({
      startDisabled: 1,//开始按钮
      pauseDisabled: 0,//暂停按钮
      finishDisabled: 1,//结束按钮
      isClickPauseButton: 1,
    })
  },
  // 结束按钮
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
    

  },


})
