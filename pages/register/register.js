//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    imglogo: '/pages/images/4.jpg' ,
    userName: '',
    password: '',
    plannumber:'',
  },
  userNameInput: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  plannumberInput: function (e) {
    this.setData({
      plannumber: e.detail.value
    })
  },
  register:function()
  {
    var that = this
    wx.request({
      url: 'http://127.0.0.1:9122',//怎样进行后台调用？
      data: {
        username: this.data.username,
        password: this.data.password,
        plannumber:this.data.plannumber,
      },
      method: 'GET',
      success: function (res) {
        that.setData({
          id_token: res.data.id_token,
          response: res
        })
        console.log(res)
        try {
          wx.setStorageSync('id_token', res.data.id_token)
        } catch (e) {
        }   
        if (res.data.data) {
          wx.navigateTo({
            url: '../../pages/login/login'
          })
        } else {
          console.log("请重新注册!")
        }
      },
      fail: function (res) {
        console.log(res.data);
        console.log('is failed')
      }
    })
  },
  login: function () {
    wx.navigateTo({
      url: '../../pages/login/login'
    })
  }
})
