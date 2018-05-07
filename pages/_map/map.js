
var obj = require('../../utils/functionPackage.js')
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
        this.setData({
            mapViewDisplay:1,
            operateViewDisplay:1,
            setOperateWidthViewDisplay:0,
            navViewDisplay:0,
            dataDisabled:0,
            nextDisabled:1
        })
        this.generateNavLine();
        this.data.polylineAllLength = this.data.polyline.length;
        
         
         
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
      this.data.allOperationArray.push({
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
        if (obj.getJudgmentAreaFlag(this.data.allOperationAreaInPolyline, this.data.aircraftToNavIndexInPolyline)) {

					var aircraftPosition = this.data.liveLocation ;//飞机所在的位置

					//  要导航区域的索引
					var navAreaIndex = obj.GetRecentAreaPosition(this.data.polyline, aircraftPosition, this.data.allOperationAreaInPolyline);//当前作业区在polyline中的位置

					var navAreaStartPosition = navAreaIndex + 1; //开始导航的索引
					var navAreaEndPosition = obj.CurrentNavAreaEnd(this.data.polyline, navAreaIndex); //结束导航的索引

					//改变选中作业区域的颜色
					this.data.polyline[navAreaStartPosition].color = "#424200";

					//改变作业区域的航线的颜色
					for (var i = navAreaStartPosition; i <= navAreaEndPosition; i++) {
						this.data.polyline[i].color = "#ff44ff"
					}
					// this.data.allOperationAreaInPolyline[navAreaIndex].flag = 1 // 将当前作业区设置为1

					var shortestLine = obj.findLatelyNavLine(aircraftPosition, this.data.polyline, navAreaStartPosition, navAreaEndPosition, this.data.vRadius);//离飞机位置最近的航线

					

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


            if ((_this.data.navIndex > (_this.data.currentAreaEndPosition - _this.data.currentAreaStartPosition) * 2) && (obj.ComputeSpacialDistance(
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

              var len = obj.ComputeSpacialDistance(
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
    
      if (!obj.getJudgmentAreaFlag(this.data.allOperationAreaInPolyline, this.data.aircraftToNavIndexInPolyline)){
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
   
    //**************************************************生成航线****************************************
    generateNavLine:function() {
          // var _this = this;
          
          // var weiduMinPoint, jingduMinPoint;
          var headingAngle = this.data.headingAngle < 0 ? this.data.headingAngle+180 : this.data.headingAngle;
          var copyOperationArray = JSON.parse(JSON.stringify(this.data.operationArray));//当前作业区
          var length = copyOperationArray.length - 1;
          var cutpoint = [];//最边界的切点，两个切点包围一个作业区域
          cutpoint = obj.getEdgeCutPoint(this.data.polyline[this.data.polyline.length - 1].points, headingAngle);
          var cutPointInLine = [];//存放切线线段的两个端点
          var longestDistance = obj.getLongestDistance(copyOperationArray);//当前作业区域最长距离

          cutPointInLine.push(obj.computeOffset(cutpoint[0].latitude, cutpoint[0].longitude, -longestDistance, headingAngle));
          cutPointInLine.push(obj.computeOffset(cutpoint[0].latitude, cutpoint[0].longitude, longestDistance, headingAngle));

          var basePointOffsetArray = [];
          basePointOffsetArray.push(obj.computeOffset(cutPointInLine[0].latitude, cutPointInLine[0].longitude, this.data.operateWidth / 2, headingAngle + 90));
          basePointOffsetArray.push(obj.computeOffset(cutPointInLine[1].latitude, cutPointInLine[1].longitude, this.data.operateWidth / 2, headingAngle + 90));

          

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
        if (crossPoints.length > 0){
          while (crossPoints.length > 0) {

            this.data.crossPoints.push(crossPoints.slice(0));

            crossPoints.length = 0;
            tempCrossPointArray = [];

            //根据偏移点求偏移点，偏移量是幅宽
            // basePointOffsetArray = [];
            basePointOffsetArray[0] = obj.computeOffset(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, this.data.operateWidth, headingAngle + 90);
            basePointOffsetArray[1] = obj.computeOffset(basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, this.data.operateWidth, headingAngle + 90);


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
        }else{

          basePointOffsetArray = [];
          basePointOffsetArray.push(obj.computeOffset(cutPointInLine[0].latitude, cutPointInLine[0].longitude, this.data.operateWidth / 2, headingAngle - 90));
          basePointOffsetArray.push(obj.computeOffset(cutPointInLine[1].latitude, cutPointInLine[1].longitude, this.data.operateWidth / 2, headingAngle - 90));

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
            basePointOffsetArray[0] = obj.computeOffset(basePointOffsetArray[0].latitude, basePointOffsetArray[0].longitude, this.data.operateWidth, headingAngle - 90);
            basePointOffsetArray[1] = obj.computeOffset(basePointOffsetArray[1].latitude, basePointOffsetArray[1].longitude, this.data.operateWidth, headingAngle - 90);


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
