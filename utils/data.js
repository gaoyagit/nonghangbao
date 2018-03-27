module.exports = {
  // formatTime: formatTime,
  mtData: mtData,
  searchmtdata: searchmtdata,
  // usedraw: usedraw
}

var mt_data = mtData()

function searchmtdata(id) {
  var result
  for (let i = 0; i < mt_data.list.length; i++) {
    var mt = mt_data.list[i]
    if (mt.id == id) {
      result = mt
    }
  }
  return result || {}
}

function mtData() {
  var arr = {
    list: [
      [
        {
          latitude:39.35834092349247,
          longitude:116.3055073147412,
        },

        {
          latitude: 39.35787637500922,
          longitude: 116.31563533598144,
        },
        {
          latitude: 39.35502265226699,
          longitude: 116.31391872221191,
        },
        {
          latitude: 39.35382803604249,
          longitude: 116.30911220365722,
        },
        {
          latitude:39.35834092349247,
          longitude:116.3055073147412,
        },
      ],[
        {
          latitude:39.36165903710342,
          longitude:116.30936969572265,
        },

        {
          latitude: 39.36298623841493,
          longitude: 116.3172661190625,
        },
        {
          latitude: 39.35887183226201,
          longitude: 116.31675113493164,
        },
        {
          latitude: 39.35940273699663,
          longitude: 116.31263126188476,
        },
        {
          latitude:39.36165903710342,
          longitude:116.30936969572265,
        },
      ],
    //   {
    //     id: '1',
    //     MTId: 'MT001',
    //     status: 'working',
    //     Duration: 3,
    //     Operator: 'tom',
    //     IdleReason: 'lunch'
    //     // dot0:{
    //     //   latitude:39.35834092349247,
    //     //   longitude:116.3055073147412,
    //     // },
       
    //     // dot1: {
    //     //   latitude: 39.35787637500922,
    //     //   longitude: 116.31563533598144,
    //     // },
    //     // dot2: {
    //     //   latitude: 39.35502265226699,
    //     //   longitude: 116.31391872221191,
    //     // },
    //     // dot3: {
    //     //   latitude: 39.35382803604249,
    //     //   longitude: 116.30911220365722,
    //     // },
    //     // dot4:{
    //     //   latitude:39.35834092349247,
    //     //   longitude:116.3055073147412,
    //     // },
        
    //   }, {
    //     id: '2',
    //     MTId: 'MT002',
    //     status: 'Idle',
    //     Duration: 7,
    //     Operator: 'jerry',
    //     IdleReason: 'reparied',

    //     // dot0:{
    //     //   latitude:39.36165903710342,
    //     //   longitude:116.30936969572265,
    //     // },

    //     // dot1: {
    //     //   latitude: 39.36298623841493,
    //     //   longitude: 116.3172661190625,
    //     // },
    //     // dot2: {
    //     //   latitude: 39.35887183226201,
    //     //   longitude: 116.31675113493164,
    //     // },
    //     // dot3: {
    //     //   latitude: 39.35940273699663,
    //     //   longitude: 116.31263126188476,
    //     // },
    //     // dot0:{
    //     //   latitude:39.36165903710342,
    //     //   longitude:116.30936969572265,
    //     // },
    //   }, {
    //     id: '3',
    //     MTId: 'MT003',
    //     status: 'Idle',
    //     Duration: 6,
    //     Operator: 'tom',
    //     IdleReason: 'lunch'
    //   }, {
    //     id: '4',
    //     MTId: 'MT004',
    //     status: 'working',
    //     Duration: 9,
    //     Operator: 'jerry',
    //     IdleReason: 'reparied'
    //   }, {
    //     id: '5',
    //     MTId: 'MT005',
    //     status: 'Idle',
    //     Duration: 2,
    //     Operator: 'tom',
    //     IdleReason: 'lunch'
    //   }, {
    //     id: '6',
    //     MTId: 'MT006',
    //     status: 'working',
    //     Duration: 6,
    //     Operator: 'jerry',
    //     IdleReason: 'reparied'
    //   }, {
    //     id: '7',
    //     MTId: 'MT007',
    //     status: 'Idle',
    //     Duration: 1,
    //     Operator: 'tom',
    //     IdleReason: 'lunch'
    //   }
    ]
  }
  return arr
}



