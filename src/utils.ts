import type * as geom from "geometric";
import { MotorcycleGraph, MotorcycleGraphCached } from "./MotorcycleGraph";
import { Polygon } from "./Polygon";
import { Motorcycles } from "./Motorcycles";
import type { IntersectionCache } from "./MotorcycleGraph";
import type { MotorcycleSegment } from "./MotorcycleSegment";

export function calculateMotorcycles(points: geom.IPoint[], width: number, height: number) {
  const polygon = new Polygon(points);
  const motorcycles = new Motorcycles(polygon.polygon, width, height);

  return motorcycles.getMotorcycleSegments();
}

export function calculateMotorcycleGraph(motorcycles: MotorcycleSegment[]) {
  const motorcycleGraph = new MotorcycleGraph();
  motorcycleGraph.calculateMotorcycleGraph(motorcycles);
  return motorcycleGraph.getSegments();
}

export function calculateIntersectionCache(motorcycles: MotorcycleSegment[]): IntersectionCache {
  const motorcycleGraph = new MotorcycleGraph({isShortcut: false, buildCache: true});
  motorcycleGraph.motorcycleSegments = motorcycles;
  motorcycleGraph.calculateMotorcycleSegmentIntersections();
  return motorcycleGraph.intersectionCache;
}

export function calculateRandomList(
  motorcyclesCustomList: MotorcycleSegment[],
  intersectionCache: IntersectionCache,
): MotorcycleSegment[] {
  for (const motorcycle of motorcyclesCustomList) {
    motorcycle.resetReductionCounter();
  }

  const motorcycleGraph = new MotorcycleGraphCached({isShortcut: true, buildCache: false});
  motorcycleGraph.setIntersectionCache(intersectionCache);

  let localCustomList: MotorcycleSegment[] = [];

  for (const customEntry of motorcyclesCustomList) {
    localCustomList.push(customEntry);

    for (const motorcycle of localCustomList) {
      motorcycle.reset();
    }
    motorcycleGraph.calculateMotorcycleGraph(localCustomList);
  }

  return localCustomList;
}
