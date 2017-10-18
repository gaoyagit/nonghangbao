var app = getApp()
Page({
  data: {
    userName: '',
    password: '',
    id_token: '',//方便存在本地的locakStorage  
    response: '' ,//存取返回数据  
    imglogo:'/pages/images/4.jpg' 
  },
  userNameInput: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  userPasswordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
    console.log(e.detail.value)
  },
  login: function () {
    var that = this
    wx.request({
      url: 'http://127.0.0.1:9120',//怎样进行后台调用？
      data: {
        username: this.data.username,
        password: this.data.password,
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
        if(res.data.data){
          wx.navigateTo({
            url: '../../pages/mode/mode'
          })
        }else{
          alert("登录失败，请重新登录！");
          console.log("登录失败，密码不对")
        }
      },
      fail: function (res) {
        console.log(res.data);
        console.log('is failed')
      }
    })
  },
  register:function()
  {
    wx.navigateTo({
      url: '../../pages/register/register'
    })
  }
})  