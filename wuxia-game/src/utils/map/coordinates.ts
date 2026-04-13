/**
 * 坐标计算工具
 * 职责：地图坐标转换、距离计算、向量运算
 */

export interface Point {
  x: number
  y: number
}

export interface MapCoordinate {
  mapX: number
  mapY: number
}

/**
 * 将地图坐标转换为屏幕坐标
 * @param mapCoord 地图坐标
 * @param centerCoord 中心点地图坐标
 * @param gridSize 网格大小（像素）
 * @param centerPoint 中心点屏幕坐标
 */
export function mapToScreen(
  mapCoord: MapCoordinate,
  centerCoord: MapCoordinate,
  gridSize: number,
  centerPoint: Point
): Point {
  const deltaX = mapCoord.mapX - centerCoord.mapX
  const deltaY = mapCoord.mapY - centerCoord.mapY
  
  return {
    x: centerPoint.x + deltaX * gridSize,
    y: centerPoint.y + deltaY * gridSize,
  }
}

/**
 * 计算两点之间的距离
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算单位向量
 */
export function getUnitVector(from: Point, to: Point): Point {
  const distance = calculateDistance(from, to)
  if (distance === 0) return { x: 0, y: 0 }
  
  return {
    x: (to.x - from.x) / distance,
    y: (to.y - from.y) / distance,
  }
}

/**
 * 计算点沿方向移动指定距离后的位置
 */
export function movePoint(point: Point, direction: Point, distance: number): Point {
  return {
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
  }
}

/**
 * 计算线段在圆边缘的起点和终点
 * @param from 起点中心
 * @param to 终点中心
 * @param radius 圆半径
 */
export function getLineEdgePoints(
  from: Point,
  to: Point,
  radius: number
): { start: Point; end: Point } {
  const unitVector = getUnitVector(from, to)
  
  return {
    start: movePoint(from, unitVector, radius),
    end: movePoint(to, unitVector, -radius),
  }
}

// Made with Bob
