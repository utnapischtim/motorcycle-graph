import * as geom from "geometric";
import { MotorcycleSegment } from "./MotorcycleSegment";

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
    const motorcycle = new MotorcycleSegment(start, target, velocity, text);

    for (const segment of this.polygon) {
      if (!geom.sharePoint(motorcycle, segment)) {
        target = <geom.IPoint>geom.intersection(motorcycle, segment);

        if (target) {
          motorcycle.setTarget(target);
        }

      }
    }

    motorcycle.reference_target = motorcycle.t;
    motorcycle.doBackup();
    return motorcycle;
  }
}
