Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo:{},
  },
  onLoad: function () {
    var _this = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        console.log(res);
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              _this.setData({
                userInfo: res.userInfo,
              })
            }
          })
        }
        else{
          // _this.bindGetUserInfo(res);
        }
      }
    })
  },
  bindGetUserInfo: function (e) {
    // console.log(e.detail.userInfo)
    this.setData({
      userInfo: e.detail.userInfo,
    })
  }
})