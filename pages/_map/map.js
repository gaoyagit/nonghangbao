// map.js
Page({
    data: {
        polyline: [],
        startPosition:{},
        latitude:'',
        longitude:'',
        mapHeight:'',
        scale:'14',
        operationDisplay:1,//控制是否显示设置作业区的按钮的选项
        operationArray:[],//生成作业区的各个坐标点的数组
        operateWidth:0,//幅宽，也就是作业宽度

        mapViewDisplay:1,//地图view
        operateViewDisplay:1,//设置作业区view
        setOperateWidthViewDisplay:0,//设置幅宽view
        navViewDisplay:0,//开始导航view

        navButtonDisplay:1,//导航按钮
    },
    onLoad:function(){
        var _this = this;
        this.mapCtx = wx.createMapContext('map');
        wx.getLocation({
            success: function (res) {
                _this.setData({
                    latitude:res.latitude,
                    longitude:res.longitude
                })
            },
        })
        //获取屏幕信息，设置操作地图的控件
        wx.getSystemInfo({
            success: function(res){
                _this.setData({
                    windowHeight: res.windowHeight,//屏幕高度
                    mapHeight: res.windowHeight-106,//46
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
                            top: res.windowHeight-106,
                            width: 40,
                            height: 40
                        },
                        clickable: true
                    }]
                })
            }
        })
        //this.showModalToChoosePlaneLoaction();
    },
    showModalToChoosePlaneLoaction:function(){
        var _this = this;
        wx.showModal({
            title: '提示',
            content: '请先选择飞机的起点',
            showCancel:false,
            success:function(){
                wx.chooseLocation({
                    success:function(params){
                        console.log(params)
                        _this.setData({
                            startPosition:{
                                latitude:params.latitude,
                                longitude:params.longitude,
                                address:params.address,
                            },
                            markers: [{
                                iconPath: "/pages/images/plane.png",
                                id: 0,
                                latitude: params.latitude,
                                longitude: params.longitude,
                                width: 25,
                                height: 25,
                                callout:{
                                    content:'点击飞机重新选择位置',
                                    display:'ALWAYS',
                                }
                            }],
                        })
                    },
                    cancel:function(){
                        _this.showModalToChoosePlaneLoaction();
                    }
                })
            }
        })
    },
    markertap:function(e) {
        var _this = this;
        if(e.markerId==0){
            wx.showModal({
                title: '提示',
                content: '是否要重新选择飞机的起始位置？',
                success:function(res){
                    if (res.confirm) {
                        wx.chooseLocation({
                            success:function(params){
                                _this.data.markers[0].latitude=params.latitude;
                                _this.data.markers[0].longitude=params.longitude;

                                _this.setData({
                                    startPosition:{
                                        latitude:params.latitude,
                                        longitude:params.longitude,
                                        address:params.address,
                                    },
                                    markers: _this.data.markers,
                                })
                            },
                        })
                    }
                },
            })
        }
    },
    controltap:function(e) {
        var _this = this;
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
                        _this.data.polyline[0] = {
                            points: _this.data.operationArray,
                            color: "#FF0000DD",
                            width: 2,
                            dottedLine: true
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
    reSetOperationArea:function(){
        this.data.operationArray = [];
        this.data.polyline[0] = {
            points: this.data.operationArray,
            color: "#FF0000DD",
            width: 2,
            dottedLine: true
        }
        this.setData({
            operationArray: this.data.operationArray,
            polyline: this.data.polyline
        })
    },
    finishSetOperationArea:function(){
        this.setData({
            mapViewDisplay:0,
            operateViewDisplay:0,
            setOperateWidthViewDisplay:1,
        })
    },
    setOperateWidth:function(e){
        this.setData({
            operateWidth:e.detail.value,
        })
    },
    finishSetOperateWidthView:function(){
        this.setData({

            mapViewDisplay:1,
            operateViewDisplay:0,
            setOperateWidthViewDisplay:0,

            navViewDisplay:1,
        })
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
    }
})