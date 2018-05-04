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
          latitude: 46.12579712418785, longitude: 123.80705816114897
        },
        {
          // latitude: 46.126926861350945, longitude: 123.80978917563363
          latitude: 46.12589660478995, longitude: 123.80764489579359
        },
        {
          // latitude: 46.11917486270457, longitude: 123.811904560357
          latitude: 46.12030653632977, longitude: 123.80917709239652
        },
        {
          latitude: 46.12075881433827, longitude: 123.808443362397
        },
        {
          latitude: 46.12579712418785, longitude: 123.80705816114897
        },
        {
          headingAngle:169,
          operateWidth: 22,
        }
      ],
      [
        {
          // latitude: 46.1258142832645, longitude: 123.807198568961,
          latitude: 46.12707017765048, longitude: 123.80991033595289    
        },
        {
          latitude: 46.12804584549345, longitude: 123.81267156832216
        },
        {
          latitude: 46.11783746971583, longitude: 123.81563525799756
        },
        {
          latitude: 46.119070781162826, longitude: 123.81219409340613
        },
        {
          // latitude: 46.1258142832645, longitude: 123.807198568961,
          latitude: 46.12707017765048, longitude: 123.80991033595289
        },
        {
          headingAngle: 169,
          operateWidth: 26,
        }
      ],
      // [{
      //   operateWidth:22,
      // }
      // ]
    ]
  }
  return arr
}



