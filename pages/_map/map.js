// map.js
Page({
    data: {
        polyline: [{
            points: [{
                longitude: 113.3245211,
                latitude: 23.10229
            }, {
                longitude: 113.324520,
                latitude: 23.21229
            }],
            color:"#FF0000DD",
            width: 2,
            dottedLine: true
        }],
        mapHeight:'',
    },
    onLoad:function(){
        var _this = this;
        wx.getLocation({
            success: function (res) {
                latitude0: res.latitude   //飞机当前位置的维度
                longitude0: res.longitude //飞机当前位置的经度
            },
        })
        //获取屏幕信息，设置操作地图的控件
        wx.getSystemInfo({
            success: function(res){
                _this.setData({
                    windowHeight: res.windowHeight,//屏幕高度
                    mapHeight: res.windowHeight,
                    controls: [{
                        id: 1,
                        iconPath: '/pages/images/plus.png',
                        position: {
                            left: res.windowWidth - 60,
                            top: 10,
                            width: 25,
                            height: 25
                        },
                        clickable: true
                    },{
                        id: 2,
                        iconPath: '/pages/images/minus.png',
                        position: {
                            left: res.windowWidth - 30,
                            top: 10,
                            width: 25,
                            height: 25
                        },
                        clickable: true
                    },{
                        id: 3,
                        iconPath: '/pages/images/location.png',
                        position: {
                            left: res.windowWidth / 2 - 15,
                            top: res.windowHeight / 2 - 30,
                            width: 30,
                            height: 30
                        },
                        clickable: true
                    }]
                })
            }
        })
    },
    regionchange:function(e) {
        console.log(e.type)
    },
    markertap:function(e) {
        console.log(e.markerId)
    },
    controltap:function(e) {
        console.log(e.controlId)
    }
})