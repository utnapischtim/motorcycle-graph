import * as geom from "geometric";
import { MotorcycleSegment } from "./MotorcycleSegment";
import { MotorcyclePoint } from "./MotorcyclePoint";

export type IntersectionCachePoint = {
  "pointA": MotorcyclePoint;
  "pointB": MotorcyclePoint;
}

export type IntersectionCache = {
  [key: string]: IntersectionCachePoint;
}

export class Polygon {
  public polygon: geom.Segment[] = [];

  public constructor(points: geom.IPoint[]) {
    this.polygon = this.createPolygon(points);
  }

  public getPolygon(): geom.ISegment[] {
    return this.polygon;
  }

  private createPolygon(points: geom.IPoint[]): geom.ISegment[] {
    let polygon: geom.ISegment[] = [];
    points = geom.close(points);

    for (let k = 0; k < points.length-1; k += 1) {
      polygon.push(new geom.Segment(points[k], points[k+1]));
    }
    return polygon;
  }
}

export class Motorcycles {
  public areaNorm: number = 0;
  public pi2: number = 0;
  public polygon: geom.Segment[] = [];
  public motorcycleFullSegments: MotorcycleSegment[] = [];

  public constructor(polygon: geom.Segment[] = [], width: number, height: number) {
    this.polygon = polygon;
    this.areaNorm = Math.sqrt(width*width + height*height);
    this.pi2 = 2*Math.PI;

    this.calculateMotorcycleSegments();
  }

  public getMotorcycleSegments(): MotorcycleSegment[] {
    return this.motorcycleFullSegments;
  }

  private calculateMotorcycleSegments(): void {
    const size = this.polygon.length;
    let motorcycleCounter = 0;

    for (let i = 0; i < size; i += 1) {
      if (geom.isReflex(this.polygon[i], this.polygon[(i+1) % size])) {
        this.motorcycleFullSegments.push(this.motorcycle(this.polygon[i], this.polygon[(i+1) % size], `${motorcycleCounter++}`));
      }
    }
  }

  private motorcycle(segA: geom.ISegment, segB: geom.ISegment, text=""): MotorcycleSegment {
    let bisector = geom.angleBisector(segA, segB).invert();
    let scaleFactor = this.areaNorm / bisector.norm();

    bisector.scale(scaleFactor);

    let start = segA.t.clone();
    let target = start.add(bisector);

    const alpha = this.pi2 - geom.angleToRadians(geom.segmentAngleSegment(segA, segB));
    const velocity = 1 / Math.sin(alpha/2);
    const motorcycle = new MotorcycleSegment(start, target);

    for (const segment of this.polygon) {
      if (!geom.sharePoint(motorcycle, segment)) {
        try {
          target = <geom.IPoint>geom.intersection(motorcycle, segment);
          motorcycle.setTarget(target);
        } catch (e) {
          // console.log(e);
        }
      }
    }

    return new MotorcycleSegment(start, target, velocity, text);
  }
}

export class MotorcycleGraph {
  public intersectionCache: IntersectionCache = <IntersectionCache>{};
  public motorcycleSegments: MotorcycleSegment[] = [];
  public intersectionPoints: MotorcyclePoint[] = [];
  public isShortcut: boolean = false;
  public buildCache: boolean = false;

  public constructor(props: {isShortcut: boolean, buildCache: boolean} = {isShortcut: false, buildCache: false}) {
    this.isShortcut = props.isShortcut;
    this.buildCache = props.buildCache;
  }

  public add(intersection: MotorcyclePoint): void {
    let isExisting = false;

    for (const inter of this.intersectionPoints) {
      isExisting = isExisting || inter.equal(intersection);
    }

    if (!isExisting) {
      this.intersectionPoints.push(intersection);
    }
  }

  public calculateMotorcycleGraph(segments: MotorcycleSegment[]): void {
    this.motorcycleSegments = segments;

    this.calculateMotorcycleSegmentIntersections();
    this.buildMotorcycleGraph();
    this.calculateReductionCounter();
  }

  public calculateMotorcycleSegmentIntersections(): void {
    const time = (s: geom.IPoint, e: geom.IPoint, v: number) => {
      const dist = geom.distance(s, e);
      return dist / v;
    }

    const toBeCuted = this.isShortcut ? [this.motorcycleSegments[this.motorcycleSegments.length - 1]] : this.motorcycleSegments;

    for (const segA of this.motorcycleSegments) {
      for (const segB of toBeCuted) {
        if (segA.notEqual(segB)) {
          try {
            const inter: geom.IPoint = <geom.IPoint>geom.intersection(segA, segB);

            const segATime: number = time(segA.s, inter, segA.velocity);
            const segBTime: number = time(segB.s, inter, segB.velocity);

            const pointA: MotorcyclePoint = MotorcyclePoint.fromPoint(inter);
            pointA.time = segATime;
            pointA.lostMotorcycle = segATime < segBTime ? segB : segA;
            pointA.winMotorcycle = segATime < segBTime ? segA : segB;

            const pointB: MotorcyclePoint = MotorcyclePoint.fromPoint(inter);
            pointB.time = segBTime
            pointB.lostMotorcycle = segATime < segBTime ? segB : segA;
            pointB.winMotorcycle = segATime < segBTime ? segA : segB;

            if (segATime < segBTime) {
              pointA.state = "win";
              pointB.state = "lost";
            } else {
              pointA.state = "lost";
              pointB.state = "win";
            }

            this.add(pointA);
            this.add(pointB);

            if (this.buildCache) {
              const nodeNumberA = segA.getNodeNumber();
              const nodeNumberB = segB.getNodeNumber();

              const key: string = nodeNumberA < nodeNumberB ? `${nodeNumberA}${nodeNumberB}` : `${nodeNumberB}${nodeNumberA}`;
              this.intersectionCache[key] = {pointA, pointB};
            }
          } catch (e) {
            //console.log(e);
          }
        }
      }
    }
  }

  private buildMotorcycleGraph(): void {
    this.intersectionPoints.sort((a, b) => a.time - b.time);

    for (const inter of this.intersectionPoints) {
      if (inter.state == "win") {
        inter.lostMotorcycle.winTimes[inter.winMotorcycle.text] = inter.time;
      }

      if (inter.state == "lost") {
        if (inter.winMotorcycle.isAlive && inter.lostMotorcycle.isAlive) {
          inter.lostMotorcycle.setTarget(inter, inter.time)
        }

        else if (!inter.winMotorcycle.isAlive && inter.lostMotorcycle.isAlive) {
          if (inter.lostMotorcycle.winTimes[inter.winMotorcycle.text] < inter.winMotorcycle.timeOfDeath) {
            inter.lostMotorcycle.setTarget(inter, inter.time)
          }
        }
      }
    }
  }

  private calculateReductionCounter(): void {
    this.motorcycleSegments.forEach(m => m.updateReductionCounter());
  }

  public addSegments(segment: MotorcycleSegment): void {
    this.motorcycleSegments.push(segment);
  }

  public getSegments(): MotorcycleSegment[] {
    return this.motorcycleSegments;
  }
}

export class MotorcycleGraphCached extends MotorcycleGraph {
  public intersectionCache: IntersectionCache = <IntersectionCache>{};
  public isShortcut: boolean = true;

  public setIntersectionCache(cache: IntersectionCache): void {
    this.intersectionCache = cache;
  }

  public add(intersection: MotorcyclePoint): void {
    // with isShortcut==true it is not possible that intersection could be doubled
    this.intersectionPoints.push(intersection);
  }

  public calculateMotorcycleSegmentIntersections(): void {
    for (const segA of this.motorcycleSegments) {
      const segB = this.motorcycleSegments[this.motorcycleSegments.length - 1];

      if (segA.equal(segB)) {
        continue;
      }

      const nodeNumberA = segA.getNodeNumber();
      const nodeNumberB = segB.getNodeNumber();

      const key: string = nodeNumberA < nodeNumberB ? `${nodeNumberA}${nodeNumberB}` : `${nodeNumberB}${nodeNumberA}`;

      const inter: IntersectionCachePoint = this.intersectionCache[key];

      if (!inter) {
        // no intersection occured
        continue;
      }

      this.add(inter.pointA);
      this.add(inter.pointB);
    }
  }
}
