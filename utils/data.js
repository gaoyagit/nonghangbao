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
      // [
      //   { 
      //     latitude: 46.12579712418785, longitude: 123.80705816114897
      //   },
      //   {
      //     // latitude: 46.126926861350945, longitude: 123.80978917563363
      //     latitude: 46.12589660478995, longitude: 123.80764489579359
      //   },
      //   {
      //     // latitude: 46.11917486270457, longitude: 123.811904560357
      //     latitude: 46.12030653632977, longitude: 123.80917709239652
      //   },
      //   {
      //     latitude: 46.12075881433827, longitude: 123.808443362397
      //   },
      //   {
      //     latitude: 46.12579712418785, longitude: 123.80705816114897
      //   },
      //   {
      //     headingAngle:169,
      //     operateWidth: 22,
      //   }
      // ],
      
      //******************************* */
      // [
      //   {
      //     latitude: 46.1308, longitude: 123.8092,   
      //   },
      //   {
      //     latitude: 46.1358, longitude: 123.8137
      //   },      
      //   {
      //     latitude: 46.1381, longitude: 123.8324
      //   },
      //   {
      //     latitude: 46.1351, longitude: 123.8204
      //   },
      //   {
      //     latitude: 46.1291, longitude: 123.8424
      //   },
      //   {
      //     latitude: 46.1221, longitude: 123.85
      //   },
      //   {
      //     latitude: 46.12, longitude: 123.84
      //   },
      //   {
      //     latitude: 46.1308, longitude: 123.8092,
      //   },
      //   {
      //     headingAngle: 89.99837792152829,
      //     operateWidth: 40,
      //   }
      // ],
      // [

      //   { longitude: 123.77528076171875, latitude: 46.14369150643544 },
      //   { longitude: 123.7860954284668, latitude: 46.150708280638945 },
      //   { longitude: 123.79605178833008, latitude: 46.14618910486044 },
      //   { longitude: 123.80635147094726, latitude: 46.152373146607765 },
      //   { longitude: 123.81201629638672, latitude: 46.14381044226326 },
      //   { longitude: 123.80789642333984, latitude: 46.13322414737169 },
      //   { longitude: 123.79176025390625, latitude: 46.1294173416378 },
      //   { longitude: 123.77528076171875, latitude: 46.14369150643544 },
      //   {
      //     headingAngle: 0,
      //     operateWidth: 40,
      //   }
      // ]
      // // [{
      // //   operateWidth:22,
      // // }
      // // ]
      [
        { longitude: 123.78420715332031, latitude: 46.13655488654877 },
        { longitude: 123.78712539672851, latitude: 46.1423831953708 },
        { longitude: 123.79467849731445, latitude: 46.136316983288296 },
        { longitude: 123.78420715332031, latitude: 46.13655488654877 },
        {
          headingAngle: 10,
          operateWidth: 50,
        }
      ],
      [
        { longitude: 123.79673843383789, latitude: 46.146308035292364 },
        { longitude: 123.80411987304687, latitude: 46.147378397616855 },
        { longitude: 123.80394821166992, latitude: 46.14071802723157 },
        { longitude: 123.79845504760742, latitude: 46.14202637786636 },
        { longitude: 123.79673843383789, latitude: 46.146308035292364 },
        {
          headingAngle: 20,
          operateWidth: 50,
        }
      ],
      [
        { longitude: 123.80926971435547, latitude: 46.15011367344515 },
        { longitude: 123.81407623291015, latitude: 46.1502325953978 },
        { longitude: 123.81441955566406, latitude: 46.14416724820501 },
        { longitude: 123.81047134399414, latitude: 46.14416724820501 },
        { longitude: 123.80926971435547, latitude: 46.15011367344515 },
        {
          headingAngle: 30,
          operateWidth: 50,
        }
      ],
      [

        { longitude: 123.81317428588867, latitude: 46.14274001056275 },
        { longitude: 123.82210067749023, latitude: 46.14392937783414 },
        { longitude: 123.82227233886718, latitude: 46.13703068998635 },
        { longitude: 123.81471923828125, latitude: 46.1369117395124 },
        { longitude: 123.810544128418, latitude: 46.13964753540494 },
        { longitude: 123.81317428588867, latitude: 46.14274001056275 },
        {
          headingAngle: 40,
          operateWidth: 50,
        }
      ],
      [
        { longitude: 123.81802444458008, latitude: 46.13262935132009 },
        { longitude: 123.82712249755859, latitude: 46.13215350985367 },
        { longitude: 123.82506256103515, latitude: 46.12727589778333 },
        { longitude: 123.81956939697265, latitude: 46.12620514463617 },
        { longitude: 123.81613616943359, latitude: 46.12715692623926 },
        { longitude: 123.8142478942871, latitude: 46.13025010287547 },
        { longitude: 123.81802444458008, latitude: 46.13262935132009 },
        {
          headingAngle: 50,
          operateWidth: 50,
        }
      ],
      [
        { longitude: 123.79845504760742, latitude: 46.1291825541267 },
        { longitude: 123.81029968261718, latitude: 46.12825334658801 },
        { longitude: 123.8084114074707, latitude: 46.12549410966959 },
        { longitude: 123.80308990478515, latitude: 46.12240038520377 },
        { longitude: 123.79845504760742, latitude: 46.1291825541267 },
        {
          headingAngle: 60,
          operateWidth: 50,
        }
      ],
      [
        { longitude: 123.78283386230468, latitude: 46.12937232224337 },
        { longitude: 123.79038696289062, latitude: 46.12492192391375 },
        { longitude: 123.78832702636718, latitude: 46.12040038520377 },
        { longitude: 123.78283386230468, latitude: 46.12937232224337 },
        {
          headingAngle: 70,
          operateWidth: 50,
        }
      ]
    ]
  }
  return arr
}



