import * as geom from "geometric";

import type { MotorcycleSegment } from "./MotorcycleSegment";

export class Intersection extends geom.Point {
  public time: number = 0;
  public lostMotorcycle!: MotorcycleSegment;
  public winMotorcycle!: MotorcycleSegment;
  public state: string = "win";

  public constructor(x: number, y: number) {
    super(x, y);
  }

  public equal(b: Intersection, epsilon: number = 0.0000000001): boolean {
    const fromParent = super.equal(<geom.IPoint>b, epsilon);
    return fromParent && Math.abs(this.time - b.time) < epsilon;
  }

  public static fromPoint(p: geom.IPoint): Intersection {
    return new Intersection(p.x, p.y);
  }
}
