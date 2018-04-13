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
          latitude: 39.3580754675946,
          longitude: 116.30413402372558,
        },

        {
          latitude: 39.3520739267415,
          longitude: 116.31632198148925,
        },
        
        {
          latitude: 39.35329708894172,
          longitude: 116.30697051054199,
        },
        // {
        //   latitude:39.360929065632554,
        //   longitude:116.31005634123046
        // }
        
      ]
    ]
  }
  return arr
}



