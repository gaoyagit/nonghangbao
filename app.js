//app.js
var Bmob = require('utils/bmob.js');

App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    Bmob.initialize("310f536f2bf4b856b0a40a0f30535a7a", "1be9c3505f927bf665e56e5b216ff395")
  },
  globalData: {
    userInfo: null
  }
})
