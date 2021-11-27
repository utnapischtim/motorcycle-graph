import * as geom from "geometric";

export class Polygon {
  public polygon: geom.ISegment[] = [];

  public constructor(points: geom.IPoint[]) {
    this.polygon = this.createPolygon(points);
  }

  public getPolygon(): geom.ISegment[] {
    return this.polygon;
  }

  private createPolygon(points: geom.IPoint[]): geom.ISegment[] {
    const polygon: geom.ISegment[] = [];
    const size = points.length;

    for (let i = 0; i < size; i += 1) {
      polygon.push(new geom.Segment(points[i], points[(i + 1) % size]));
    }

    return polygon;
  }
}
