import * as geom from "geometric";

import { MotorcycleSegment } from "./MotorcycleSegment";

export class Intersection extends geom.Point {
  public time: number = 0;
  public lostMotorcycle!: MotorcycleSegment;
  public winMotorcycle!: MotorcycleSegment;
  public state: string = "win";

  public constructor(x: number, y: number) {
    super(x, y);
  }

  public static build(obj: any): Intersection {
    const inter = new Intersection(obj["x"], obj["y"]);
    inter.lostMotorcycle = MotorcycleSegment.build(obj["lostMotorcycle"]);
    inter.winMotorcycle = MotorcycleSegment.build(obj["winMotorcycle"]);
    inter.state = obj["state"];
    return inter;
  }

  public equal(b: Intersection, epsilon: number = 0.0000000001): boolean {
    const fromParent = super.equal(<geom.IPoint>b, epsilon);
    return fromParent && Math.abs(this.time - b.time) < epsilon;
  }

  public static fromPoint(p: geom.IPoint): Intersection {
    return new Intersection(p.x, p.y);
  }
}
