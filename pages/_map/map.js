// map.js
Page({
    data: {
        polyline: [],
        startPosition:{},
        latitude:'',
        longitude:'',
        mapHeight:'',
        scale:'14'
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
                    mapHeight: res.windowHeight-46,
                    controls: [{
                        id: 1,
                        iconPath: '/pages/images/location3.png',
                        position: {
                            left: res.windowWidth / 2 - 13,
                            top: res.windowHeight / 2 - 62,
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
        this.showModalToChoosePlaneLoaction();
    },
    regionchange:function(e) {
        console.log(e.type)

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
        //console.log("scale===" + that.data.scale)
        var that = this;
        if (e.controlId === 1) {
            // that.setData({
            //     scale: ++that.data.scale
            // })
        } else if (e.controlId === 2) {
            this.mapCtx.moveToLocation()
            // that.setData({
            //     scale: --that.data.scale
            // })
        }
    }
})