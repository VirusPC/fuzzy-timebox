export {};
// import { Layer, Interactor } from "../../interaction_backup";
// import { QueryInstrumentProps } from "../appendUIController";
// import { AngularComponent, TimeboxComponent } from "../components";

// export default function initializePanAngularInteractor(renderTargetLayer: Layer) {
//   const interactor = new Interactor<QueryInstrumentProps>("start", [
//     // angular brush
//     {
//       action: "modifystart",  // resize
//       events: ["mousedown"],  // wheel
//       filter: (event: Event, props: QueryInstrumentProps) => {
//         console.log("pan angular");
//         const { container, instrument } = props;
//         const activeQuerierIndex = instrument.getState("activeQuerierIndex")
//         if(activeQuerierIndex <0 ) return false;
//         const queriers = instrument.getState("queriers");
//         const activeQuerier = queriers[activeQuerierIndex];
//         const where = instrument.getState("where");
//         return activeQuerier.type === "angular" && (where === "handle" || where === "outerArc");
//       },
//       fromState: "start",  // start
//       toState: "running",  // start
//     },
//     {
//       action: "modifying",
//       events: ["mousemove"],
//       fromState: "running",
//       toState: "running",
//     },
//     {
//       action: "modifyend",
//       events: ["mouseup"],
//       fromState: "running",
//       toState: "start",
//     },

//   ]);

//   // let minMaxRect= { xMin: 0, xMax: 0, yMin: 0, yMax: 0};
//   let offsetX = 0;
//   let offsetY = 0;
//   let fixedSide = 0;
  
//   let activeQuerierIndex = -1;
//   let activeQuerier: AngularComponent | null = null;
//   let localWhere = "";
//   let width = 0;
//   interactor.addEventListener("modifystart", (event, props) => {
//     console.log("start");
//     if (!(event instanceof MouseEvent)) return;
//     const { container, instrument } = props;
//     localWhere = instrument.getState("where")!;
//     const queriers = instrument.getState("queriers");
//     activeQuerierIndex = instrument.getState("activeQuerierIndex")
//     activeQuerier = queriers[activeQuerierIndex] as AngularComponent;
//     const {x1, x2, y} = activeQuerier.getLayoutConstraints()!;
//     offsetX = event.offsetX - x1; 
//     offsetY = event.offsetY - y; 
//     width = x2 - x1;
//   });
//   interactor.addEventListener("modifying", (event, props) => {
//     console.log("pan modifying");
//     if (!(event instanceof MouseEvent)) return;
//     const { container, instrument } = props;
//     const queriers = instrument.getState("queriers");
//     let {x1, x2, y} = activeQuerier!.getLayoutConstraints()!;
//     // let where = instrument.getState("where")
//     x1 = event.offsetX - offsetX;
//     x2 = x1 + width;
//     y = event.offsetY - offsetY; 
//     activeQuerier!.setLayoutConstraints({x1, x2, y});
//     renderTargetLayer.clear();
//     queriers.forEach((query, i) => {i !== activeQuerierIndex && query.render()});
//     if(localWhere === "outerArc" || localWhere === "handle") {
//       activeQuerier!.render({highlights: ["hLine", "outerArc"]});
//     }
//   })
//   interactor.addEventListener("modifyend", (event, props) => {
//     console.log("pan end");
//     const { container, instrument } = props;
//     // just set preview as result conponent
//     const queriers = instrument.getState("queriers");
//     renderTargetLayer.clear();
//     queriers.forEach((query) => {query.render()});
//   })

//   return interactor;
// }