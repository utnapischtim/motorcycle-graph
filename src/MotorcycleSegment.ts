import * as geom from "geometric";

export type ReductionCounterInformation = {
  reductionCounter: number;
  text: string;
  position: { x: number; y: number };
};

export class MotorcycleSegment extends geom.Segment {
  public velocity: number = 0;
  public text: string = "";
  public nodeNumber: number = 0;
  public isAlive: boolean = true;
  public backup: geom.IPoint[] = [];
  public reductionCounter: number = 1;
  public reference_target: geom.IPoint;
  public isUsed: boolean = false;
  public timeOfDeath: number = 0;
  public winTimes: any = {};

  public constructor(s: geom.IPoint, t: geom.IPoint, v: number = 0, text: string = "") {
    super(s, t);

    this.velocity = v;
    this.text = text;
    this.nodeNumber = parseInt(text);
    this.reference_target = t;

    this.doBackup();
  }

  public static build(obj: any): MotorcycleSegment {
    const s = new geom.Point(obj.s.x, obj.s.y);
    const t = new geom.Point(obj.t.x, obj.t.y);
    return new this(s, t, obj.velocity, obj.text);
  }

  public getReductionCounterInformation(): ReductionCounterInformation {
    return {
      reductionCounter: this.reductionCounter,
      text: this.text,
      position: {
        x: this.s.x,
        y: this.s.y,
      },
    };
  }

  public getText(): string {
    return `${this.text} (${this.reductionCounter})`;
  }

  public getNodeName(): string {
    return this.text;
  }

  public getNodeNumber(): number {
    return this.nodeNumber;
  }

  public updateReductionCounter(): void {
    if (this.reference_target.notEqual(this.t)) {
      this.reductionCounter += 1;
    }
  }

  public getReductionCounter(): number {
    return this.reductionCounter;
  }

  public doBackup(): void {
    this.backup = [];
    this.backup.push(this.s.clone());
    this.backup.push(this.t.clone());
  }

  public reset(): void {
    this.reference_target = this.t.clone();
    this.s = this.backup[0].clone();
    this.t = this.backup[1].clone();
    this.isAlive = true;
  }

  public resetReductionCounter(): void {
    this.reductionCounter = 1;
  }

  public setTarget(t: geom.IPoint, timeOfDeath: number = 0): void {
    if (timeOfDeath > 0) {
      this.timeOfDeath = timeOfDeath;
      this.isAlive = false;
    }

    this.t = t;
  }
}
