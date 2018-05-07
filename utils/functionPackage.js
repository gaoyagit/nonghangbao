module.exports = {
  ComputeHeading: ComputeHeading,// 将以北方向为零点的坐标方位角转化为用于表示斜率的夹角
  Angle2Arc: Angle2Arc,// 角度转弧度
  Arc2Angle: Arc2Angle,/// 弧度转角度
  Heading2KAndgle: Heading2KAndgle,// 将以北方向为零点的坐标方位角转化为用于表示斜率的夹角
  IsApproximateZero: IsApproximateZero,// 判断一个数是否近似为0
  computeOffset: computeOffset,//已知一个点、距离、航向角，求终点
  ComputeAngle: ComputeAngle,/// 计算出角123的大小（小于180度）,已知3个点，求三个点的夹角 
  GetAzimuth: GetAzimuth,//求1到2的方位角(圆心在1上，角度制)
  ComputeSpacialDistance: ComputeSpacialDistance,/// 计算两点间的球面距离（单位为米）
  CurrentNavAreaEnd: CurrentNavAreaEnd,//选中作业区域在polyline数组中最后一个航线的位置
  GetRecentAreaPosition: GetRecentAreaPosition,//找到离飞机所在位置最近的作业区域的坐标点
  getJudgmentAreaFlag: getJudgmentAreaFlag,//判断作业区域的所有flag，未作业的flag = 0；作业过的flag = 1，若有未作业过的区域，返回true，全部作业返回,false
  getLongestDistance: getLongestDistance,//获得当前作业区域的最长距离
  getEdgeCutPoint: getEdgeCutPoint,//找边缘切点
  raysLineCross: raysLineCross,/// 球面获取射线与线段的交点
  twoLineCross: twoLineCross,/// 球面获取两线段交点
  getLongestSide: getLongestSide, //getLongestSide找到当前作业区域的最长边
  findLatelyNavLine: findLatelyNavLine,//找到离出发点最近的航线，以及该航线上离出发点最近的点。
}

// map.js
// 将以北方向为零点的坐标方位角转化为用于表示斜率的夹角
var vRadius = 6378136.49//地球半径
// 计算起点到终点的航向角
function ComputeHeading(vFromLat, vFromLon, vToLat, vToLon) {
  var vFromLatArc = Angle2Arc(vFromLat);
  var vToLatArc = Angle2Arc(vToLat);
  var vLonArcDif = Angle2Arc(vToLon) - Angle2Arc(vFromLon);
  var rHeading = Arc2Angle(Math.atan2(Math.sin(vLonArcDif) * Math.cos(vToLatArc), Math.cos(vFromLatArc) * Math.sin(vToLatArc) - Math.sin(vFromLatArc) * Math.cos(vToLatArc) * Math.cos(vLonArcDif)));
  while (rHeading >= 360) {
    rHeading -= 360;
  }
  while (rHeading < 0) {
    rHeading += 360;
  }
  return rHeading;
}

/// 角度转弧度
function Angle2Arc(vAngle) {
  return vAngle * Math.PI / 180.0;
}

/// 弧度转角度
function Arc2Angle(vArc) {
  return vArc * 180.0 / Math.PI;
}

// 将以北方向为零点的坐标方位角转化为用于表示斜率的夹角
function Heading2KAndgle(vHeading) {
  while (vHeading >= 360) {
    vHeading -= 360;
  }
  while (vHeading < 0) {
    vHeading += 360;
  }
  var rAngle = 0;
  if (vHeading >= 0 && vHeading < 180) {
    rAngle = 90 - vHeading;
  }
  else {
    rAngle = 270 - vHeading;
  }
  return rAngle;
}

// 判断一个数是否近似为0
function IsApproximateZero(vNum) {
  if (Math.round(vNum * 1e8) == 0) {
    return true;
  }
  else {
    return false;
  }
}



//a是边长，B是角B，C是角C,找边长b的长度
function getbDistance(a, B, C) {
  var numerator,//分子
    denominator;//分母

  numerator = Math.sin(a) * Math.sin(B) * Math.sin(C);
  denominator = Math.cos(B) + Math.cos(C) * (Math.sin(B) * Math.sin(C) * Math.cos(a) - Math.cos(B) * Math.cos(C));

  var bDistance = Math.abs(Math.atan(numerator / denominator));

  return bDistance;
}

//已知一个点、距离、航向角，求终点
function computeOffset(vLat, vLon, vDistance, vHeading) {
  var pDistanceArc = vDistance / vRadius;
  var pHArc = Angle2Arc(vHeading);
  var pLatArc = Angle2Arc(vLat);
  var pDAC = Math.cos(pDistanceArc);
  var pDAS = Math.sin(pDistanceArc);
  var pLAS = Math.sin(pLatArc);
  var pLAC = Math.cos(pLatArc);
  var rLatS = pDAC * pLAS + pDAS * pLAC * Math.cos(pHArc);
  return {
    latitude: Arc2Angle(Math.asin(rLatS)),
    longitude: Arc2Angle(Angle2Arc(vLon) + Math.atan2(pDAS * pLAC * Math.sin(pHArc), pDAC - pLAS * rLatS))
  }
}

/// 计算出角123的大小（小于180度）,已知3个点，求三个点的夹角       
function ComputeAngle(vLat1, vLon1, vLat2, vLon2, vLat3, vLon3) {
  var rDouble = Math.abs(GetAzimuth(vLat2, vLon2, vLat1, vLon1) - GetAzimuth(vLat2, vLon2, vLat3, vLon3));
  if (rDouble > 180) {
    rDouble = 360 - rDouble;
  }
  return rDouble;
}


/// 计算出射线0H与线段01的夹角(小于180度)
/// </summary>
/// <param name="vLat0">射线端点纬度</param>
/// <param name="vLon0">射线端点经度</param>
/// <param name="vHeading">射线端点航向角</param>
// <param name="vLat1"></param>
/// <param name="vLon1"></param>
function raysComputeAngle(vLat0, vLon0, vHeading, vLat1, vLon1) {
  var rDouble = Math.abs(GetAzimuth(vLat0, vLon0, vLat1, vLon1) - vHeading);
  if (rDouble > 180) {
    rDouble = 360 - rDouble;
  }
  return rDouble;
}


//求1到2的方位角(圆心在1上，角度制)
function GetAzimuth(vLat1, vLon1, vLat2, vLon2) {
  return ComputeHeading(vLat1, vLon1, vLat2, vLon2);
}

// 获取两点间线段距离
function GetLatLonDistance(vLat1, vLon1, vLat2, vLon2) {
  return Math.sqrt(Math.pow(vLat1 - vLat2, 2) + Math.pow(vLon1 - vLon2, 2));
}

/// 获取航点到航线的最短距离
function GetLatLonMinDistance(vPoint, vLine) {
  if (vPoint == null || vLine == null) return double.NaN;
  return GetLatLonMinDistance(vPoint.Lat, vPoint.Lon, vLine.Lat1, vLine.Lon1, vLine.Lat2, vLine.Lon2);
}

/// 计算点到直线的最短距离
function GetLatLonMinDistance(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2) {
  var pFootPointLat = 0;
  var pFootPointLon = 0;
  GetLatLonFootPoint(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2);
  return ComputeSpacialDistance(vLat0, vLon0, pFootPointLat, pFootPointLon);
}


/// 计算两点间的球面距离（单位为米）<param name="vRadius"></param>vRadius = EarthRadius
function ComputeSpacialDistance(vLat1, vLon1, vLat2, vLon2, vRadius) {
  var pLat1Arc = Angle2Arc(vLat1);
  var pLat2Arc = Angle2Arc(vLat2);
  var pLon1Arc = Angle2Arc(vLon1);
  var pLon2Arc = Angle2Arc(vLon2);
  var pArcDistance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((pLat1Arc - pLat2Arc) / 2), 2) + Math.cos(pLat1Arc) * Math.cos(pLat2Arc) * Math.pow((Math.sin(pLon1Arc - pLon2Arc) / 2), 2)));
  return pArcDistance * vRadius;
}


/************************************************************************* 导航部分的代码*********************************************************/
/// 获取点到直线的距离，用于初略计算飞机所在位置距离哪一条航线的距离最近,X->lat(纬度)
function GetPointToLMinDistance(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2) {
  if (vLon0 == null || vLon1 == null || vLon2 == null) return -1;
  var A0 = vLon2 - vLon1;
  var B0 = vLat1 - vLat2;
  var C0 = vLon1 * vLat2 - vLat1 * vLon2;
  return Math.abs(A0 * vLat0 + B0 * vLon0 + C0) / Math.sqrt(A0 * A0 + B0 * B0);
}

///找到最短距离所在的位置
function GetMinDistancePostion(minDistanceArray) {
  var length = minDistanceArray.length;
  var minPosition = 0;//存放最短距离所在的位置
  for (var i = 0; i < length; i++) {
    if (minDistanceArray[i] == -1) {
      continue;
    } else {
      if (minDistanceArray[i] < minDistanceArray[minPosition]) {
        minPosition = i;
      }
    }
  }
  return minPosition;
}

//找到该航线所在的作业区域在polyline中的坐标,minDisPosition是飞机距离左右航线最短航线的polyline的坐标点,tempPolyline:整个polyline数组
function GetNavAreaPosition(tempPolyline, minDisPosition) {
  var flag = 0;
  var areaPosition;
  for (var i = minDisPosition; i >= 0; i--) {
    if (tempPolyline[i].points.length > 3 && flag == 1) {
      areaPosition = i;
      flag = 0;
      break;
    } else {
      flag = 1;
      continue;
    }
  }
  return areaPosition;
}

//选中作业区域在polyline数组中最后一个航线的位置,StartPosition当前作业区域在polyline中的位置，tempPolyline实参为tempPolyline数组,只存放了作业区和导航线
function CurrentNavAreaEnd(tempPolyline, StartPosition) {
  var endPosition;//存放选中作业区域在polyline数组中最后一个航线的位置
  for (var i = StartPosition + 1; i < tempPolyline.length; i++) {
    if (i == tempPolyline.length - 1) { // 最后一个了
      endPosition = i;
      break;
    } else if (tempPolyline[i].points.length > 3) { //下一个作业区的位置
      endPosition = i - 1;
      break;
    }
  }
  return endPosition;
}

//排序
function compat(v1, v2) {
  if (v1 > v2) {
    return 1;
  } else if (v1 < v2) {
    return -1;
  } else {
    return 0;
  }
}

//找到离飞机所在位置最近的作业区域的坐标点，tempPolyline----->实参为polyline数组,airPosition---->实参飞机所在的位置,allOperationAreaInPolyline---->所有作业区域数组,与polyline数组一一对应
function GetRecentAreaPosition(tempPolyline, airPosition, allOperationAreaInPolyline) {

  var length = tempPolyline.length - 2;//由于polyline最后一个位置存的是所有的导航经过的点，长度大于3，在进行找区域的操作中，应该舍弃
  var shortestAreaIndex = 0;//存放离飞机位置最近的作业区的索引
  var aircraftToSingleAreaDistance = [];//存放飞机距离每个作业区的边界点的距离
  var aircraftToAreaDistance = [];//存放飞机距离每个作业区的边界点的最短距离
  var temporaryArea = [];//存放第一个flag！=1的作业区域，用作找当前作业区域的比较

  for (var i = 0; i < length; i++) {
    if (tempPolyline[i].points.length > 3) {

      aircraftToSingleAreaDistance = [];
      //进行操作；把作业区域所有的点与飞机所在位置的点计算距离，写入airToSingleAreaDistance数组中
      for (var j = 0; j < tempPolyline[i].points.length; j++) {
        aircraftToSingleAreaDistance.push(ComputeSpacialDistance(tempPolyline[i].points[j].latitude, tempPolyline[i].points[j].longitude, airPosition.latitude, airPosition.longitude, vRadius));
      }
      aircraftToAreaDistance.push(aircraftToSingleAreaDistance.sort(compat));
    } else {
      aircraftToAreaDistance.push(-1);
    }
  }

  // 找到一个flag！=1的作业区域
  for (var i = 0; i < length; i++) {
    if (aircraftToAreaDistance[i] !== -1 && aircraftToAreaDistance[i].flag != 1) {
      temporaryArea = aircraftToAreaDistance[i];
    }
  }


  // 找到距离飞机最近的作业区域在polyline中的位置
  for (var i = 0; i < length; i++) {
    if (aircraftToAreaDistance[i] !== -1) {
      if ((aircraftToAreaDistance[i][0] <= temporaryArea[0]) && (allOperationAreaInPolyline[i].flag == 0)) {
        shortestAreaIndex = i;
        temporaryArea = aircraftToAreaDistance[i];
      }
    }
  }

  return shortestAreaIndex;
}
//判断两个数组是否相同
function checkArr(arr1, arr2) {
  for (var i = 0; i < arr1.length; i++) {
    if ((arr1[i].latitude != arr2[i].latitude) || (arr1[i].longitude != arr2[i].longitude)) {
      return false;
    }
  }
  return true;

}

//找到中间点的基点，即第一个点的函数,求航线和作业区交点的第一个点，（这个点根据已知直线和点以及点在直线的角度，求交点得出的）
function basePointFunction(vLat0, vLon0, vHeading, vLat1, allPoints) {
  // A0*X + Bo*Y + C0 = 0
  //longitude--->X,latitude--->Y
  var minLongitudeDot = allPoints[0], //最小经度点
    minLatitudeDot = allPoints[0], //最小维度点
    maxLongitudeDot = allPoints[0],
    maxLatitudeDot = allPoints[0];

  for (var i = 0; i < allPoints.length; i++) {
    if (minLongitudeDot.longitude > allPoints[i].longitude) {
      minLongitudeDot = allPoints[i];
    }

    if (minLatitudeDot.latitude > allPoints[i].latitude) {
      minLatitudeDot = allPoints[i];
    }

    if (maxLongitudeDot.longitude < allPoints[i].longitude) {
      maxLongitudeDot = allPoints[i];
    }

    if (maxLatitudeDot.latitude < allPoints[i].latitude) {
      maxLatitudeDot = allPoints[i];
    }
  }
  var pKAngle = Heading2KAndgle(vHeading);
  var A0 = Math.tan(pKAngle * Math.PI / 180);//斜率
  var B0 = -1;
  var C0 = minLongitudeDot.latitude - Math.tan(pKAngle * Math.PI / 180) * minLongitudeDot.longitude;

  //求出距离 经过最小经度点的直线的左边最远的点
  var result = 0, resultKey = 0, flag = false;

  for (var i = 0; i < allPoints.length - 1; i++) {
    if (A0 * allPoints[i].longitude + B0 * allPoints[i].latitude + C0 < result) {
      resultKey = i;
      result = A0 * allPoints[i].longitude + B0 * allPoints[i].latitude + C0;
      flag = true;
    }
  }
  //如果有点在直线的左边，那就重新设置C0
  if (flag) {
    C0 = allPoints[resultKey].latitude - Math.tan(pKAngle * Math.PI / 180) * allPoints[resultKey].longitude;
  }
  if (vHeading == 0) {//最小经度和最小维度
    return {
      longitude: minLongitudeDot.longitude,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      latitude: minLatitudeDot.latitude
    };
  } else if (vHeading > 0 && vHeading < 90) {
    return {
      longitude: -(C0 + B0 * minLatitudeDot.latitude) / A0,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      latitude: minLatitudeDot.latitude
    };
  } else if (vHeading == 90) {//最小x和最大y
    return {
      longitude: minLongitudeDot.longitude,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      latitude: maxLatitudeDot.latitude
    };
  } else {
    return {
      longitude: minLongitudeDot.longitude,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      latitude: -(A0 * minLongitudeDot.longitude + C0) / B0
    };
  }

}

/// WGS84经纬度坐标转Web墨卡托米制坐标       
function latLon2Meter(vLatLonCoor) {
  var rCoor = [];//米制坐标
  if (vLatLonCoor.longitude > 180)
    vLatLonCoor.longitude = 180;
  else if (vLatLonCoor.longitude < -180)
    vLatLonCoor.longitude = -180;
  rCoor.X = vLatLonCoor.longitude * vRadius * Math.PI / 180.0;
  if (vLatLonCoor.latitude > 180)
    vLatLonCoor.latitude = 180;
  else if (vLatLonCoor.latitude < -180)
    vLatLonCoor.latitude = 180;
  rCoor.Y = Math.log(Math.tan((90 + vLatLonCoor.latitude) * Math.PI / 360.0)) / (Math.PI / 180.0) * Math.PI * vRadius / 180.0;
  return rCoor;
}

/// Web墨卡托米制坐标转WGS84经纬度坐标       
function meter2LatLon(vMeterCoor) {
  var rCoor;//经纬度坐标
  var tempLongitude;
  var tempLatitude;

  tempLongitude = vMeterCoor.X / (Math.PI * vRadius) * 180;
  tempLatitude = vMeterCoor.Y / (Math.PI * vRadius) * 180;
  tempLatitude = 180.0 / Math.PI * (2 * Math.atan(Math.exp(tempLatitude * Math.PI / 180.0)) - Math.PI / 2.0);

  rCoor = {
    latitude: tempLatitude,
    longitude: tempLongitude
  }

  return rCoor;

}


//找到中间点的基点，即第一个点的函数,求航线和作业区交点的第一个点，（这个点根据已知直线和点以及点在直线的角度，求交点得出的）
function basePointFunctionTest(vLat0, vLon0, vHeading, vLat1, allPoints) {
  // A0*X + Bo*Y + C0 = 0
  //longitude--->X,latitude--->Y
  var rCoorArray = [];
  var resultDotCoor;//XY
  var resultDotLonLat;//经纬度
  for (var i = 0; i < allPoints.length; i++) {
    rCoorArray.push(latLon2Meter(allPoints[i]));
  }
  var minXDot = rCoorArray[0], //最小X点
    minYDot = rCoorArray[0], //最小Y点
    maxXDot = rCoorArray[0],//最大X点
    maxYDot = rCoorArray[0];//最大Y点

  for (var i = 0; i < rCoorArray.length; i++) {
    if (minXDot.X > rCoorArray[i].X) {
      minXDot = rCoorArray[i];
    }

    if (minYDot.Y > rCoorArray[i].Y) {
      minYDot = rCoorArray[i];
    }

    if (maxXDot.X < rCoorArray[i].X) {
      maxXDot = rCoorArray[i];
    }

    if (maxYDot.Y < rCoorArray[i].Y) {
      maxYDot = rCoorArray[i];
    }
  }
  var pKAngle = Heading2KAndgle(vHeading);
  var A0 = Math.tan(pKAngle * Math.PI / 180);//斜率
  var B0 = -1;
  var C0 = minXDot.Y - Math.tan(pKAngle * Math.PI / 180) * minXDot.X;

  //求出距离 经过最小经度点的直线的左边最远的点
  var result = 0, resultKey = 0, flag = false;

  for (var i = 0; i < rCoorArray.length - 1; i++) {
    if (A0 * rCoorArray[i].X + B0 * rCoorArray[i].Y + C0 < result) {
      resultKey = i;
      result = A0 * rCoorArray[i].X + B0 * rCoorArray[i].Y + C0;
      flag = true;
    }
  }
  //如果有点在直线的左边，那就重新设置C0
  if (flag) {
    C0 = rCoorArray[resultKey].Y - Math.tan(pKAngle * Math.PI / 180) * rCoorArray[resultKey].X;
  }
  if (vHeading == 0) {//最小经度和最小维度
    resultDotCoor = {
      X: minXDot.X,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      Y: minYDot.Y
    };
  } else if (vHeading > 0 && vHeading < 90) {
    resultDotCoor = {
      X: -(C0 + B0 * minXDot.X) / A0,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      Y: minYDot.Y
    };
  } else if (vHeading == 90) {//最小x和最大y
    resultDotCoor = {
      X: minXDot.X,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      Y: maxYDot.Y
    };
  } else {
    resultDotCoor = {
      X: minXDot.X,
      //latitude: Math.abs(-(A0 * vLon1 + C0 )/ B0)
      Y: -(A0 * minXDot.X + C0) / B0
    };
  }


  resultDotLonLat = meter2LatLon(resultDotCoor);

  return resultDotLonLat;
}

//判断作业区域的所有flag，未作业的flag = 0；作业过的flag = 1，若有未作业过的区域，返回true，全部作业返回,false，aircraftToNavIndexInPolyline由于allOperationAreaInPolyline是polyline数组的再现，包括飞机作业时的航点，在polyline[polyline.length]>2,所以传进来aircraftToNavIndexInPolyline作为找作业区域的终止长度
function getJudgmentAreaFlag(allOperationAreaInPolyline, indexOfAircraftToPointsInPolyline) {

  var len = indexOfAircraftToPointsInPolyline;
  for (var i = 0; i < len; i++) {
    if (allOperationAreaInPolyline[i] != -1 && allOperationAreaInPolyline[i].flag == 0) {
      return true;
      break;
    }
  }
  return false;
}

//在球面坐标系下，找基点的应用函数
//ComputeSpacialDistance(vLat1, vLon1, vLat2,vLon2, vRadius)球面之间两点的距离
//获得当前作业区域的最长距离
function getLongestDistance(operationArea) {
  var longestDistance;
  var distanceAarry = [];
  for (var i = 0; i < operationArea.length - 1; i++) {
    for (var j = 0; j < operationArea.length - 1; j++) {
      distanceAarry.push(ComputeSpacialDistance(operationArea[i].latitude, operationArea[i].longitude, operationArea[j].latitude, operationArea[j].longitude, vRadius));
    }
  }

  distanceAarry = distanceAarry.sort(function (v0, v1) {
    return v1 - v0;
  });

  longestDistance = distanceAarry[0];

  return longestDistance;
}
//找边缘切点
function getEdgeCutPoint(operationArea, vHeading) {
  var cutPoint = [];//存放边缘切点,会有两个切点
  var longestDistance;//最长边的长度
  var aPoint, bPoint, cPoint, oPoint, angleAoB, angleAoC, angleBoC;
  var flag = 0;

  longestDistance = getLongestDistance(operationArea);


  for (var i = 0; i < operationArea.length - 1; i++) {
    aPoint = operationArea[i];
    oPoint = computeOffset(aPoint.latitude, aPoint.longitude, longestDistance, vHeading);

    for (var j = 0; j < operationArea.length - 2; j++) {
      if (i == j) {
        continue;
      } else if (i == j + 1 && j + 1 != operationArea.length - 2) {
        // console.log("j0:" + j + "   " + "j1:" + (j + 2));
        bPoint = operationArea[j];
        cPoint = operationArea[j + 2];

      } else if (i == j + 1 && j + 1 == operationArea.length - 2) {
        continue;
      } else {
        // console.log("j0:" + j + "   " + "j1:" + (j + 1));
        bPoint = operationArea[j];
        cPoint = operationArea[j + 1];
      }

      // ComputeAngle(vLat1, vLon1, vLat2, vLon2, vLat3, vLon3)求夹角
      angleAoB = ComputeAngle(aPoint.latitude, aPoint.longitude, oPoint.latitude, oPoint.longitude, bPoint.latitude, bPoint.longitude);
      angleAoC = ComputeAngle(aPoint.latitude, aPoint.longitude, oPoint.latitude, oPoint.longitude, cPoint.latitude, cPoint.longitude);
      angleBoC = ComputeAngle(bPoint.latitude, bPoint.longitude, oPoint.latitude, oPoint.longitude, cPoint.latitude, cPoint.longitude);

      if (angleBoC > Math.max(angleAoB, angleAoC)) {
        flag = 1;
        break;
      }
    }

    if (flag == 0) {
      cutPoint.push(aPoint);
    } else {
      flag = 0;
    }

  }

  return cutPoint;

}

///找到切线线段的两个端点
///basePoint是作业区域的切点
function lineStartEndPoint(basePoint, longestDistance, vHeading) {
  var twoLinePoint = [];
  twoLinePoint.push(computeOffset(vLat0, vLon0, longestDistance, vHeading));
  twoLinePoint.push(computeOffset(vLat0, vLon0, -longestDistance, vHeading));

  return twoLinePoint;
}


/// 球面点到射线距离
/// 直角为A,三角ABC对边的弧度值分别为abc,则
/// Sinb = Sina SinB
/// <param name="vLat">点坐标纬度</param>
/// <param name="vLon">点坐标经度</param>
/// <param name="vLat0">射线端点纬度</param>
/// <param name="vLon0">射线端点经度</param>
/// <param name="vHeading">射线航向角</param>
function PointDistance2Line(vLat, vLon, vLat0, vLon0, vHeading) {
  if (IsApproximateZero(ComputeSpacialDistance(vLat, vLon, vLat0, vLon0, vRadius))) {
    return 0;
  }
  var pB = Angle2Arc(vHeading - GetAzimuth(vLat0, vLon0, vLat, vLon));
  var pa = ComputeSpacialDistance(vLat0, vLon0, vLat, vLon, vRadius) / vRadius;
  return Math.asin(Math.sin(pB) * Math.sin(pa)) * vRadius;
}


/// 球面获取射线与线段的交点
/// 连接01,另角0为角A，角1为角C，射线与线段交点所在角为角C，01为b，求交点与A之间的弧长c，则有
/// Ctgc*Sinb=Cosb*CosA + SinA*CtgC
/// <param name="vLat0">射线端点纬度</param>
/// <param name="vLon0">射线端点经度</param>
/// <param name="vHeading">射线航向角</param>
/// <param name="vLat1">线段端点1纬度</param>
/// <param name="vLon1">线段端点1经度</param>
/// <param name="vLat2">线段端点2纬度</param>
/// <param name="vLon2">线段端点2经度</param>
function raysLineCross(vLat0, vLon0, vHeading, vLat1, vLon1, vLat2, vLon2) {
  var pAAngle = raysComputeAngle(vLat0, vLon0, vHeading, vLat1, vLon1);
  var pOtherAAngle = raysComputeAngle(vLat0, vLon0, vHeading, vLat2, vLon2);
  var tuple; //存放射线与线段之间的交点的数组
  //如果在端点处重合
  if (IsApproximateZero(ComputeSpacialDistance(vLat0, vLon0, vLat1, vLon1, vRadius)) || IsApproximateZero(ComputeSpacialDistance(vLat0, vLon0, vLat2, vLon2, vRadius))) {
    // return new Tuple<double, double>(vLat0, vLon0);
    tuple = { longitude: vLon0, latitude: vLat0 };
    return tuple;
  }
  //如果线段端点在射线上
  if (IsApproximateZero(pAAngle)) {
    // return new Tuple<double, double>(vLat1, vLon1);
    tuple = { longitude: vLon1, latitude: vLat1 };
    return tuple;
  }
  if (IsApproximateZero(pOtherAAngle)) {
    // return new Tuple<double, double>(vLat2, vLon2);
    tuple = { longitude: vLon2, latitude: vLat2 };
    return tuple;
  }
  //如果根据角度判断出无交线，不继续做计算
  var pAngleDiff = ComputeAngle(vLat1, vLon1, vLat0, vLon0, vLat2, vLon2) - pAAngle - pOtherAAngle;
  if (!IsApproximateZero(pAngleDiff)) {
    return null;
  }
  //如果点在线上
  if (IsApproximateZero(PointDistance2Line(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2))) {
    // return new Tuple<double, double>(vLat0, vLon0);
    tuple = { longitude: vLon0, latitude: vLat0 }
    return tuple;
  }

  var pC = Angle2Arc(ComputeAngle(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2));
  var pA = Angle2Arc(pAAngle);
  var pb = ComputeSpacialDistance(vLat0, vLon0, vLat1, vLon1, vRadius) / vRadius;
  var pcLength = vRadius * Math.atan2(Math.sin(pb), Math.cos(pb) * Math.cos(pA) + Math.sin(pA) / Math.tan(pC));

  // function computeOffset(vLat, vLon, vDistance, vHeading) {
  tuple = computeOffset(vLat0, vLon0, pcLength, vHeading);

  return tuple;
}


/// 球面获取两线段交点
/// 方便理解令11为A,12为B,21为C,22为D
/// <param name="vP1Lat1"></param>
/// <param name="vP1Lon1"></param>
/// <param name="vP1Lat2"></param>
/// <param name="vP1lon2"></param>
/// <param name="vP2Lat1"></param>
/// <param name="vP2Lon1"></param>
/// <param name="vP2Lat2"></param>
/// <param name="vP2Lon2"></param>
function twoLineCross(vP1Lat1, vP1Lon1, vP1Lat2, vP1Lon2, vP2Lat1, vP2Lon1, vP2Lat2, vP2Lon2) {
  var tuple = [];
  //如果在端点处相交
  if (IsApproximateZero(ComputeSpacialDistance(vP1Lat1, vP1Lon1, vP2Lat1, vP2Lon1, vRadius)) || IsApproximateZero(ComputeSpacialDistance(vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2, vRadius))) {
    // return new Tuple<double, double>(vP1Lat1, vP1Lon1);
    tuple.push({ longitude: vP1Lon1, latitude: vP1Lat1 });
    return tuple;
  }
  if (IsApproximateZero(ComputeSpacialDistance(vP1Lat2, vP1Lon2, vP2Lat1, vP2Lon1, vRadius)) || IsApproximateZero(ComputeSpacialDistance(vP1Lat2, vP1Lon2, vP2Lat2, vP2Lon2, vRadius))) {
    // return new Tuple<double, double>(vP1Lat2, vP1Lon2);
    tuple.push({ longitude: vP1Lon2, latitude: vP1Lat2 });
    return tuple;
  }
  //如果根据角度判断出不相交，不继续计算
  var pAngleCAD = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2);
  var pAngleCAB = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat1, vP1Lon1, vP1Lat2, vP1Lon2);
  var pAngleBAD = ComputeAngle(vP1Lat2, vP1Lon2, vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2);
  var pAngleACB = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2);
  var pAngleACD = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat1, vP2Lon1, vP2Lat2, vP2Lon2);
  var pAngleDCB = ComputeAngle(vP2Lat2, vP2Lon2, vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2);
  var pAngleCBD = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2, vP2Lat2, vP2Lon2);
  var pAngleCBA = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2, vP1Lat1, vP1Lon1);
  var pAngleABD = ComputeAngle(vP1Lat1, vP1Lon1, vP1Lat2, vP1Lon2, vP2Lat2, vP2Lon2);
  var pAngleADB = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2, vP1Lat2, vP1Lon2);
  var pAngleADC = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2, vP2Lat1, vP2Lon1);
  var pAngleCDB = ComputeAngle(vP2Lat1, vP2Lon1, vP2Lat2, vP2Lon2, vP1Lat2, vP1Lon2);
  if (!(IsApproximateZero(pAngleCAD - pAngleCAB - pAngleBAD) &&
    IsApproximateZero(pAngleACB - pAngleACD - pAngleDCB) &&
    IsApproximateZero(pAngleCBD - pAngleCBA - pAngleABD) &&
    IsApproximateZero(pAngleADB - pAngleADC - pAngleCDB))) {
    tuple = [];
    return tuple;
  }

  //有交点
  tuple.push(raysLineCross(vP1Lat1, vP1Lon1, GetAzimuth(vP1Lat1, vP1Lon1, vP1Lat2, vP1Lon2), vP2Lat1, vP2Lon1, vP2Lat2, vP2Lon2))
  return tuple;


}


//OperationArea当前作业区域，getLongestSide找到当前作业区域的最长边
function getLongestSide(OperationArea) {
  var longestSideArray = [];//存放最长边的两个点以及距离
  var sideAndDistance = [];//存放两点与两点之间的距离

  for (var i = 0; i < OperationArea.length - 1; i++) {
    longestSideArray.push({
      firstDot: OperationArea[i],
      secondDot: OperationArea[i + 1],
      distance: ComputeSpacialDistance(OperationArea[i].latitude, OperationArea[i].longitude, OperationArea[i + 1].latitude, OperationArea[i + 1].longitude, vRadius)
    })
  }

  longestSideArray = longestSideArray.sort(function (itema, itemb) {
    return itema.distance - itemb.distance
  })[longestSideArray.length - 1];

  return longestSideArray;
}


//找到离出发点最近的航线，以及该航线上离出发点最近的点。startPoint:飞机当前的位置，polyline：整个polyline数组；areaStartPostion：当前作业区域在polyline数组中的坐标，areaEndPosition：当前作业区域最后一条航线在polyline数组中的坐标,vRadius地球半径
function findLatelyNavLine(startPoint, polyline, areaStartPostion, areaEndPosition, vRadius) {
  // var polylineLength = polyline.length;

  var lenOfFirstNavLine0 = {
    value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaStartPostion + 1].points[0].latitude, polyline[areaStartPostion + 1].points[0].longitude, vRadius),//飞机所在的位置距离作业区第一条航线的第一个端点的距离
    lineIndex: areaStartPostion + 1,//代表的是第几条线
    linePointsIndex: 0,//linePointIndex代表的是这个线的哪个端点
  };
  var lenOfFirstNavLine1 = {
    value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaStartPostion + 1].points[1].latitude, polyline[areaStartPostion + 1].points[1].longitude, vRadius),
    lineIndex: areaStartPostion + 1,
    linePointsIndex: 1,
  };
  var lenOfLastNavLine0 = {
    value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaEndPosition].points[0].latitude, polyline[areaEndPosition].points[0].longitude, vRadius),
    lineIndex: areaEndPosition,
    linePointsIndex: 0,
  };

  var lenOfLastNavLine1 = {
    value: ComputeSpacialDistance(startPoint.latitude, startPoint.longitude, polyline[areaEndPosition].points[1].latitude, polyline[areaEndPosition].points[1].longitude, vRadius),
    lineIndex: areaEndPosition,
    linePointsIndex: 1,
  };
  var arr = [lenOfFirstNavLine0, lenOfFirstNavLine1, lenOfLastNavLine0, lenOfLastNavLine1];
  arr.sort(function (itema, itemb) {
    return itema.value - itemb.value
  });
  return {
    lineIndex: arr[0].lineIndex,
    linePointsIndex: arr[0].linePointsIndex,
  }

}



