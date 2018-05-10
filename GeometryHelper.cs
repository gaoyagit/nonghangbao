using System;
using System.Collections.Generic;
using System.Linq;
using ZBNavCtrl.Data.Model;

namespace ZBNavCtrl.Plan
{
    /// <summary>
    /// 几何运算帮助类
    /// </summary>
    public class GeometryHelper
    {
        const double PI = 3.14159265358979323846;

        /// <summary>
        /// 地球半径（米）
        /// 地球半周长等于该值与Pi的乘积
        /// </summary>
        private const double EarthRadius = 6378136.49;

        /// <summary>
        /// 纬度最值
        /// </summary>
        private const double MaxLat = 85.051128;

        /// <summary>
        /// 左下角的坐标原点
        /// </summary>
        public static LatLonCoor OriginPoint = new LatLonCoor(-180, -85.05112877980659);

        ///// <summary>
        ///// 获取两点间线段距离
        ///// </summary>
        ///// <param name="vLat1"></param>
        ///// <param name="vLon1"></param>
        ///// <param name="vLat2"></param>
        ///// <param name="vLon2"></param>
        ///// <returns></returns>
        //public static double GetLatLonDistance(double vLat1, double vLon1, double vLat2, double vLon2)
        //{
        //    return Math.Sqrt(Math.Pow(vLat1 - vLat2, 2) + Math.Pow(vLon1 - vLon2, 2));
        //}

        /// <summary>
        /// 求1到2的方位角(圆心在1上，角度制)
        /// </summary>
        /// <param name="vLat1"></param>
        /// <param name="vLon1"></param>
        /// <param name="vLat2"></param>
        /// <param name="vLon2"></param>
        /// <returns></returns>
        public static double GetAzimuth(double vLat1, double vLon1, double vLat2, double vLon2)
        {
            //朴素方法
            //return Math.Atan((vLon2 - vLon1) * Math.Cos(vLat2) / (vLat2 - vLat1));

            //分情况方法
            //if (vLat1 == vLat2 && vLon1 == vLon2) return 0;
            //double rAzimuth = Math.Atan2(Math.Abs(vLat2 - vLat1), Math.Abs(vLon2 - vLon1)) / PI * 180;
            //if (vLon2 >= vLon1 && vLat2 >= vLat1)
            //{
            //    rAzimuth = 90 - rAzimuth;
            //}
            //else if (vLon2 >= vLon1 && vLat2 < vLat1)
            //{
            //    rAzimuth = 90 + rAzimuth;
            //}
            //else if (vLon2 < vLon1 && vLat2 < vLat1)
            //{
            //    rAzimuth = 270 - rAzimuth;
            //}
            //else if (vLon2 < vLon1 && vLat2 >= vLat1)
            //{
            //    rAzimuth = 270 + rAzimuth;
            //}
            //return rAzimuth;

            return ComputeHeading(vLat1, vLon1, vLat2, vLon2);
        }

        /// <summary>
        /// 获取航点到航线的最短距离
        /// </summary>
        /// <param name="vPoint"></param>
        /// <param name="vLine"></param>
        /// <returns></returns>
        public static double GetLatLonMinDistance(FlightPoint vPoint, FlightLine vLine)
        {
            if (vPoint == null || vLine == null) return double.NaN;
            //Log.LogMaster.DebugPrint(
            //    GetLatLonMinSpacialDistance(vPoint.Lat, vPoint.Lon, vLine.Lat1, vLine.Lon1, vLine.Lat2, vLine.Lon2) 
            //    + " " +
            //    GetLatLonMinSpacialDistance(vPoint.Lat, vPoint.Lon, vLine.Lat2, vLine.Lon2, vLine.Lat1, vLine.Lon1)
            //    + " " +
            //    GetLatLonMinDistance(vPoint.Lat, vPoint.Lon, vLine.Lat1, vLine.Lon1, vLine.Lat2, vLine.Lon2)
            //    + " " +
            //     GetLatLonMinDistance(vPoint.Lat, vPoint.Lon, vLine.Lat2, vLine.Lon2, vLine.Lat1, vLine.Lon1)
            //    );
            return ComputeLatLonMinSpacialDistance(vPoint.Lat, vPoint.Lon, vLine.Lat1, vLine.Lon1, vLine.Lat2, vLine.Lon2);
            //return Math.Abs((vLine.Lon1 - vLine.Lon2) * vPoint.Lat + (vLine.Lat2 - vLine.Lat1) * vPoint.Lon + vLine.Lat1 * vLine.Lon2 - vLine.Lat2 * vLine.Lon1)
            //    / Math.Sqrt(Math.Pow(vLine.Lon1 - vLine.Lon2, 2) + Math.Pow(vLine.Lat2 - vLine.Lat1, 2));
        }

        /// <summary>
        /// 计算点到弧的最短弧距离（球面三角方法）
        /// 球面直角三角形公式 sinb = sina sinB
        /// a为斜边 b为锐角B的对边 边长均为弧度
        /// TODO: 该方法在a很大,b很小时误差较大，何时采用该方法需要做评估
        /// </summary>
        /// <param name="vLat0"></param>
        /// <param name="vLon0"></param>
        /// <param name="vLat1"></param>
        /// <param name="vLon1"></param>
        /// <param name="vLat2"></param>
        /// <param name="vLon2"></param>
        /// <returns></returns>
        private static double ComputeLatLonMinSpacialDistance(double vLat0, double vLon0, double vLat1, double vLon1, double vLat2, double vLon2)
        {
            double rDistance = double.NaN;
            try
            {
                var pB = Angle2Arc(ComputeAngle(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2));
                var pa = ComputeSpacialDistance(vLat0, vLon0, vLat1, vLon1) / EarthRadius;
                var pb = Math.Asin(Math.Sin(pa) * Math.Sin(pB));
                rDistance = pb * EarthRadius;
            }
            catch (Exception exp)
            {
                Log.LogMaster.DebugPrint(exp);
            }
            return rDistance;
        }

        ///// <summary>
        ///// 【废弃】计算点到直线的最短距离（投影方法）
        ///// </summary>
        ///// <param name="vLat0"></param>
        ///// <param name="vLon0"></param>
        ///// <param name="vLat1"></param>
        ///// <param name="vLon1"></param>
        ///// <param name="vLat2"></param>
        ///// <param name="vLon2"></param>
        ///// <returns></returns>
        //private static double GetLatLonMinDistance(double vLat0, double vLon0, double vLat1, double vLon1, double vLat2, double vLon2)
        //{
        //    double pFootPointLat = 0;
        //    double pFootPointLon = 0;
        //    GetLatLonFootPoint(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2, out pFootPointLat, out pFootPointLon);
        //    return ComputeSpacialDistance(vLat0, vLon0, pFootPointLat, pFootPointLon);
        //    //return Math.Abs((vLon1 - vLon2) * vLat0 + (vLat2 - vLat1) * vLon0 + vLat1 * vLon2 - vLat2 * vLon1) / Math.Sqrt(Math.Pow(vLon1 - vLon2, 2) + Math.Pow(vLat2 - vLat1, 2));
        //}

        ///// <summary>
        ///// 平面模式下获取垂足
        ///// </summary>
        ///// <param name="vLat0"></param>
        ///// <param name="vLon0"></param>
        ///// <param name="vLat1"></param>
        ///// <param name="vLon1"></param>
        ///// <param name="vLat2"></param>
        ///// <param name="vLat2"></param>
        ///// <param name="rLat"></param>
        ///// <param name="rLon"></param>
        ///// <returns></returns>
        //private static void GetPlanCommonFootPoint(double vLat0, double vLon0, double vLat1, double vLon1, double vLat2, double vLon2, out double rLat, out double rLon)
        //{
        //    double A = vLon1 - vLon2;
        //    double B = vLat2 - vLat1;
        //    double C = vLat1 * vLon2 - vLat2 * vLon1;
        //    rLat = (B * B * vLat0 - A * B * vLon0 - A * C) / (A * A + B * B);
        //    rLon = (-A * B * vLat0 + A * A * vLon0 - B * C) / (A * A + B * B);
        //}

        ///// <summary>
        ///// 获取点到线的垂足(投影后计算)
        ///// </summary>
        ///// <param name="vLat0"></param>
        ///// <param name="vLon0"></param>
        ///// <param name="vLat1"></param>
        ///// <param name="vLon1"></param>
        ///// <param name="vLat2"></param>
        ///// <param name="vLon2"></param>
        ///// <param name="rLat"></param>
        ///// <param name="rLon"></param>
        //public static void GetLatLonFootPointByProjection(double vLat0, double vLon0, double vLat1, double vLon1, double vLat2, double vLon2, out double rLat, out double rLon)
        //{
        //    LatLonCoor pCoor0 = new LatLonCoor(vLon0, vLat0);
        //    LatLonCoor pCoor1 = new LatLonCoor(vLon1, vLat1);
        //    LatLonCoor pCoor2 = new LatLonCoor(vLon2, vLat2);
        //    MeterCoor mCoor0 = LatLon2Meter(pCoor0);
        //    MeterCoor mCoor1 = LatLon2Meter(pCoor1);
        //    MeterCoor mCoor2 = LatLon2Meter(pCoor2);
        //    double pY = 0;
        //    double pX = 0;
        //    GetPlanCommonFootPoint(mCoor0.Y, mCoor0.X, mCoor1.Y, mCoor1.X, mCoor2.Y, mCoor2.X, out pY, out pX);
        //    var rLatLonFootPoint = Meter2LatLon(new MeterCoor(pX, pY));
        //    rLat = rLatLonFootPoint.Lat;
        //    rLon = rLatLonFootPoint.Lon;
        //}

        /// <summary>
        /// 获取点到线的垂足（直接在球面上计算）
        /// A为垂足所在角，垂距为b，另一直角边为c
        /// Sinc = Tanb * CtanB
        /// </summary>
        /// <param name="vLat0"></param>
        /// <param name="vLon0"></param>
        /// <param name="vLat1"></param>
        /// <param name="vLon1"></param>
        /// <param name="vLat2"></param>
        /// <param name="vLon2"></param>
        /// <param name="rLat"></param>
        /// <param name="rLon"></param>
        public static void GetLatLonFootPoint(double vLat0, double vLon0, double vLat1, double vLon1, double vLat2, double vLon2, out double rLat, out double rLon)
        {
            rLat = 0;
            rLon = 0;
            //如果点与端点重合
            if (IsApproximateZero(ComputeSpacialDistance(vLat0, vLon0, vLat1, vLon1)) && IsApproximateZero(ComputeSpacialDistance(vLat0, vLon0, vLat2, vLon2)))
            {
                rLat = vLat0;
                rLon = vLon0;
            }
            double pDistance = ComputeLatLonMinSpacialDistance(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2);
            //如果点在线上
            if (IsApproximateZero(pDistance))
            {
                rLat = vLat0;
                rLon = vLon0;
            }
            double pAngle012 = ComputeAngle(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2);
            double pAngle021 = ComputeAngle(vLat0, vLon0, vLat2, vLon2, vLat1, vLon1);
            double pFoot2latLon1Distance = EarthRadius * Math.Asin(Math.Tan(pDistance / EarthRadius) / Math.Tan(Angle2Arc(pAngle012)));
            if (pAngle012 < 90 && pAngle021 < 90)
            {
                ComputeOffset(vLat1, vLon1, pFoot2latLon1Distance, GetAzimuth(vLat1, vLon1, vLat2, vLon2), out rLat, out rLon);
            }
            else
            {
                ComputeOffset(vLat1, vLon1, pFoot2latLon1Distance, GetAzimuth(vLat2, vLon2, vLat1, vLon1), out rLat, out rLon);
            }
        }

        /// <summary>
        /// WGS84经纬度坐标转Web墨卡托米制坐标
        /// </summary>
        /// <param name="vLatLonCoor"></param>
        /// <returns></returns>
        public static MeterCoor LatLon2Meter(LatLonCoor vLatLonCoor)
        {
            MeterCoor rCoor = new MeterCoor();
            if (vLatLonCoor.Lon > 180)
                vLatLonCoor.Lon = 180;
            else if (vLatLonCoor.Lon < -180)
                vLatLonCoor.Lon = -180;
            rCoor.X = vLatLonCoor.Lon * EarthRadius * Math.PI / 180.0;
            if (vLatLonCoor.Lat > -OriginPoint.Lat)
                vLatLonCoor.Lat = -OriginPoint.Lat;
            else if (vLatLonCoor.Lat < OriginPoint.Lat)
                vLatLonCoor.Lat = OriginPoint.Lat;
            rCoor.Y = Math.Log(Math.Tan((90 + vLatLonCoor.Lat) * Math.PI / 360.0)) / (Math.PI / 180.0) * Math.PI * EarthRadius / 180.0;
            return rCoor;
        }

        /// <summary>
        /// Web墨卡托米制坐标转WGS84经纬度坐标
        /// </summary>
        /// <param name="vMeterCoor"></param>
        /// <returns></returns>
        public static LatLonCoor Meter2LatLon(MeterCoor vMeterCoor)
        {
            LatLonCoor rCoor = new LatLonCoor();
            rCoor.Lon = vMeterCoor.X / (Math.PI * EarthRadius) * 180.0;
            rCoor.Lat = vMeterCoor.Y / (Math.PI * EarthRadius) * 180.0;
            rCoor.Lat = 180.0 / Math.PI * (2 * Math.Atan(Math.Exp(rCoor.Lat * Math.PI / 180.0)) - Math.PI / 2.0);
            return rCoor;
        }

        /// <summary>
        /// 计算点到线段的最短距离
        /// </summary>
        /// <param name="vLat0"></param>
        /// <param name="vLon0"></param>
        /// <param name="vLat1"></param>
        /// <param name="vLon1"></param>
        /// <param name="vLat2"></param>
        /// <param name="vLon2"></param>
        /// <returns></returns>
        private static double PointDistance2SegmentLine(double vLat0, double vLon0, double vLat1, double vLon1, double vLat2, double vLon2)
        {
            double rDis = double.MaxValue;
            if (ComputeAngle(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2) < 90 && ComputeAngle(vLat0, vLon0, vLat2, vLon2, vLat1, vLon1) < 90)
            {
                rDis = ComputeLatLonMinSpacialDistance(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2);
            }
            else
            {
                rDis = Math.Min(ComputeSpacialDistance(vLat0, vLon0, vLat1, vLon1), ComputeSpacialDistance(vLat0, vLon0, vLat2, vLon2));
            }
            return rDis;
        }

        /// <summary>
        /// 点到区的最短距离
        /// </summary>
        /// <param name="vLat0"></param>
        /// <param name="vLon0"></param>
        /// <param name="vGeometryPoints"></param>
        /// <returns></returns>
        public static double PointDistance2Region(double vLat0, double vLon0, List<GeometryPoint> vGeometryPoints)
        {
            if (vGeometryPoints.Count == 0)
                return double.MaxValue;
            if (IsRegionContainsPoint(vGeometryPoints, vLat0, vLon0))
            {
                return 0;
            }
            else
            {
                if (vGeometryPoints.Count == 1)
                    return ComputeSpacialDistance(vLat0, vLon0, vGeometryPoints[0].Lat, vGeometryPoints[0].Lon);
                else
                {
                    double rDistance = double.MaxValue;
                    //加一个点以使首尾相接的情况能够包含在内
                    vGeometryPoints.Add(vGeometryPoints[0]);
                    for (int i = 0; i < vGeometryPoints.Count - 1; i++)
                    {
                        double pDistance = PointDistance2SegmentLine(vLat0, vLon0, vGeometryPoints[i].Lat, vGeometryPoints[i].Lon, vGeometryPoints[i + 1].Lat, vGeometryPoints[i + 1].Lon);
                        if (pDistance < rDistance)
                        {
                            rDistance = pDistance;
                        }
                    }
                    return rDistance;
                }
            }
        }

        /// <summary>
        /// 点到线的最短距离
        /// </summary>
        /// <param name="vLat0"></param>
        /// <param name="vLon0"></param>
        /// <param name="vLinePoints"></param>
        /// <returns></returns>
        public static double PointDistance2Line(double vLat0, double vLon0, List<GeometryPoint> vLinePoints)
        {
            if (vLinePoints.Count == 1)
                return ComputeSpacialDistance(vLat0, vLon0, vLinePoints[0].Lat, vLinePoints[0].Lon);
            else
            {
                double rDistance = double.MaxValue;
                for (int i = 0; i < vLinePoints.Count - 1; i++)
                {
                    double pDistance = PointDistance2SegmentLine(vLat0, vLon0, vLinePoints[i].Lat, vLinePoints[i].Lon, vLinePoints[i + 1].Lat, vLinePoints[i + 1].Lon);
                    if (pDistance < rDistance)
                    {
                        rDistance = pDistance;
                    }
                }
                return rDistance;
            }
        }

        ///// <summary>
        ///// 点在线上方（国界范围内，平面地图角度），是则返回true
        ///// </summary>
        ///// <param name="vPoint"></param>
        ///// <param name="vLine"></param>
        ///// <returns></returns>
        //public static bool PointIsUp2Line(FlightPoint vPoint, FlightLine vLine)
        //{
        //    if (vPoint == null || vLine == null) return true;
        //    //在线上也算作在线上方
        //    if (vLine.Lon1 == vLine.Lon2) return true;
        //    if ((vPoint.Lon - vLine.Lon1) * (vLine.Lat2 - vLine.Lat1) / (vLine.Lon2 - vLine.Lon1) + vLine.Lat1 < vPoint.Lat)
        //        return true;
        //    else
        //        return false;
        //}

        /// <summary>
        /// 计算以航点位置的速度与航向与指定几何体碰撞所需时间
        /// 如正在碰撞区域内返回0 如不会碰撞返回-1
        /// </summary>
        /// <param name="vPoint"></param>
        /// <param name="vBarrierGeometry"></param>
        /// <returns></returns>
        public static double CrashWhen(FlightPoint vPoint, Geometry vBarrierGeometry)
        {
            switch (vBarrierGeometry.GeometryType)
            {
                //障碍点的检查以对长宽近似为100米的矩形区域的检查为准，这里不要求精确，所以在经纬度上大概加一个约数
                case GeometryTypeEnum.BarrierPoint:
                    List<GeometryPoint> pPoints = new List<GeometryPoint>();
                    double pDifLength = 0.005;
                    GeometryPoint pBPoint = vBarrierGeometry.Points[0];
                    //自己定义的点位列表要注意维护点序号
                    pPoints.Add(new GeometryPoint(pBPoint.Lat - pDifLength, pBPoint.Lon - pDifLength, 0));
                    pPoints.Add(new GeometryPoint(pBPoint.Lat - pDifLength, pBPoint.Lon + pDifLength, 1));
                    pPoints.Add(new GeometryPoint(pBPoint.Lat + pDifLength, pBPoint.Lon + pDifLength, 2));
                    pPoints.Add(new GeometryPoint(pBPoint.Lat + pDifLength, pBPoint.Lon - pDifLength, 3));
                    return CrashWhen2Region(vPoint.Lat, vPoint.Lon, vPoint.Direction, vPoint.Speed, pPoints);
                case GeometryTypeEnum.BarrierLine:
                    return CrashWhen2Line(vPoint.Lat, vPoint.Lon, vPoint.Direction, vPoint.Speed, vBarrierGeometry.Points);
                case GeometryTypeEnum.BarrierRegion:
                    return CrashWhen2Region(vPoint.Lat, vPoint.Lon, vPoint.Direction, vPoint.Speed, vBarrierGeometry.Points);
                default:
                    Log.LogMaster.GetInstance().Log("CrashWhen Can't calculate", "Point " + vPoint.ToString() + " Geometry " + vBarrierGeometry.GUID);
                    break;
            }
            return 0;
        }

        /// <summary>
        /// 指定点位以指定速度指定角度与指定折线碰撞所需时间（暂不考虑侧刮，也不考虑多段线折叠相交）
        /// </summary>
        /// <param name="vPLat"></param>
        /// <param name="vPLon"></param>
        /// <param name="vHeading"></param>
        /// <param name="vSpeed"></param>
        /// <param name="vPoints">折线的节点</param>
        /// <returns></returns>
        private static double CrashWhen2Line(double vPLat, double vPLon, double vHeading, double vSpeed, List<GeometryPoint> vPoints)
        {
            //将边界点按照到点位与航向形成的射线的距离排序，由近及远找到射线与多边形的交点（至多一个）
            IOrderedEnumerable<GeometryPoint> pOrderPoints = vPoints.OrderBy<GeometryPoint, double>(p => PointDistance2Line(p.Lat, p.Lon, vPLat, vPLon, vHeading));
            IEnumerator<GeometryPoint> pEPoint = pOrderPoints.GetEnumerator();
            //找到的交点列表
            List<Tuple<double, double>> pLatLons = new List<Tuple<double, double>>();
            //记录已进行过计算的点对，防止换点时重复计算，该点对永远小号在前
            List<Tuple<int, int>> pCalculatedLines = new List<Tuple<int, int>>();
            //pEPoint.Reset();
            int pCalPointCount = 0;
            while (pEPoint.MoveNext())
            {
                //按现在的考虑，最多需要找两个点
                if (pCalPointCount > 2) break;
                //找到两个交点就不继续向下找了
                if (pLatLons.Count >= 1) break;
                GeometryPoint pPoint = pEPoint.Current;
                //如果点近似在射线上(舍入小数点后八位为0),直接作为一个点
                if (IsApproximateZero(PointDistance2Line(pPoint.Lat, pPoint.Lon, vPLat, vPLon, vHeading)))
                {
                    Tuple<double, double> pLatLon = new Tuple<double, double>(pPoint.Lat, pPoint.Lon);
                    pLatLons.Add(pLatLon);
                    continue;
                }
                int pPIndex = pPoint.PointIndex;
                //如果不是第一个点,与前一点组成点对并计算
                if (pPIndex > 0)
                {
                    int pPreIndex = pPIndex - 1;
                    Tuple<int, int> pLine = new Tuple<int, int>(pPreIndex, pPIndex);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vPLat, vPLon, vHeading, vPoints[pPreIndex].Lat, vPoints[pPreIndex].Lon, pPoint.Lat, pPoint.Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
                //如果不是最后一个点，与后一点组成点对并计算
                if (pPIndex < vPoints.Count - 1)
                {
                    int pNextIndex = pPIndex + 1;
                    Tuple<int, int> pLine = new Tuple<int, int>(pPIndex, pNextIndex);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vPLat, vPLon, vHeading, pPoint.Lat, pPoint.Lon, vPoints[pNextIndex].Lat, vPoints[pNextIndex].Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
                pCalPointCount++;
            }

            double pDistance = 0;
            if (pLatLons.Count > 0)
                pDistance = (from pLatLon in pLatLons select ComputeSpacialDistance(vPLat, vPLon, pLatLon.Item1, pLatLon.Item2)).Min();
            else
                return double.PositiveInfinity;
            return pDistance / vSpeed;
        }

        /// <summary>
        /// 指定点位以指定速度指定角度进入指定区域所需时间
        /// </summary>
        /// <param name="vPLat"></param>
        /// <param name="vPLon"></param>
        /// <param name="vHeading"></param>
        /// <param name="vSpeed"></param>
        /// <param name="vPoints">区域的边界点（不考虑凹多边形，只考虑凸多边形）</param>
        /// <returns></returns>
        private static double CrashWhen2Region(double vPLat, double vPLon, double vHeading, double vSpeed, List<GeometryPoint> vPoints)
        {
            //如果点在区域内，所需时间为0
            if (IsRegionContainsPoint(vPoints, vPLat, vPLon))
                return 0;
            //将边界点按照到点位与航向形成的射线的距离排序，由近及远找到射线与多边形的交点（至少一个，至多两个）
            IOrderedEnumerable<GeometryPoint> pOrderPoints = vPoints.OrderBy<GeometryPoint, double>(p => PointDistance2Line(p.Lat, p.Lon, vPLat, vPLon, vHeading));
            IEnumerator<GeometryPoint> pEPoint = pOrderPoints.GetEnumerator();
            //找到的交点列表
            List<Tuple<double, double>> pLatLons = new List<Tuple<double, double>>();
            //记录已进行过计算的点对，防止换点时重复计算，该点对永远小号在前（除去首尾相接的一对点）
            List<Tuple<int, int>> pCalculatedLines = new List<Tuple<int, int>>();
            //pEPoint.Reset();
            while (pEPoint.MoveNext())
            {
                //找到两个交点就不继续向下找了
                if (pLatLons.Count >= 2) break;
                GeometryPoint pPoint = pEPoint.Current;
                //如果点近似在射线上(舍入小数点后八位为0),直接作为一个点
                if (IsApproximateZero(PointDistance2Line(pPoint.Lat, pPoint.Lon, vPLat, vPLon, vHeading)))
                {
                    Tuple<double, double> pLatLon = new Tuple<double, double>(pPoint.Lat, pPoint.Lon);
                    pLatLons.Add(pLatLon);
                    continue;
                }
                int pPIndex = pPoint.PointIndex;
                //如果不是第一个点,与前一点组成点对并计算
                if (pPIndex > 0)
                {
                    int pPreIndex = pPIndex - 1;
                    Tuple<int, int> pLine = new Tuple<int, int>(pPreIndex, pPIndex);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vPLat, vPLon, vHeading, vPoints[pPreIndex].Lat, vPoints[pPreIndex].Lon, pPoint.Lat, pPoint.Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
                //线段首尾相接的情况
                else
                {
                    Tuple<int, int> pLine = new Tuple<int, int>(vPoints.Count - 1, 0);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vPLat, vPLon, vHeading, vPoints[vPoints.Count - 1].Lat, vPoints[vPoints.Count - 1].Lon, pPoint.Lat, pPoint.Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
                //如果不是最后一个点，与后一点组成点对并计算
                if (pPIndex < vPoints.Count - 1)
                {
                    int pNextIndex = pPIndex + 1;
                    Tuple<int, int> pLine = new Tuple<int, int>(pPIndex, pNextIndex);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vPLat, vPLon, vHeading, pPoint.Lat, pPoint.Lon, vPoints[pNextIndex].Lat, vPoints[pNextIndex].Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
            }
            double pDistance = 0;
            if (pLatLons.Count > 0)
            {
                pDistance = (from pLatLon in pLatLons select ComputeSpacialDistance(vPLat, vPLon, pLatLon.Item1, pLatLon.Item2)).Min();
            }
            else
            {
                return double.PositiveInfinity;
            }
            return FinishWhen(pDistance, vSpeed);
        }

        /// <summary>
        /// 加强版道格拉斯普客抽稀，保持线的形状不变，删除多余的节点
        /// 方案是 从两端向中间不断二分，当二分点与端点间的点到二分点与端点连线的距离全部小于容差，将中间点全部删去
        /// </summary>
        /// <param name="pPointLatLngs"></param>
        /// <param name="vTolerance">计算垂距的容忍度</param>
        /// <returns></returns>
        public static List<Tuple<double, double>> EnhancedDouglasPukeDilute(List<Tuple<double, double>> vPointLatLngs, double vTolerance = 3)
        {
            List<Tuple<double, double>> rList = new List<Tuple<double, double>>();
            int pPointTotalCount = vPointLatLngs.Count;
            if (pPointTotalCount > 2)
            {
                //计算中间点距离
                var pStartLat = vPointLatLngs[0].Item1;
                var pStartLon = vPointLatLngs[0].Item2;
                var pEndLat = vPointLatLngs[pPointTotalCount - 1].Item1;
                var pEndLon = vPointLatLngs[pPointTotalCount - 1].Item2;
                if (
                    vPointLatLngs.FindIndex(
                            tp =>
                            ComputeLatLonMinSpacialDistance(tp.Item1, tp.Item2, pStartLat, pStartLon, pEndLat, pEndLon) > vTolerance
                        ) < 0)
                {
                    rList.Add(vPointLatLngs[0]);
                    rList.Add(vPointLatLngs[pPointTotalCount - 1]);
                }
                else
                {
                    //偶数时前后各取一半
                    if (pPointTotalCount % 2 == 0)
                    {
                        List<Tuple<double, double>> pEvenFrontPoints = vPointLatLngs.GetRange(0, pPointTotalCount / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pEvenFrontPoints, vTolerance));
                        List<Tuple<double, double>> pEvenBackPoints = vPointLatLngs.GetRange(pPointTotalCount / 2, pPointTotalCount / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pEvenBackPoints, vTolerance));
                    }
                    //奇数时前后交叉于中间一个
                    else
                    {
                        List<Tuple<double, double>> pOddFrontPoints = vPointLatLngs.GetRange(0, (pPointTotalCount + 1) / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pOddFrontPoints, vTolerance));
                        rList.RemoveAt(rList.Count - 1);
                        List<Tuple<double, double>> pOddBackPoints = vPointLatLngs.GetRange((pPointTotalCount - 1) / 2, (pPointTotalCount + 1) / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pOddBackPoints, vTolerance));
                    }
                }

            }
            else
            {
                rList = vPointLatLngs;
            }
            return rList;
        }

        /// <summary>
        /// 加强版道格拉斯普客抽稀，保持线的形状不变，删除多余的节点
        /// 方案是 从两端向中间不断二分，当二分点与端点间的点到二分点与端点连线的距离全部小于容差，将中间点全部删去
        /// </summary>
        /// <param name="pPointLatLngs"></param>
        /// <param name="vTolerance">计算垂距的容忍度</param>
        /// <returns></returns>
        public static List<Tuple<double, double, double>> EnhancedDouglasPukeDilute(List<Tuple<double, double, double>> vPointLatLngs, double vTolerance = 3)
        {
            List<Tuple<double, double, double>> rList = new List<Tuple<double, double, double>>();
            int pPointTotalCount = vPointLatLngs.Count;
            if (pPointTotalCount > 2)
            {
                //计算中间点距离
                var pStartLat = vPointLatLngs[0].Item1;
                var pStartLon = vPointLatLngs[0].Item2;
                var pEndLat = vPointLatLngs[pPointTotalCount - 1].Item1;
                var pEndLon = vPointLatLngs[pPointTotalCount - 1].Item2;
                if (
                    vPointLatLngs.FindIndex(
                            tp =>
                            ComputeLatLonMinSpacialDistance(tp.Item1, tp.Item2, pStartLat, pStartLon, pEndLat, pEndLon) > vTolerance
                        ) < 0)
                {
                    rList.Add(vPointLatLngs[0]);
                    rList.Add(vPointLatLngs[pPointTotalCount - 1]);
                }
                else
                {
                    //偶数时前后各取一半
                    if (pPointTotalCount % 2 == 0)
                    {
                        List<Tuple<double, double, double>> pEvenFrontPoints = vPointLatLngs.GetRange(0, pPointTotalCount / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pEvenFrontPoints, vTolerance));
                        List<Tuple<double, double, double>> pEvenBackPoints = vPointLatLngs.GetRange(pPointTotalCount / 2, pPointTotalCount / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pEvenBackPoints, vTolerance));
                    }
                    //奇数时前后交叉于中间一个
                    else
                    {
                        List<Tuple<double, double, double>> pOddFrontPoints = vPointLatLngs.GetRange(0, (pPointTotalCount + 1) / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pOddFrontPoints, vTolerance));
                        rList.RemoveAt(rList.Count - 1);
                        List<Tuple<double, double, double>> pOddBackPoints = vPointLatLngs.GetRange((pPointTotalCount - 1) / 2, (pPointTotalCount + 1) / 2);
                        rList.AddRange(EnhancedDouglasPukeDilute(pOddBackPoints, vTolerance));
                    }
                }

            }
            else
            {
                rList = vPointLatLngs;
            }
            return rList;
        }

        /// <summary>
        /// 以指定的速度完成指定长度的飞行所需要的时间
        /// </summary>
        /// <param name="pLatDistance"></param>
        /// <param name="vSpeed"></param>
        /// <returns></returns>
        public static double FinishWhen(double pLatDistance, double vSpeed)
        {
            return pLatDistance / vSpeed;
        }

        /// <summary>
        /// 获得点到边界点列表所组成区的最短距离（20160408单位暂时为度，纠正后单位为米）
        /// </summary>
        /// <param name="vPLat"></param>
        /// <param name="vPLon"></param>
        /// <param name="vPoints"></param>
        /// <returns></returns>
        public static double Distance2Region(double vPLat, double vPLon, List<GeometryPoint> vPoints)
        {
            if (vPoints == null || vPoints.Count == 0)
            {
                return double.PositiveInfinity;
            }
            else if (vPoints.Count == 1)
            {
                return ComputeSpacialDistance(vPLat, vPLon, vPoints[0].Lat, vPoints[0].Lon);
            }
            else
            {
                if (IsRegionContainsPoint(vPoints, vPLat, vPLon)) return 0;
                double rDis = PointDistance2SegmentLine(vPLat, vPLon, vPoints[vPoints.Count - 1].Lat, vPoints[vPoints.Count - 1].Lon, vPoints[0].Lat, vPoints[0].Lon);
                for (int i = 0; i < vPoints.Count - 1; i++)
                {
                    rDis = Math.Min(rDis, PointDistance2SegmentLine(vPLat, vPLon, vPoints[i].Lat, vPoints[i].Lon, vPoints[i + 1].Lat, vPoints[i + 1].Lon));
                }
                return rDis;
            }
        }

        ///// <summary>
        ///// 将以北方向为零点的坐标方位角转化为用于表示斜率的夹角
        ///// </summary>
        ///// <param name="vHeading"></param>
        ///// <returns></returns>
        //private static double Heading2KAndgle(double vHeading)
        //{
        //    while (vHeading >= 360)
        //    {
        //        vHeading -= 360;
        //    }
        //    while (vHeading < 0)
        //    {
        //        vHeading += 360;
        //    }
        //    double rAngle = 0;
        //    if (vHeading >= 0 && vHeading < 180)
        //    {
        //        rAngle = 90 - vHeading;
        //    }
        //    else
        //    {
        //        rAngle = 270 - vHeading;
        //    }
        //    return rAngle;
        //}

        public static bool IsRegionContainsPoint(Geometry vGeometry, double vLat, double vLon, double vMaxMinDistance = 100)
        {
            switch (vGeometry.GeometryType)
            {
                case GeometryTypeEnum.PlanLine:
                    return IsPointAroundLine(vLat, vLon, vGeometry.Points, vMaxMinDistance);
                default:
                    return IsRegionContainsPoint(vGeometry.Points, vLat, vLon);
            }
        }

        /// <summary>
        /// 给定区域包含点（在边界上也算作包含）
        /// </summary>
        /// <param name="vPoints">区域的边界点</param>
        /// <param name="vLat"></param>
        /// <param name="vLon"></param>
        /// <returns></returns>
        public static bool IsRegionContainsPoint(List<GeometryPoint> vPoints, double vLat, double vLon)
        {
            bool crossFlag = false;
            for (int i = 0, j = vPoints.Count - 1; i < vPoints.Count; j = i, i++)
            {
                GeometryPoint pPoint1 = vPoints[i];
                GeometryPoint pPoint2 = vPoints[j];

                //点为多边形顶点
                if ((pPoint1.Lat == vLat && pPoint1.Lon == vLon) ||
                    (pPoint2.Lat == vLat && pPoint2.Lon == vLon))
                    return true;

                //线段位于给定点沿Lat向两侧
                if ((pPoint1.Lon < vLon && pPoint2.Lon >= vLon) ||
                    (pPoint1.Lon >= vLon && pPoint2.Lon < vLon))
                {
                    double tempLat = pPoint1.Lat + (vLon - pPoint1.Lon) * (pPoint2.Lat - pPoint1.Lat) / (pPoint2.Lon - pPoint1.Lon);

                    if (tempLat == vLat)
                        return true;

                    if (tempLat > vLat)
                        crossFlag = !crossFlag;
                }

            }
            return crossFlag;
        }

        /// <summary>
        /// 点是否在给定线的周围
        /// </summary>
        /// <param name="vLat"></param>
        /// <param name="vLon"></param>
        /// <param name="vLinePoints"></param>
        /// <param name="vMaxDistance">判断周围这一条件的最短距离</param>
        /// <returns></returns>
        public static bool IsPointAroundLine(double vLat, double vLon, List<GeometryPoint> vLinePoints, double vMaxMinDistance = 100)
        {
            if (vLinePoints == null) return false;
            if (vLinePoints.Count == 0) return ComputeSpacialDistance(vLat, vLon, vLinePoints[0].Lat, vLinePoints[0].Lon) <= vMaxMinDistance;
            //找出所有与vLatLon距离小于等于vMaxMinDistance的线段
            List<Tuple<double, double, double, double>> pMinDistanceSegmentLines = new List<Tuple<double, double, double, double>>();
            for (int i = 0; i < vLinePoints.Count - 1; i++)
            {
                double pLat1 = vLinePoints[i].Lat;
                double pLon1 = vLinePoints[i].Lon;
                double pLat2 = vLinePoints[i + 1].Lat;
                double pLon2 = vLinePoints[i + 1].Lon;
                if (PointDistance2SegmentLine(vLat, vLon, pLat1, pLon1, pLat2, pLon2) <= vMaxMinDistance)
                {
                    pMinDistanceSegmentLines.Add(new Tuple<double, double, double, double>(pLat1, pLon1, pLat2, pLon2));
                }
            }
            //如果有任一个的线段满足点在该线段所处区间中，判断就成立
            foreach (var pSegmentLine in pMinDistanceSegmentLines)
            {
                if (ComputeAngle(vLat, vLon, pSegmentLine.Item1, pSegmentLine.Item2, pSegmentLine.Item3, pSegmentLine.Item4) <= 90 &&
                    ComputeAngle(vLat, vLon, pSegmentLine.Item3, pSegmentLine.Item4, pSegmentLine.Item1, pSegmentLine.Item2) <= 90)
                {
                    return true;
                }
            }
            return false;
            //List<GeometryPoint> pLeftLinePoints = getParallelFlightLine(vLinePoints, true, vMaxMinDistance);
            //List<GeometryPoint> pRightLinePoints = getParallelFlightLine(vLinePoints, false, vMaxMinDistance);
            //pRightLinePoints.Reverse();
            //pLeftLinePoints.AddRange(pRightLinePoints);
            //return IsRegionContainsPoint(pLeftLinePoints, vLat, vLon);
        }

        /// <summary>
        /// 得到由vLinePoints连成的图形组成的线向左(vLeftLine=true)平移vDistance时得到的线
        /// </summary>
        /// <param name="vLinePoints"></param>
        /// <param name="vLeftLine">是否向左规划，是则向左，不是则向右</param>
        /// <param name="vDistance"></param>
        /// <returns></returns>
        private static List<GeometryPoint> getParallelFlightLine(List<GeometryPoint> vLinePoints, bool vLeftLine, double vDistance)
        {
            List<GeometryPoint> rPoints = new List<GeometryPoint>();
            int pLinePsCount = vLinePoints.Count;
            if (pLinePsCount == 0)
            {
            }
            else if (pLinePsCount == 1)
            {
                double pRLat = 0;
                double pRLon = 0;
                if (vLeftLine)
                {
                    ComputeOffset(vLinePoints[0].Lat, vLinePoints[0].Lon, vDistance, -90, out pRLat, out pRLon);
                }
                else
                {
                    ComputeOffset(vLinePoints[0].Lat, vLinePoints[0].Lon, vDistance, 90, out pRLat, out pRLon);
                }
                rPoints.Add(new GeometryPoint(pRLat, pRLon));
            }
            else
            {
                //计算起点平移点
                double pStartAngle = GetAzimuth(vLinePoints[0].Lat, vLinePoints[0].Lon, vLinePoints[1].Lat, vLinePoints[1].Lon);
                ComputeOffset(vLinePoints[0].Lat, vLinePoints[0].Lon, vDistance, vLeftLine ? pStartAngle - 90 : pStartAngle + 90, out double pRStartLat, out double pRStartLon);
                rPoints.Add(new GeometryPoint(pRStartLat, pRStartLon));
                for (int i = 1; i < pLinePsCount - 1; i++)
                {
                    double pPreAngle = GetAzimuth(vLinePoints[i - 1].Lat, vLinePoints[i - 1].Lon, vLinePoints[i].Lat, vLinePoints[i].Lon);
                    double pAfterAngle = GetAzimuth(vLinePoints[i].Lat, vLinePoints[i].Lon, vLinePoints[i + 1].Lat, vLinePoints[i + 1].Lon);
                    double pMiddleAngle = (pPreAngle + pAfterAngle) / 2.0;
                    ComputeOffset(vLinePoints[i].Lat, vLinePoints[i].Lon, vDistance, vLeftLine ? pMiddleAngle - 90 : pMiddleAngle + 90, out double pRMLat, out double pRMLon);
                    rPoints.Add(new GeometryPoint(pRMLat, pRMLon));
                }
                //计算终点平移点
                double pEndAngle = GetAzimuth(vLinePoints[pLinePsCount - 2].Lat, vLinePoints[pLinePsCount - 2].Lon, vLinePoints[pLinePsCount - 1].Lat, vLinePoints[pLinePsCount - 1].Lon);
                ComputeOffset(vLinePoints[pLinePsCount - 1].Lat, vLinePoints[pLinePsCount - 1].Lon, vDistance, vLeftLine ? pEndAngle - 90 : pEndAngle + 90, out double pREndLat, out double pREndLon);
                rPoints.Add(new GeometryPoint(pREndLat, pREndLon));
            }
            return rPoints;
        }

        /// <summary>
        /// 确定由航线与工作区交点构成的交线段
        /// </summary>
        /// <param name="vFlightLine"></param>
        /// <param name="vPoints"></param>
        /// <returns></returns>
        public static FlightLine GetCrossLine(FlightLine vFlightLine, List<GeometryPoint> vPoints)
        {
            IOrderedEnumerable<GeometryPoint> pOrderPoints = vPoints.OrderBy<GeometryPoint, double>(p => PointDistance2Line(p.Lat, p.Lon, vFlightLine.Lat1, vFlightLine.Lon1, vFlightLine.Lat2, vFlightLine.Lon2));
            IEnumerator<GeometryPoint> pEPoint = pOrderPoints.GetEnumerator();
            //找到的交点列表
            List<Tuple<double, double>> pLatLons = new List<Tuple<double, double>>();
            //记录已进行过计算的点对，防止换点时重复计算，该点对永远小号在前（除去首尾相接的一对点）
            List<Tuple<int, int>> pCalculatedLines = new List<Tuple<int, int>>();
            //pEPoint.Reset();
            while (pEPoint.MoveNext())
            {
                GeometryPoint pPoint = pEPoint.Current;
                //如果点近似在航线上(舍入小数点后八位为0),直接作为一个点
                if (IsApproximateZero(PointDistance2Line(pPoint.Lat, pPoint.Lon, vFlightLine.Lat1, vFlightLine.Lon1, vFlightLine.Lat2, vFlightLine.Lon2)))
                {
                    Tuple<double, double> pLatLon = new Tuple<double, double>(pPoint.Lat, pPoint.Lon);
                    pLatLons.Add(pLatLon);
                    continue;
                }
                int pPIndex = pPoint.PointIndex;
                //如果不是第一个点,与前一点组成点对并计算
                if (pPIndex > 0)
                {
                    int pPreIndex = pPIndex - 1;
                    Tuple<int, int> pLine = new Tuple<int, int>(pPreIndex, pPIndex);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vFlightLine.Lat1, vFlightLine.Lon1, vFlightLine.Lat2, vFlightLine.Lon2, vPoints[pPreIndex].Lat, vPoints[pPreIndex].Lon, pPoint.Lat, pPoint.Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
                //线段首尾相接的情况
                else
                {
                    Tuple<int, int> pLine = new Tuple<int, int>(vPoints.Count - 1, 0);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vFlightLine.Lat1, vFlightLine.Lon1, vFlightLine.Lat2, vFlightLine.Lon2, vPoints[vPoints.Count - 1].Lat, vPoints[vPoints.Count - 1].Lon, pPoint.Lat, pPoint.Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
                //如果不是最后一个点，与后一点组成点对并计算
                if (pPIndex < vPoints.Count - 1)
                {
                    int pNextIndex = pPIndex + 1;
                    Tuple<int, int> pLine = new Tuple<int, int>(pPIndex, pNextIndex);
                    if (!pCalculatedLines.Contains(pLine))
                    {
                        pCalculatedLines.Add(pLine);
                        Tuple<double, double> pTuple = LineCross(vFlightLine.Lat1, vFlightLine.Lon1, vFlightLine.Lat2, vFlightLine.Lon2, pPoint.Lat, pPoint.Lon, vPoints[pNextIndex].Lat, vPoints[pNextIndex].Lon);
                        if (pTuple != null && !pLatLons.Contains(pTuple))
                            pLatLons.Add(pTuple);
                    }
                }
            }
            if (pLatLons == null || pLatLons.Count < 2)
                return null;
            List<Tuple<double, double>> rLatlons = new List<Tuple<double, double>>(pLatLons.OrderBy<Tuple<double, double>, double>(p => ComputeSpacialDistance(p.Item1, p.Item2, vFlightLine.Lat1, vFlightLine.Lon1)));
            FlightLine rFlightLine = new FlightLine(vFlightLine.GeometryGUID, rLatlons[0].Item1, rLatlons[0].Item2, rLatlons[rLatlons.Count - 1].Item1, rLatlons[rLatlons.Count - 1].Item2);
            return rFlightLine;
        }

        ///// <summary>
        ///// 平面点到线（点斜式表示）的二维距离
        ///// </summary>
        ///// <param name="vY">点坐标纬度</param>
        ///// <param name="vX">点坐标经度</param>
        ///// <param name="vY0">射线端点纬度</param>
        ///// <param name="vX0">射线端点经度</param>
        ///// <param name="vHeading">射线航向角</param>
        ///// <returns></returns>
        //public static double PlanePointDistance2Line(double vY, double vX, double vY0, double vX0, double vHeading)
        //{
        //    double pKAngle = Heading2KAndgle(vHeading);
        //    if (pKAngle == 90 || pKAngle == -90)
        //    {
        //        return Math.Abs(vX - vX0);
        //    }
        //    else
        //    {
        //        double pK = Math.Tan(pKAngle * PI / 180);
        //        return Math.Abs((pK * vX - vY + vY0 - pK * vX0) / Math.Sqrt(Math.Pow(pK, 2) + Math.Pow(1, 2)));
        //    }
        //}

        ///// <summary>
        ///// 平面点到线（两点式）的二维距离（垂足可以落在延长线上）
        ///// </summary>
        ///// <param name="vY">点纬度</param>
        ///// <param name="vX">点经度</param>
        ///// <param name="vY1">直线上点1纬度</param>
        ///// <param name="vX1">直线上点1经度</param>
        ///// <param name="vY2">直线上点2纬度</param>
        ///// <param name="vX2">直线上点2经度</param>
        ///// <returns></returns>
        //public static double PlanePointDistance2Line(double vY, double vX, double vY1, double vX1, double vY2, double vX2)
        //{
        //    double A1 = vY2 - vY1;
        //    double B1 = vX1 - vX2;
        //    double C1 = vX2 * vY1 - vX1 * vY2;

        //    return Math.Abs((A1 * vX + B1 * vY + C1) / Math.Sqrt(Math.Pow(A1, 2) + Math.Pow(B1, 2)));
        //}

        /// <summary>
        /// 球面点到线段的距离
        /// 直角为A,三角ABC对边的弧度值分别为abc,则
        /// Sinb = Sina SinB
        /// </summary>
        /// <param name="vLat">点纬度</param>
        /// <param name="vLon">点经度</param>
        /// <param name="vLat1">直线上点1纬度</param>
        /// <param name="vLon1">直线上点1经度</param>
        /// <param name="vLat2">直线上点2纬度</param>
        /// <param name="vLon2">直线上点2经度</param>
        /// <returns></returns>
        public static double PointDistance2Line(double vLat, double vLon, double vLat1, double vLon1, double vLat2, double vLon2)
        {
            if (IsApproximateZero(ComputeSpacialDistance(vLat, vLon, vLat1, vLon1)) || IsApproximateZero(ComputeSpacialDistance(vLat, vLon, vLat2, vLon2)))
            {
                return 0;
            }
            double pB = Angle2Arc(ComputeAngle(vLat, vLon, vLat2, vLon2, vLat1, vLon1));
            double pa = ComputeSpacialDistance(vLat2, vLon2, vLat, vLon) / EarthRadius;
            return Math.Asin(Math.Sin(pB) * Math.Sin(pa)) * EarthRadius;
        }

        /// <summary>
        /// 球面点到射线距离
        /// 直角为A,三角ABC对边的弧度值分别为abc,则
        /// Sinb = Sina SinB
        /// </summary>
        /// <param name="vLat">点坐标纬度</param>
        /// <param name="vLon">点坐标经度</param>
        /// <param name="vLat0">射线端点纬度</param>
        /// <param name="vLon0">射线端点经度</param>
        /// <param name="vHeading">射线航向角</param>
        /// <returns></returns>
        public static double PointDistance2Line(double vLat, double vLon, double vLat0, double vLon0, double vHeading)
        {
            if (IsApproximateZero(ComputeSpacialDistance(vLat, vLon, vLat0, vLon0)))
            {
                return 0;
            }
            double pB = Angle2Arc(vHeading - GetAzimuth(vLat0, vLon0, vLat, vLon));
            double pa = ComputeSpacialDistance(vLat0, vLon0, vLat, vLon) / EarthRadius;
            return Math.Asin(Math.Sin(pB) * Math.Sin(pa)) * EarthRadius;
        }


        ///// <summary>
        ///// 平面获取射线与线段的交点
        ///// </summary>
        ///// <param name="vY0">射线端点纬度</param>
        ///// <param name="vX0">射线端点经度</param>
        ///// <param name="vHeading">射线航向角</param>
        ///// <param name="vY1">线段端点1纬度</param>
        ///// <param name="vX1">线段端点1经度</param>
        ///// <param name="vY2">线段端点2纬度</param>
        ///// <param name="vX2">线段端点2经度</param>
        ///// <returns></returns>
        //public static Tuple<double, double> PlaneLineCross(double vY0, double vX0, double vHeading, double vY1, double vX1, double vY2, double vX2)
        //{
        //    Tuple<double, double> rTuple = null;
        //    double pKAngle = Heading2KAndgle(vHeading);
        //    //Lon作为X，Lat作为Y，线段方程的参数
        //    double A2 = vY2 - vY1;
        //    double B2 = vX1 - vX2;
        //    double C2 = vX2 * vY1 - vX1 * vY2;
        //    if (pKAngle == 90 || pKAngle == -90)
        //    {
        //        if (IsApproximateZero(B2))
        //        {
        //            //重合
        //            if (vX1 == vX0)
        //            {
        //                rTuple = new Tuple<double, double>(vX1, vY1);
        //            }
        //            //平行
        //            else
        //            {
        //                return null;
        //            }
        //        }
        //        else
        //        {
        //            //原算法中写反了（X,Y） rTuple = new Tuple<double, double>(-(C2 + A2 * vLon0) / B2, vLon0);
        //            rTuple = new Tuple<double, double>(vX0, -(C2 + A2 * vX0) / B2);
        //        }
        //        return rTuple;
        //    }
        //    double A1 = Math.Tan(pKAngle * PI / 180);
        //    double B1 = -1;
        //    double C1 = vY0 - Math.Tan(pKAngle * PI / 180) * vX0;
        //    double A1B2A2B1 = A1 * B2 - A2 * B1;
        //    double A2C1A1C2 = A2 * C1 - A1 * C2;
        //    double B1C2B2C1 = B1 * C2 - B2 * C1;

        //    double rLat = 0;
        //    double rLon = 0;

        //    //前四种情况计算出的值不够准确，会被认为交点不在线上，故单独处理
        //    if (IsApproximateZero(A1) && !IsApproximateZero(B1) && !IsApproximateZero(A2))
        //    {
        //        //rLat = (vP1Lat2 + vP1Lat1) / 2.0;
        //        rLat = -C1 / B1;
        //        rLon = (-C2 - B2 * rLat) / A2;
        //    }
        //    else if (!IsApproximateZero(A1) && IsApproximateZero(A2) && !IsApproximateZero(B2))
        //    {
        //        rLat = (vY2 + vY1) / 2.0;
        //        //rLat = -C2 / B2;
        //        rLon = (-C1 - B1 * rLat) / A1;
        //    }
        //    else if (!IsApproximateZero(A1) && IsApproximateZero(B1) && !IsApproximateZero(B2))
        //    {
        //        //rLon = (vP1Lon1 + vP1Lon2) / 2.0;
        //        rLon = -C1 / A1;
        //        rLat = (-C2 + A2 * rLon) / B2;
        //    }
        //    else if (!IsApproximateZero(B1) && !IsApproximateZero(A2) && IsApproximateZero(B2))
        //    {
        //        rLon = (vX1 + vX2) / 2.0;
        //        //rLon = -C2 / A2;
        //        rLat = (-C1 - A1 * rLon) / B1;
        //    }
        //    else if (IsApproximateZero(A1B2A2B1))
        //    {
        //        return null;
        //    }
        //    else
        //    {
        //        rLat = A2C1A1C2 / A1B2A2B1;
        //        rLon = B1C2B2C1 / A1B2A2B1;
        //    }
        //    //如果交点在线段内且在射线的方向上再返回
        //    if (rLat >= Math.Min(vY1, vY2) && rLat <= Math.Max(vY1, vY2) && rLon >= Math.Min(vX1, vX2) && rLon <= Math.Max(vX1, vX2) &&
        //        Math.Abs(vHeading - GetAzimuth(vY0, vX0, rLat, rLon)) < 90)
        //        rTuple = new Tuple<double, double>(rLat, rLon);
        //    else
        //        rTuple = null;

        //    return rTuple;
        //}

        ///// <summary>
        ///// 获取两线段交点
        ///// </summary>
        ///// <param name="vP1Lat1"></param>
        ///// <param name="vP1Lon1"></param>
        ///// <param name="vP1Lat2"></param>
        ///// <param name="vP1lon2"></param>
        ///// <param name="vP2Lat1"></param>
        ///// <param name="vP2Lon1"></param>
        ///// <param name="vP2Lat2"></param>
        ///// <param name="vP2Lon2"></param>
        ///// <returns></returns>
        //public static Tuple<double, double> PlaneLineCross(double vP1Lat1, double vP1Lon1, double vP1Lat2, double vP1Lon2, double vP2Lat1, double vP2Lon1, double vP2Lat2, double vP2Lon2)
        //{
        //    Tuple<double, double> rTuple = null;

        //    //Lon作为X，Lat作为Y，线段方程的参数
        //    double A1 = vP1Lat2 - vP1Lat1;
        //    double B1 = vP1Lon1 - vP1Lon2;
        //    double C1 = vP1Lon2 * vP1Lat1 - vP1Lon1 * vP1Lat2;

        //    double A2 = vP2Lat2 - vP2Lat1;
        //    double B2 = vP2Lon1 - vP2Lon2;
        //    double C2 = vP2Lon2 * vP2Lat1 - vP2Lon1 * vP2Lat2;

        //    double A1B2A2B1 = A1 * B2 - A2 * B1;
        //    double A2C1A1C2 = A2 * C1 - A1 * C2;
        //    double B1C2B2C1 = B1 * C2 - B2 * C1;

        //    double rLat = 0;
        //    double rLon = 0;

        //    //前四种情况计算出的值不够准确，会被认为交点不在线上，故单独处理
        //    if (IsApproximateZero(A1) && !IsApproximateZero(B1) && !IsApproximateZero(A2))
        //    {
        //        rLat = (vP1Lat2 + vP1Lat1) / 2.0;
        //        //rLat = -C1 / B1;
        //        rLon = (-C2 - B2 * rLat) / A2;
        //    }
        //    else if (!IsApproximateZero(A1) && IsApproximateZero(A2) && !IsApproximateZero(B2))
        //    {
        //        rLat = (vP2Lat2 + vP2Lat1) / 2.0;
        //        //rLat = -C2 / B2;
        //        rLon = (-C1 - B1 * rLat) / A1;
        //    }
        //    else if (!IsApproximateZero(A1) && IsApproximateZero(B1) && !IsApproximateZero(B2))
        //    {
        //        rLon = (vP1Lon1 + vP1Lon2) / 2.0;
        //        //rLon = -C1 / A1;
        //        rLat = (-C2 + A2 * rLon) / B2;
        //    }
        //    else if (!IsApproximateZero(B1) && !IsApproximateZero(A2) && IsApproximateZero(B2))
        //    {
        //        rLon = (vP2Lon1 + vP2Lon2) / 2.0;
        //        //rLon = -C2 / A2;
        //        rLat = (-C1 - A1 * rLon) / B1;
        //    }
        //    else if (IsApproximateZero(A1B2A2B1))
        //    {
        //        return null;
        //    }
        //    else
        //    {
        //        rLat = A2C1A1C2 / A1B2A2B1;
        //        rLon = B1C2B2C1 / A1B2A2B1;
        //    }

        //    //如果交点在线段内再返回
        //    if (rLat >= Math.Min(vP1Lat1, vP1Lat2) && rLat <= Math.Max(vP1Lat1, vP1Lat2) && rLon >= Math.Min(vP1Lon1, vP1Lon2) && rLon <= Math.Max(vP1Lon1, vP1Lon2) &&
        //        rLat >= Math.Min(vP2Lat1, vP2Lat2) && rLat <= Math.Max(vP2Lat1, vP2Lat2) && rLon >= Math.Min(vP2Lon1, vP2Lon2) && rLon <= Math.Max(vP2Lon1, vP2Lon2))
        //        rTuple = new Tuple<double, double>(rLat, rLon);
        //    else
        //        rTuple = null;

        //    return rTuple;
        //}

        /// <summary>
        /// 球面获取射线与线段的交点
        /// 连接01,另角0为角A，角1为角C，射线与线段交点所在角为角C，01为b，求交点与A之间的弧长c，则有
        /// Ctgc*Sinb=Cosb*CosA + SinA*CtgC
        /// </summary>
        /// <param name="vLat0">射线端点纬度</param>
        /// <param name="vLon0">射线端点经度</param>
        /// <param name="vHeading">射线航向角</param>
        /// <param name="vLat1">线段端点1纬度</param>
        /// <param name="vLon1">线段端点1经度</param>
        /// <param name="vLat2">线段端点2纬度</param>
        /// <param name="vLon2">线段端点2经度</param>
        /// <returns></returns>
        public static Tuple<double, double> LineCross(double vLat0, double vLon0, double vHeading, double vLat1, double vLon1, double vLat2, double vLon2)
        {
            double pAAngle = ComputeAngle(vLat0, vLon0, vHeading, vLat1, vLon1);
            double pOtherAAngle = ComputeAngle(vLat0, vLon0, vHeading, vLat2, vLon2);
            //如果在端点处重合
            if (IsApproximateZero(ComputeSpacialDistance(vLat0, vLon0, vLat1, vLon1)) || IsApproximateZero(ComputeSpacialDistance(vLat0, vLon0, vLat2, vLon2)))
            {
                return new Tuple<double, double>(vLat0, vLon0);
            }
            //如果线段端点在射线上
            if (IsApproximateZero(pAAngle))
            {
                return new Tuple<double, double>(vLat1, vLon1);
            }
            if (IsApproximateZero(pOtherAAngle))
            {
                return new Tuple<double, double>(vLat2, vLon2);
            }
            //如果根据角度判断出无交线，不继续做计算
            double pAngleDiff = ComputeAngle(vLat1, vLon1, vLat0, vLon0, vLat2, vLon2) - pAAngle - pOtherAAngle;
            if (!IsApproximateZero(pAngleDiff))
            {
                return null;
            }
            //如果点在线上
            if (IsApproximateZero(PointDistance2Line(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2)))
            {
                return new Tuple<double, double>(vLat0, vLon0);
            }

            double pC = Angle2Arc(ComputeAngle(vLat0, vLon0, vLat1, vLon1, vLat2, vLon2));
            double pA = Angle2Arc(pAAngle);
            double pb = ComputeSpacialDistance(vLat0, vLon0, vLat1, vLon1) / EarthRadius;
            double pcLength = EarthRadius * Math.Atan2(Math.Sin(pb), Math.Cos(pb) * Math.Cos(pA) + Math.Sin(pA) / Math.Tan(pC));

            ComputeOffset(vLat0, vLon0, pcLength, vHeading, out double rLat, out double rLon);
            return new Tuple<double, double>(rLat, rLon);
        }

        /// <summary>
        /// 球面获取两线段交点
        /// 方便理解令11为A,12为B,21为C,22为D
        /// </summary>
        /// <param name="vP1Lat1"></param>
        /// <param name="vP1Lon1"></param>
        /// <param name="vP1Lat2"></param>
        /// <param name="vP1lon2"></param>
        /// <param name="vP2Lat1"></param>
        /// <param name="vP2Lon1"></param>
        /// <param name="vP2Lat2"></param>
        /// <param name="vP2Lon2"></param>
        /// <returns></returns>
        public static Tuple<double, double> LineCross(double vP1Lat1, double vP1Lon1, double vP1Lat2, double vP1Lon2, double vP2Lat1, double vP2Lon1, double vP2Lat2, double vP2Lon2)
        {
            //如果在端点处相交
            if (IsApproximateZero(ComputeSpacialDistance(vP1Lat1, vP1Lon1, vP2Lat1, vP2Lon1)) || IsApproximateZero(ComputeSpacialDistance(vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2)))
            {
                return new Tuple<double, double>(vP1Lat1, vP1Lon1);
            }
            if (IsApproximateZero(ComputeSpacialDistance(vP1Lat2, vP1Lon2, vP2Lat1, vP2Lon1)) || IsApproximateZero(ComputeSpacialDistance(vP1Lat2, vP1Lon2, vP2Lat2, vP2Lon2)))
            {
                return new Tuple<double, double>(vP1Lat2, vP1Lon2);
            }
            //如果根据角度判断出不相交，不继续计算
            double pAngleCAD = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2);
            double pAngleCAB = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat1, vP1Lon1, vP1Lat2, vP1Lon2);
            double pAngleBAD = ComputeAngle(vP1Lat2, vP1Lon2, vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2);
            double pAngleACB = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2);
            double pAngleACD = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat1, vP2Lon1, vP2Lat2, vP2Lon2);
            double pAngleDCB = ComputeAngle(vP2Lat2, vP2Lon2, vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2);
            double pAngleCBD = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2, vP2Lat2, vP2Lon2);
            double pAngleCBA = ComputeAngle(vP2Lat1, vP2Lon1, vP1Lat2, vP1Lon2, vP1Lat1, vP1Lon1);
            double pAngleABD = ComputeAngle(vP1Lat1, vP1Lon1, vP1Lat2, vP1Lon2, vP2Lat2, vP2Lon2);
            double pAngleADB = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2, vP1Lat2, vP1Lon2);
            double pAngleADC = ComputeAngle(vP1Lat1, vP1Lon1, vP2Lat2, vP2Lon2, vP2Lat1, vP2Lon1);
            double pAngleCDB = ComputeAngle(vP2Lat1, vP2Lon1, vP2Lat2, vP2Lon2, vP1Lat2, vP1Lon2);
            if (!(IsApproximateZero(pAngleCAD - pAngleCAB - pAngleBAD) &&
                 IsApproximateZero(pAngleACB - pAngleACD - pAngleDCB) &&
                 IsApproximateZero(pAngleCBD - pAngleCBA - pAngleABD) &&
                 IsApproximateZero(pAngleADB - pAngleADC - pAngleCDB)))
            {
                return null;
            }
            return LineCross(vP1Lat1, vP1Lon1, GetAzimuth(vP1Lat1, vP1Lon1, vP1Lat2, vP1Lon2), vP2Lat1, vP2Lon1, vP2Lat2, vP2Lon2);
        }

        /// <summary>
        /// 判断一个数是否近似为0
        /// 小数点后三为为0，近似为0
        /// </summary>
        /// <param name="vNum"></param>
        /// <returns></returns>
        public static bool IsApproximateZero(double vNum)
        {
            if (Math.Round(vNum, 3) == 0)
                return true;
            else
                return false;
        }

        /// <summary>
        /// 获取平行线段
        /// </summary>
        /// <param name="vSourceFlightLine"></param>
        /// <param name="vAngleAtStartPoint"></param>
        /// <param name="vDistance"></param>
        /// <returns></returns>
        public static FlightLine getParallelFlightLine(FlightLine vSourceFlightLine, double vAngleAtStartPoint, double vDistance)
        {
            double pStartLat = 0;
            double pStartLon = 0;
            double pEndLat = 0;
            double pEndLon = 0;
            double pSourceAzimuth = GetAzimuth(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, vSourceFlightLine.Lat2, vSourceFlightLine.Lon2);

            #region 经纬度按平面坐标算，角度偏差大
            //double pLatLonDistance = vDistance * vLengthConvert;
            //计算经纬度方向上的长度变形比例
            //double pLatRate = 1;
            //double pLonRate = 1;
            //double pSLineLength = GetLatLonDistance(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, vSourceFlightLine.Lat2, vSourceFlightLine.Lon2);
            //double pLatDif = vSourceFlightLine.Lat2 - vSourceFlightLine.Lat1;
            //double pLonDif = vSourceFlightLine.Lon2 - vSourceFlightLine.Lon1;
            //if (pLatDif != 0)
            //    pLatRate = distanceAzimuth2LatDif(pSLineLength, pSourceAzimuth) / pLatDif;
            //if (pLonDif != 0)
            //    pLonRate = distanceAzimuth2LonDif(pSLineLength, pSourceAzimuth) / pLonDif;

            //double pAzimuth = pSourceAzimuth + vAngleAtStartPoint;
            //double pKAngle = Math.Round(pAzimuth, 2);

            //pStartLat = vSourceFlightLine.Lat1 + distanceAzimuth2LatDif(pLatLonDistance, pKAngle) / pLatRate;
            //pStartLon = vSourceFlightLine.Lon1 + distanceAzimuth2LonDif(pLatLonDistance, pKAngle) / pLonRate;

            //pEndLat = vSourceFlightLine.Lat2 + distanceAzimuth2LatDif(pLatLonDistance, pKAngle) / pLatRate;
            //pEndLon = vSourceFlightLine.Lon2 + distanceAzimuth2LonDif(pLatLonDistance, pKAngle) / pLonRate;
            #endregion

            double pAzimuth = pSourceAzimuth + vAngleAtStartPoint;

            ComputeOffset(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, vDistance, pAzimuth, out pStartLat, out pStartLon);
            ComputeOffset(vSourceFlightLine.Lat2, vSourceFlightLine.Lon2, vDistance, pAzimuth, out pEndLat, out pEndLon);

            FlightLine rLine = new FlightLine(vSourceFlightLine.GeometryGUID, pStartLat, pStartLon, pEndLat, pEndLon);
            return rLine;
        }

        /// <summary>
        /// 获取链式平行线段
        /// </summary>
        /// <param name="vsourceFlightLine"></param>
        /// <param name="vAngleAtStartPoint"></param>
        /// <param name="vDistance"></param>
        /// <param name="isPreLine">待求线段是否是源线段的前一条</param>
        /// <returns></returns>
        public static LinkFlightLine getParallelFlightLine(ref LinkFlightLine vSourceFlightLine, double vAngleAtStartPoint, double vDistance, bool isPreLine)
        {

            double pStartLat = 0;
            double pStartLon = 0;
            double pEndLat = 0;
            double pEndLon = 0;
            double pSourceAzimuth = GetAzimuth(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, vSourceFlightLine.Lat2, vSourceFlightLine.Lon2);

            double pAzimuth = pSourceAzimuth + vAngleAtStartPoint;

            ComputeOffset(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, vDistance, pAzimuth, out pStartLat, out pStartLon);
            ComputeOffset(vSourceFlightLine.Lat2, vSourceFlightLine.Lon2, vDistance, pAzimuth, out pEndLat, out pEndLon);

            LinkFlightLine rLine = new LinkFlightLine(vSourceFlightLine.GeometryGUID, pStartLat, pStartLon, pEndLat, pEndLon);
            if (isPreLine)
            {
                rLine.SetNextFilghtLine(vSourceFlightLine);
                vSourceFlightLine.SetPreFlightLine(rLine);
            }
            else
            {
                rLine.SetPreFlightLine(vSourceFlightLine);
                vSourceFlightLine.SetNextFilghtLine(rLine);
            }
            return rLine;
        }


        ///// <summary>
        ///// 根据距离和方位角计算纬度方向的值
        ///// </summary>
        ///// <param name="vLatLonDistance"></param>
        ///// <param name="vAzimuth"></param>
        ///// <returns></returns>
        //private static double distanceAzimuth2LatDif(double vLatLonDistance, double vAzimuth)
        //{
        //    double rDif = vLatLonDistance;
        //    while (vAzimuth >= 360)
        //    {
        //        vAzimuth -= 360;
        //    }
        //    while (vAzimuth < 0)
        //    {
        //        vAzimuth += 360;
        //    }
        //    if (vAzimuth >= 0 && vAzimuth < 90)
        //    {
        //        rDif = vLatLonDistance * Math.Sin((90 - vAzimuth) * PI / 180.0);
        //    }
        //    else if (vAzimuth >= 90 && vAzimuth < 180)
        //    {
        //        rDif = -vLatLonDistance * Math.Sin((vAzimuth - 90) * PI / 180.0);
        //    }
        //    else if (vAzimuth >= 180 && vAzimuth < 270)
        //    {
        //        rDif = -vLatLonDistance * Math.Sin((270 - vAzimuth) * PI / 180.0);
        //    }
        //    else if (vAzimuth >= 270 && vAzimuth < 360)
        //    {
        //        rDif = vLatLonDistance * Math.Sin((vAzimuth - 270) * PI / 180.0);
        //    }
        //    return rDif;
        //}

        ///// <summary>
        ///// 根据距离和方位角计算经度方向的值
        ///// </summary>
        ///// <param name="vLatLonDistance"></param>
        ///// <param name="vAzimuth"></param>
        ///// <returns></returns>
        //private static double distanceAzimuth2LonDif(double vLatLonDistance, double vAzimuth)
        //{
        //    double rDif = vLatLonDistance;
        //    while (vAzimuth >= 360)
        //    {
        //        vAzimuth -= 360;
        //    }
        //    while (vAzimuth < 0)
        //    {
        //        vAzimuth += 360;
        //    }
        //    if (vAzimuth >= 0 && vAzimuth < 90)
        //    {
        //        rDif = vLatLonDistance * Math.Cos((90 - vAzimuth) * PI / 180.0);
        //    }
        //    else if (vAzimuth >= 90 && vAzimuth < 180)
        //    {
        //        rDif = vLatLonDistance * Math.Cos((vAzimuth - 90) * PI / 180.0);
        //    }
        //    else if (vAzimuth >= 180 && vAzimuth < 270)
        //    {
        //        rDif = -vLatLonDistance * Math.Cos((270 - vAzimuth) * PI / 180.0);
        //    }
        //    else if (vAzimuth >= 270 && vAzimuth < 360)
        //    {
        //        rDif = -vLatLonDistance * Math.Cos((vAzimuth - 270) * PI / 180.0);
        //    }
        //    return rDif;
        //}

        /// <summary>
        /// 批量获取平行线段
        /// </summary>
        /// <param name="vSourceFlightLine"></param>
        /// <param name="vAngleAtStartPoint"></param>
        /// <param name="vDistance"></param>
        /// <param name="vLengthConvert"></param>
        /// <returns></returns>
        public static List<FlightLine> getParallelFlightLines(FlightLine vSourceFlightLine, double vAngleAtStartPoint, double vDistance, int vLineCount)
        {
            List<FlightLine> rLines = new List<FlightLine>();


            double pStartLat = 0;
            double pStartLon = 0;
            double pEndLat = 0;
            double pEndLon = 0;
            double pSourceAzimuth = GetAzimuth(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, vSourceFlightLine.Lat2, vSourceFlightLine.Lon2);

            #region 经纬度按平面坐标算，角度偏差大
            //double pLatLonDistance = vDistance * vLengthConvert;
            ////计算经纬度方向上的长度变形比例
            //double pLatRate = 1;
            //double pLonRate = 1;
            //double pSLineLength = GetLatLonDistance(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, vSourceFlightLine.Lat2, vSourceFlightLine.Lon2);
            //double pLatDif = vSourceFlightLine.Lat2 - vSourceFlightLine.Lat1;
            //double pLonDif = vSourceFlightLine.Lon2 - vSourceFlightLine.Lon1;
            //if (pLatDif != 0)
            //    pLatRate = distanceAzimuth2LatDif(pSLineLength, pSourceAzimuth) / pLatDif;
            //if (pLonDif != 0)
            //    pLonRate = distanceAzimuth2LonDif(pSLineLength, pSourceAzimuth) / pLonDif;

            //double pAzimuth = pSourceAzimuth + vAngleAtStartPoint;
            //double pKAngle = Math.Round(pAzimuth, 2);
            //for (int i = 1; i <= vLineCount; i++)
            //{

            //    pStartLat = vSourceFlightLine.Lat1 + i * distanceAzimuth2LatDif(pLatLonDistance, pKAngle) / pLatRate;
            //    pStartLon = vSourceFlightLine.Lon1 + i * distanceAzimuth2LonDif(pLatLonDistance, pKAngle) / pLonRate;

            //    pEndLat = vSourceFlightLine.Lat2 + i * distanceAzimuth2LatDif(pLatLonDistance, pKAngle) / pLatRate;
            //    pEndLon = vSourceFlightLine.Lon2 + i * distanceAzimuth2LonDif(pLatLonDistance, pKAngle) / pLonRate;

            //    FlightLine rLine = new FlightLine(vSourceFlightLine.GeometryGUID, pStartLat, pStartLon, pEndLat, pEndLon);
            //    rLines.Add(rLine);
            //}
            #endregion

            double pAzimuth = pSourceAzimuth + vAngleAtStartPoint;

            for (int i = 1; i <= vLineCount; i++)
            {
                ComputeOffset(vSourceFlightLine.Lat1, vSourceFlightLine.Lon1, i * vDistance, pAzimuth, out pStartLat, out pStartLon);
                ComputeOffset(vSourceFlightLine.Lat2, vSourceFlightLine.Lon2, i * vDistance, pAzimuth, out pEndLat, out pEndLon);
                FlightLine rLine = new FlightLine(vSourceFlightLine.GeometryGUID, pStartLat, pStartLon, pEndLat, pEndLon);
                rLines.Add(rLine);
            }

            return rLines;
        }

        ///// <summary>
        ///// 多条航线生成外接多边形
        ///// </summary>
        ///// <param name="vLines"></param>
        ///// <returns></returns>
        //public static void Lines2ExternalGeometry(ref Geometry vGeo, List<FlightLine> vLines)
        //{
        //    if (vLines == null || vLines.Count == 0) return;

        //    List<FlightLine> pLines = vLines;
        //    pLines = new List<FlightLine>(vLines.OrderBy<FlightLine, double>(x => x.Lat1 + x.Lat2 + x.Lon1 + x.Lon2));
        //    vGeo.AddPoint(new GeometryPoint(pLines[0].Lat1, pLines[0].Lon1));
        //    vGeo.AddPoint(new GeometryPoint(pLines[0].Lat2, pLines[0].Lon2));
        //    vGeo.AddPoint(new GeometryPoint(pLines[pLines.Count - 1].Lat2, pLines[pLines.Count - 1].Lon2));
        //    vGeo.AddPoint(new GeometryPoint(pLines[pLines.Count - 1].Lat1, pLines[pLines.Count - 1].Lon1));
        //}

        /// <summary>
        /// 计算起点到终点的航向角
        /// </summary>
        /// <param name="vFromLat"></param>
        /// <param name="vFromLon"></param>
        /// <param name="vToLat"></param>
        /// <param name="vToLon"></param>
        /// <returns></returns>
        private static double ComputeHeading(double vFromLat, double vFromLon, double vToLat, double vToLon)
        {
            double vFromLatArc = Angle2Arc(vFromLat);
            double vToLatArc = Angle2Arc(vToLat);
            double vLonArcDif = Angle2Arc(vToLon) - Angle2Arc(vFromLon);
            double rHeading = Arc2Angle(Math.Atan2(Math.Sin(vLonArcDif) * Math.Cos(vToLatArc), Math.Cos(vFromLatArc) * Math.Sin(vToLatArc) - Math.Sin(vFromLatArc) * Math.Cos(vToLatArc) * Math.Cos(vLonArcDif)));
            while (rHeading >= 360)
            {
                rHeading -= 360;
            }
            while (rHeading < 0)
            {
                rHeading += 360;
            }
            return rHeading;
        }

        /// <summary>
        /// 已经起点、经纬度、航向角，计算终点
        /// </summary>
        /// <param name="vLat">起点纬度</param>
        /// <param name="vLon">起点经度</param>
        /// <param name="vDistance">距离（单位是米）</param>
        /// <param name="vHeading">航向角</param>
        /// <param name="rLat">终点纬度</param>
        /// <param name="rLon">终点经度</param>
        /// <param name="vRadius">地球半径</param>
        public static void ComputeOffset(double vLat, double vLon, double vDistance, double vHeading, out double rLat, out double rLon, double vRadius = EarthRadius)
        {
            double pDistanceArc = vDistance / vRadius;
            double pHArc = Angle2Arc(vHeading);
            var pLatArc = Angle2Arc(vLat);
            double pDAC = Math.Cos(pDistanceArc);
            double pDAS = Math.Sin(pDistanceArc);
            double pLAS = Math.Sin(pLatArc);
            double pLAC = Math.Cos(pLatArc);
            double rLatS = pDAC * pLAS + pDAS * pLAC * Math.Cos(pHArc);
            rLat = Arc2Angle(Math.Asin(rLatS));
            rLon = Arc2Angle(Angle2Arc(vLon) + Math.Atan2(pDAS * pLAC * Math.Sin(pHArc), pDAC - pLAS * rLatS));
            //如果有必要再做一次精化
            bool pNeedRefine = false;
            if (pNeedRefine)
            {
                rLat = RefineLat(rLat);
                rLon = RefineLon(rLon);
            }
        }

        /// <summary>
        /// 已经起点、终点、求线段延长线上一定距离终点一定距离的位置的点坐标
        /// </summary>
        /// <param name="vStartLat"></param>
        /// <param name="vStartLon"></param>
        /// <param name="vEndLat"></param>
        /// <param name="vEndLon"></param>
        /// <param name="vDistance">距离终点的距离</param>
        /// <param name="rLat"></param>
        /// <param name="rLon"></param>
        /// <param name="vRadius"></param>
        public static void ComputeOffset(double vStartLat, double vStartLon, double vEndLat, double vEndLon, double vDistance, out double rLat, out double rLon, double vRadius = EarthRadius)
        {
            double pHeading = GetAzimuth(vStartLat, vStartLon, vEndLat, vEndLon);
            ComputeOffset(vEndLat, vEndLon, vDistance, pHeading, out rLat, out rLon, vRadius);
        }

        /// <summary>
        /// 计算两点间的球面距离（单位为米）
        /// </summary>
        /// <param name="vLat1"></param>
        /// <param name="vLon1"></param>
        /// <param name="vLat2"></param>
        /// <param name="vLon2"></param>
        /// <param name="vRadius"></param>
        public static double ComputeSpacialDistance(double vLat1, double vLon1, double vLat2, double vLon2, double vRadius = EarthRadius)
        {
            double pLat1Arc = Angle2Arc(vLat1);
            double pLat2Arc = Angle2Arc(vLat2);
            double pLon1Arc = Angle2Arc(vLon1);
            double pLon2Arc = Angle2Arc(vLon2);
            double pArcDistance = 2 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin((pLat1Arc - pLat2Arc) / 2), 2) + Math.Cos(pLat1Arc) * Math.Cos(pLat2Arc) * Math.Pow((Math.Sin(pLon1Arc - pLon2Arc) / 2), 2)));
            return pArcDistance * vRadius;
        }

        /// <summary>
        /// 角度转弧度
        /// </summary>
        /// <param name="vAngle"></param>
        /// <returns></returns>
        private static double Angle2Arc(double vAngle)
        {
            return vAngle * Math.PI / 180.0;
        }

        /// <summary>
        /// 弧度转角度
        /// </summary>
        /// <param name="vArc"></param>
        /// <returns></returns>
        private static double Arc2Angle(double vArc)
        {
            return vArc * 180.0 / Math.PI;
        }

        /// <summary>
        /// 判断纬度是否在合理范围内并返回
        /// </summary>
        /// <param name="vLat"></param>
        /// <returns></returns>
        private static double RefineLat(double vLat)
        {
            double pMinLat = -MaxLat;
            double pMaxLat = MaxLat;
            return vLat < pMinLat ? pMinLat : vLat > pMaxLat ? pMaxLat : vLat;
        }

        /// <summary>
        /// 判断经度(或航向角)是否在合理范围内并返回
        /// </summary>
        /// <param name="vLon"></param>
        /// <returns></returns>
        private static double RefineLon(double vLon)
        {
            double vMinLon = -180;
            double vMaxLon = 180;
            return vLon >= vMinLon && vLon <= vMaxLon ? vLon : ((vLon - vMinLon) % (vMaxLon - vMinLon) + (vMaxLon - vMinLon)) % (vMaxLon - vMinLon) + vMinLon;
        }

        /// <summary>
        /// 获取两条平行线段航线所组成的外接矩形(只保证适用于平行线段的外接矩形)
        /// </summary>
        /// <param name="vFlightLine1"></param>
        /// <param name="vFlightLine2"></param>
        /// <param name="vWhiteSpace">外接矩形的留白</param>
        /// <returns></returns>
        public static List<GeometryPoint> Lines2GeometryPoints(FlightLine vFlightLine1, FlightLine vFlightLine2, double vWhiteSpace = 25)
        {
            double vLat11 = vFlightLine1.Lat1;
            double vLon11 = vFlightLine1.Lon1;
            double vLat12 = vFlightLine1.Lat2;
            double vLon12 = vFlightLine1.Lon2;

            double vLat21 = vFlightLine2.Lat1;
            double vLon21 = vFlightLine2.Lon1;
            double vLat22 = vFlightLine2.Lat2;
            double vLon22 = vFlightLine2.Lon2;

            //线端点顺序为 11 12 21 22情况下 后面外接矩形点位才能是 11 12 22 21，这里判断 21 22 是否需要颠倒
            if (ComputeAngle(vFlightLine1.Lat1, vFlightLine1.Lon1, vFlightLine1.Lat2, vFlightLine1.Lon2, vFlightLine2.Lat2, vFlightLine2.Lon2)
                > ComputeAngle(vFlightLine1.Lat1, vFlightLine1.Lon1, vFlightLine1.Lat2, vFlightLine1.Lon2, vFlightLine2.Lat1, vFlightLine2.Lon1))
            {

            }
            else
            {
                vLat21 = vFlightLine2.Lat2;
                vLon21 = vFlightLine2.Lon2;
                vLat22 = vFlightLine2.Lat1;
                vLon22 = vFlightLine2.Lon1;
            }
            ComputeOffset(vLat11, vLon11, vWhiteSpace, GetAzimuth(vLat21, vLon21, vLat11, vLon11), out vLat11, out vLon11);
            ComputeOffset(vLat12, vLon12, vWhiteSpace, GetAzimuth(vLat22, vLon22, vLat12, vLon12), out vLat12, out vLon12);
            ComputeOffset(vLat22, vLon22, vWhiteSpace, GetAzimuth(vLat12, vLon12, vLat22, vLon22), out vLat22, out vLon22);
            ComputeOffset(vLat21, vLon21, vWhiteSpace, GetAzimuth(vLat11, vLon11, vLat21, vLon21), out vLat21, out vLon21);
            List<GeometryPoint> rPoints = new List<GeometryPoint>();
            rPoints.Add(new GeometryPoint(vLat11, vLon11));
            rPoints.Add(new GeometryPoint(vLat12, vLon12));
            rPoints.Add(new GeometryPoint(vLat22, vLon22));
            rPoints.Add(new GeometryPoint(vLat21, vLon21));

            return rPoints;
        }

        /// <summary>
        /// 计算出角123的大小（小于180度）
        /// </summary>
        /// <param name="vLat1"></param>
        /// <param name="vLon1"></param>
        /// <param name="vLat2"></param>
        /// <param name="vLon2"></param>
        /// <param name="vLat3"></param>
        /// <param name="vLon3"></param>
        /// <returns></returns>
        public static double ComputeAngle(double vLat1, double vLon1, double vLat2, double vLon2, double vLat3, double vLon3)
        {
            double rDouble = Math.Abs(GetAzimuth(vLat2, vLon2, vLat1, vLon1) - GetAzimuth(vLat2, vLon2, vLat3, vLon3));
            if (rDouble > 180)
            {
                rDouble = 360 - rDouble;
            }
            return rDouble;
        }

        /// <summary>
        /// 计算出射线0H与线段01的夹角(小于180度)
        /// </summary>
        /// <param name="vLat0">射线端点纬度</param>
        /// <param name="vLon0">射线端点经度</param>
        /// <param name="vHeading">射线端点航向角</param>
        /// <param name="vLat1"></param>
        /// <param name="vLon1"></param>
        /// <returns></returns>
        public static double ComputeAngle(double vLat0, double vLon0, double vHeading, double vLat1, double vLon1)
        {
            double rDouble = Math.Abs(GetAzimuth(vLat0, vLon0, vLat1, vLon1) - vHeading);
            if (rDouble > 180)
            {
                rDouble = 360 - rDouble;
            }
            return rDouble;
        }

        /// <summary>
        /// 获取指定几何图形的切线
        /// 直线y=k*x+b过点(x0,y0),则b=y0-k*x0，找到b值最小的点
        /// TODO：此方法待完善为球面三角计算方式
        /// </summary>
        /// <param name="vGeometry"></param>
        /// <param name="vAngle"></param>
        /// <returns></returns>
        public static FlightLine GetTangent(Geometry vGeometry, double vAngle = double.NaN)
        {
            if (double.IsNaN(vAngle))
            {
                vAngle = vGeometry.Angle;
            }
            while (vAngle >= 360)
            {
                vAngle -= 360;
            }
            while (vAngle < 0)
            {
                vAngle += 360;
            }
            double pKAngle = 0;
            if (vAngle >= 0 && vAngle < 90)
            {
                pKAngle = 90 - vAngle;
            }
            else if (vAngle >= 90 && vAngle < 180)
            {
                pKAngle = -(vAngle - 90);
            }
            else if (vAngle >= 180 && vAngle < 270)
            {
                pKAngle = 270 - vAngle;
            }
            else if (vAngle >= 270 && vAngle < 360)
            {
                pKAngle = -(vAngle - 270);
            }
            GeometryPoint pTangentPoint = null;
            if (pKAngle == 90 || pKAngle == -90)
            {
                //平行于Y轴比X0，越小越靠上
                var pOrderedPoints = vGeometry.Points.OrderByDescending(p => p.Lon).ToList();
                if (pOrderedPoints.Count > 0)
                {
                    pTangentPoint = pOrderedPoints[0];
                }
            }
            else
            {
                //常规情况下比b,越大越靠上
                var pDOrderedPoints = vGeometry.Points.OrderByDescending(p => p.Lat - Math.Tan(Angle2Arc(pKAngle)) * p.Lon).ToList();
                if (pDOrderedPoints.Count > 0)
                {
                    pTangentPoint = pDOrderedPoints[0];
                }
            }
            double pTangentLineLat1 = 0;
            double pTangentLineLon1 = 0;
            double pTangentLineLat2 = 0;
            double pTangentLineLon2 = 0;
            //计算工作区中最远两点的距离
            double pMaxDistanse = 500;
            List<GeometryPoint> pPoints = vGeometry.Points;
            int pPointsCount = pPoints.Count;
            for (int i = 0; i < pPointsCount; i++)
            {
                for (int j = 0; j == 0 || j < i; j++)
                {
                    double pDistanse = ComputeSpacialDistance(pPoints[i].Lat, pPoints[i].Lon, pPoints[j].Lat, pPoints[j].Lon);
                    if (pDistanse > pMaxDistanse)
                    {
                        pMaxDistanse = pDistanse;
                    }
                }
            }

            ComputeOffset(pTangentPoint.Lat, pTangentPoint.Lon, pMaxDistanse, vAngle - 180, out pTangentLineLat1, out pTangentLineLon1);
            ComputeOffset(pTangentPoint.Lat, pTangentPoint.Lon, pMaxDistanse, vAngle, out pTangentLineLat2, out pTangentLineLon2);
            return new FlightLine(vGeometry.GUID, pTangentLineLat1, pTangentLineLon1, pTangentLineLat2, pTangentLineLon2);
        }
    }

    /// <summary>
    /// Web墨卡托米制坐标
    /// </summary>
    public struct MeterCoor
    {
        public MeterCoor(double vX, double vY)
        {
            m_X = vX;
            m_Y = vY;
        }

        private double m_X;

        /// <summary>
        /// 横坐标，对应经纬度坐标的经度
        /// </summary>
        public double X
        {
            get { return m_X; }
            set { m_X = value; }
        }

        private double m_Y;

        /// <summary>
        /// 纵坐标，对应经纬度坐标的纬度
        /// </summary>
        public double Y
        {
            get { return m_Y; }
            set { m_Y = value; }
        }
    }

    /// <summary>
    /// WGS84经纬度坐标
    /// </summary>
    public struct LatLonCoor
    {

        public LatLonCoor(double vLon, double vLat)
        {
            m_Lat = vLat;
            m_Lon = vLon;
        }

        private double m_Lat;

        /// <summary>
        /// 纬度
        /// </summary>
        public double Lat
        {
            get { return m_Lat; }
            set { m_Lat = value; }
        }

        private double m_Lon;

        /// <summary>
        /// 经度
        /// </summary>
        public double Lon
        {
            get { return m_Lon; }
            set { m_Lon = value; }
        }

    }
}
