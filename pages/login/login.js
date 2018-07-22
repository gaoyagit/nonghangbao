var app = getApp()
Page({
  data: {
    userInfoViewDisplay: false,
  },
  onLoad: function () {
    this.login();
  },
  getUserInfo(e) {
    var userInfo = e.detail.userInfo;
    if (userInfo) {
      app.globalData.userInfo = userInfo;
      wx.redirectTo({
        url: '../../pages/genPlanlineInWork/genPlanlineInWorkmap'
      })
    } else {
      this.openSetting();
    }
  },
  openSetting() {
    var _this = this;
    if (wx.openSetting) {
      wx.openSetting({
        success: function (res) {
          _this.login();
        }
      })
    } else {
      wx.showModal({
        title: '授权提示',
        content: '小程序需要您的微信授权才能使用!',
      })
    }
  },
  login() {
    var _this = this;
    wx.login({
      success: function (res) {
        console.log(789879)
        wx.getUserInfo({
          success: function (res) {
            console.log(234234)
            app.globalData.userInfo = res.userInfo;
            console.log(app.globalData)
            wx.redirectTo({
              //url: '../../pages/mode/mode'
              url:'../../pages/genPlanlineInWork/genPlanlineInWorkmap'
            })
          },
          fail: function () {
            console.log('fail;')
            _this.setData({
              userInfoViewDisplay: true,
            })
          }
        })
      },
      fail: function () {
        console.log('fail;')
        _this.setData({
          userInfoViewDisplay: true,
        })
      }
    })
  },
})  