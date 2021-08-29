import type * as geom from "geometric";
import { Polygon, Motorcycles, MotorcycleGraph } from "./MotorcycleGraph";
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

// function customizedRun() {
//   let localCustomList = [];

//   for (const motorcycle of motorcycles) {
//     motorcycle.reset();
//     motorcycle.resetReductionCounter();
//   }

//   for (const customEntry of motorcyclesCustomList) {
//     for (const motorcycle of motorcycles) {
//       motorcycle.reset();
//     }

//     customEntry.isUsed = true;
//     localCustomList.push(customEntry);
//     middleLayerDrawMotorcycleGraph(localCustomList, $polygonActive);
//     drawMotorcycles(motorcycles);
//   }

//   return localCustomList;
// }
