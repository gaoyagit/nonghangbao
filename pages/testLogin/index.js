const app = getApp()

Page({
        data: {
                motto: 'Hello World',
                userInfo: {},
                hasUserInfo: false,
                getUserInfoFail: false,
                canIUse: wx.canIUse('button.open-type.getUserInfo')
        },
        //事件处理函数
        bindViewTap: function () {
                wx.navigateTo({
                        url: '../logs/logs'
                })
        },
        onShow: function () {
                this.login();
        },
        onLoad: function () {

                if (app.globalData.userInfo) {
                        console.log(1)
                        this.setData({
                                userInfo: app.globalData.userInfo,
                                hasUserInfo: true
                        })
                } else if (this.data.canIUse) {
                        console.log(250)  
                        app.userInfoReadyCallback = res => {
                                console.log(12)
                                app.globalData.userInfo = res.userInfo
                                this.setData({
                                        userInfo: res.userInfo,
                                        hasUserInfo: true
                                })
                        }
                } else {
                        console.log(3)
                        // 在没有 open-type=getUserInfo 版本的兼容处理
                        wx.getUserInfo({
                                success: res => {
                                        app.globalData.userInfo = res.userInfo
                                        this.setData({
                                                userInfo: res.userInfo,
                                                hasUserInfo: true
                                        })
                                },
                                fail: res => {
                                        console.log(4);
                                        this.setData({
                                                getUserInfoFail: true
                                        })
                                }
                        })
                }
        },
        getUserInfo: function (e) {
                console.log(1232)
                if (e.detail.userInfo) {
                        console.log('getUserInfo')
                        app.globalData.userInfo = e.detail.userInfo
                        this.setData({
                                userInfo: e.detail.userInfo,
                                hasUserInfo: true
                        })
                } else {
                        console.log('openSetting')
                        this.openSetting();
                }

        },
        login: function () {
                console.log('login')
                var that = this
                wx.login({
                        success: function (res) {
                                var code = res.code;
                                console.log('loginCode:',code);
                                wx.getUserInfo({
                                        success: function (res) {
                                                console.log(7);
                                                app.globalData.userInfo = res.userInfo
                                                that.setData({
                                                        getUserInfoFail: false,
                                                        userInfo: res.userInfo,
                                                        hasUserInfo: true

                                                })
                                                //平台登录
                                        },
                                        fail: function (res) {
                                                console.log('fail');
                                                console.log(res);
                                                that.setData({
                                                        getUserInfoFail: true
                                                })
                                        }
                                })
                        }
                })
        },
        //跳转设置页面授权
        openSetting: function () {
                var that = this
                if (wx.openSetting) {
                        wx.openSetting({
                                success: function (res) {
                                        console.log(9);
                                        //成功或者失败都会走这里，尝试再次登录
                                        that.login()
                                }
                        })
                } else {
                        console.log(10);
                        wx.showModal({
                                title: '授权提示',
                                content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
                        })
                }
        }
})