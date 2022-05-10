import * as geom from "geometric";
import type { MotorcycleSegment } from "./MotorcycleSegment";
import { Intersection } from "./Intersection";

export type IntersectionCachePoint = {
  pointA: Intersection;
  pointB: Intersection;
};

export type IntersectionCache = {
  [key: string]: IntersectionCachePoint;
};

export class MotorcycleGraph {
  public intersectionCache: IntersectionCache = <IntersectionCache>{};
  public motorcycleSegments: MotorcycleSegment[] = [];
  public intersectionPoints: Intersection[] = [];
  public isShortcut: boolean = false;
  public buildCache: boolean = false;

  public constructor(props: { isShortcut: boolean; buildCache: boolean } = { isShortcut: false, buildCache: false }) {
    this.isShortcut = props.isShortcut;
    this.buildCache = props.buildCache;
  }

  public add(intersection: Intersection): void {
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
    };

    const toBeCuted = this.isShortcut
      ? [this.motorcycleSegments[this.motorcycleSegments.length - 1]]
      : this.motorcycleSegments;

    for (const segA of this.motorcycleSegments) {
      for (const segB of toBeCuted) {
        if (segA.notEqual(segB)) {
          const inter: geom.IPoint = <geom.IPoint>geom.intersection(segA, segB);

          if (!inter) {
            continue;
          }

          const segATime: number = time(segA.s, inter, segA.velocity);
          const segBTime: number = time(segB.s, inter, segB.velocity);

          const pointA: Intersection = Intersection.fromPoint(inter);
          pointA.time = segATime;
          pointA.lostMotorcycle = segATime < segBTime ? segB : segA;
          pointA.winMotorcycle = segATime < segBTime ? segA : segB;

          const pointB: Intersection = Intersection.fromPoint(inter);
          pointB.time = segBTime;
          pointB.lostMotorcycle = segATime < segBTime ? segB : segA;
          pointB.winMotorcycle = segATime < segBTime ? segA : segB;

          if (segATime < segBTime) {
            pointA.state = "win";
            pointB.state = "lost";
          } else {
            pointA.state = "lost";
            pointB.state = "win";
          }

          if (this.buildCache) {
            const nodeNumberA = segA.getNodeNumber();
            const nodeNumberB = segB.getNodeNumber();

            const key: string =
              nodeNumberA < nodeNumberB ? `${nodeNumberA}-${nodeNumberB}` : `${nodeNumberB}-${nodeNumberA}`;
            this.intersectionCache[key] = { pointA, pointB };
          } else {
            this.add(pointA);
            this.add(pointB);
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
          inter.lostMotorcycle.setTarget(inter, inter.time);
        } else if (!inter.winMotorcycle.isAlive && inter.lostMotorcycle.isAlive) {
          if (inter.lostMotorcycle.winTimes[inter.winMotorcycle.text] < inter.winMotorcycle.timeOfDeath) {
            inter.lostMotorcycle.setTarget(inter, inter.time);
          }
        }
      }
    }
  }

  private calculateReductionCounter(): void {
    this.motorcycleSegments.forEach((m) => m.updateReductionCounter());
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

  public add(intersection: Intersection): void {
    // with isShortcut==true it is not possible that intersection could be doubled
    this.intersectionPoints.push(intersection);
  }

  public calculateMotorcycleSegmentIntersections(): void {
    const segB = this.motorcycleSegments[this.motorcycleSegments.length - 1];
    const size = this.motorcycleSegments.length - 1; // -1 to not have to test
    // -about equality of segA
    // -to segB

    for (let i = 0; i < size; i += 1) {
      const nodeNumberA = this.motorcycleSegments[i].getNodeNumber();
      const nodeNumberB = segB.getNodeNumber();

      const key: string = nodeNumberA < nodeNumberB ? `${nodeNumberA}-${nodeNumberB}` : `${nodeNumberB}-${nodeNumberA}`;

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
