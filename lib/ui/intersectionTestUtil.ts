import {Point, Line, Rect, Polygon, Circle, Arc, Geometry} from "./geometry"
import {polygonContains} from "d3-polygon";
export default class IntersectionTester {
  static contains(geometry: Geometry, x: number, y: number): boolean {
    switch(geometry.type){
      case "point": return IntersectionTester.containsPoint(geometry, x, y);
      case "line": return IntersectionTester.containsLine(geometry, x, y);
      case "rect": return IntersectionTester.containsRect(geometry, x, y);
      case "polygon": return IntersectionTester.containsPolygon(geometry, x, y);
      case "circle": return IntersectionTester.containsCircle(geometry, x, y);
      case "arc": return IntersectionTester.containsArc(geometry, x, y);
    }
  };
  private static containsPoint(point: Point, x: number, y: number): boolean {
    return point.x === x && point.y === y;
  }
  private static containsLine(line: Line, x: number, y: number): boolean {
    const minX = Math.min(line.x1, line.x2);
    const maxX = Math.max(line.x1, line.x2);
    const minY = Math.min(line.y1, line.y2);
    const maxY = Math.max(line.y1, line.y2);
    if(!(minX < x && x < maxX && minY < y && y < maxY)) return false;
    return (line.x1 - line.x2) * (y - line.y1) - (line.y1 - line.y2) * (x - line.x1) === 0;
  }
  private static containsRect(rect: Rect, x: number, y: number): boolean {
    return rect.x <= x && x <= rect.x + rect.width && rect.y <= y && y <= rect.y + rect.height;
  }
  private static containsPolygon(polygon: Polygon, x: number, y: number): boolean {
    return polygonContains(polygon.points.map(({x, y}) => [x, y]), [x, y]);
  }
  private static containsCircle(circle: Circle, x: number, y: number): boolean {
    return Math.pow(circle.cx - x, 2) + Math.pow(circle.cy - y, 2) <= Math.pow(circle.r, 2);
  }
  private static containsArc(arc: Arc, x: number, y: number): boolean {
    return Math.pow(arc.cx - x, 2) + Math.pow(arc.cy - y, 2) <= Math.pow(arc.outerRadius, 2) &&
      Math.pow(arc.cx - x, 2) + Math.pow(arc.cy - y, 2) >= Math.pow(arc.innerRadius, 2) &&
      arc.startAngle <= Math.atan2(y - arc.cy, x - arc.cx) && Math.atan2(y - arc.cy, x - arc.cx) <= arc.endAngle;
  }
}