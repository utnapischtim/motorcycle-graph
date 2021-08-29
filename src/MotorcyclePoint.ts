import * as geom from "geometric";

import type { MotorcycleSegment } from "./MotorcycleSegment";

export class MotorcyclePoint extends geom.Point {
  public time: number = 0;
  public lostMotorcycle!: MotorcycleSegment;
  public winMotorcycle!: MotorcycleSegment;
  public state: string = "win";

  public constructor(x: number, y: number) {
    super(x, y);
  }

  public equal(b: MotorcyclePoint, epsilon: number = 0.0000000001): boolean {
    const fromParent = super.equal(<geom.IPoint>b, epsilon);
    return fromParent && Math.abs(this.time - b.time) < epsilon;;
  }

  public static fromPoint(p: geom.IPoint): MotorcyclePoint {
    return new MotorcyclePoint(p.x, p.y);
  }
}
