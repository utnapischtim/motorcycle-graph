import * as geom from "geometric";
import type { MotorcyclePoint } from "./MotorcyclePoint";

export class MotorcycleSegment extends geom.Segment {
  public intersections: MotorcyclePoint[] = [];
  public velocity: number = 0;
  public text: string = "";
  public isAlive: boolean = true;
  public backup: geom.IPoint[] = [];
  public reductionCounter: number = 0;
  public reference_target: geom.IPoint;
  public isUsed: boolean = false;
  public timeOfDeath: number = 0;
  public winTimes: any = {};

  public constructor(s: geom.IPoint, t: geom.IPoint, v: number = 0, text: string = "") {
    super(s, t);

    this.velocity = v;
    this.text = text;
    this.reference_target = t;

    this.doBackup();
  }

  public getText(): string {
    return `${this.text} (${this.reductionCounter})`;
  }

  public getNodeName(): string {
    return this.text;
  }

  public getReductionCounter(): number {
    return this.reductionCounter;
  }

  private doBackup(): void {
    this.backup.push(this.s.clone());
    this.backup.push(this.t.clone());
  }

  public reset(): void {
    this.s = this.backup[0].clone();
    this.t = this.backup[1].clone();
    this.isAlive = true;
  }

  public resetReductionCounter(): void {
    this.reductionCounter = 0;
    this.reference_target = this.backup[1].clone();
  }

  public setTarget(t: geom.IPoint, timeOfDeath: number = 0): void {
    if (geom.distance(this.s, t) < geom.distance(this.s, this.reference_target)) {
      this.reductionCounter += 1;
      this.reference_target = t;
    }

    if (timeOfDeath > 0) {
      this.timeOfDeath = timeOfDeath;
      this.isAlive = false;
    }

    this.t = t;
  }
}
