var Bmob = require('../../utils/bmob.js');
const app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo:{},
    hasUserInfo: true,
    getUserInfoFail: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfoViewDisplay:1,
    operateViewDisplay:1,
    footViewDisplay:1,
  },
  onLoad:function(){
    this.setData({
      userInfo: app.globalData.userInfo,
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  selfbuilt:function () {
    wx.navigateTo({
      url: '../../pages/selfbuiltMap/selfbuiltMap'
    })
  },
  receive: function () {
    wx.navigateTo({
      url: '../../pages/receiveMap/receiveMap'
    })
  },
  default: function () {
    wx.navigateTo({
      url: '../../pages/defaultMap/defaultMap'
    })
  },
  realtimeOperation:function(){
    wx.navigateTo({
      url: '../../pages/genPlanlineInWork/genPlanlineInWorkmap'
    })
  },
  makePhoneCall:function(){
    wx.makePhoneCall({
      phoneNumber: '010-22222222' //仅为示例，并非真实的电话号码
    })
  }
})