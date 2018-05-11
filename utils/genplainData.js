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
        { latitude: 46.1246360206895, longitude: 123.815861216952 },
        { latitude: 46.1245036682231, longitude: 123.815893440812,},
        { latitude: 46.1243689845121, longitude: 123.815924833171 },
        { latitude: 46.1239542586934, longitude: 123.816025324565},
        { latitude: 46.1238145653843, longitude: 123.816063032226},
        { latitude: 46.1236735350593, longitude: 123.816103066665},
        { latitude: 46.1182044693011, longitude: 123.817588596919},
        { latitude: 46.1180607727145, longitude: 123.817628629667 },
        { latitude: 46.1179165791863, longitude: 123.817667000189},
        { latitude: 46.1177737206564, longitude: 123.817704207431},
        { latitude: 46.117631696975, longitude: 123.8177404175},
        { latitude: 46.1174915066894, longitude: 123.81777629547},
        { latitude: 46.1173533178835, longitude: 123.817811010258},
        { latitude: 46.1171112779436, longitude: 123.81787246744},
        { latitude: 46.1169805905205, longitude: 123.817905188901},
    ]}
  return arr
}
