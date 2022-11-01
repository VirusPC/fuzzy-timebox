import { Layer, Interactor } from "../../interaction";
import { QueryInstrumentProps } from "../appendUIController";
import { AngularComponent, TimeboxComponent } from "../components";

export default function initializeResizeAngularInteractor(renderTargetLayer: Layer) {
  const interactor = new Interactor<QueryInstrumentProps>("start", [
    // angular brush
    {
      action: "modifystart",
      events: ["mousedown"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeQuerierIndex = instrument.getState("activeQuerierIndex")
        if(activeQuerierIndex <0 ) return false;
        const queriers = instrument.getState("queriers");
        const activeQuerier = queriers[activeQuerierIndex];
        const where = instrument.getState("where");
        return activeQuerier.type === "angular" && (where === "innerArc" || where === "hLineLeftRect" || where === "hLineRightRect" || where === "arcBottomArc" || where === "arcTopArc");
      },
      fromState: "start",
      toState: "running",
    },
    {
      action: "modifying",
      events: ["mousemove"],
      fromState: "running",
      toState: "running",
    },
    {
      action: "modifyend",
      events: ["mouseup"],
      fromState: "running",
      toState: "start",
    },
    {
      action: "modifywheel",
      events: ["wheel"],
      filter: (event: Event, props: QueryInstrumentProps) => {
        const { container, instrument } = props;
        const activeQuerierIndex = instrument.getState("activeQuerierIndex")
        if(activeQuerierIndex <0 ) return false;
        const queriers = instrument.getState("queriers");
        const activeQuerier = queriers[activeQuerierIndex];
        const where = instrument.getState("where");
        return activeQuerier.type === "angular" && (where === "innerArc");
      },
      fromState: "start",
      toState: "start"
    }
  ]);

  // let minMaxRect= { xMin: 0, xMax: 0, yMin: 0, yMax: 0};
  let offsetAngle = 0;
  let spanAngle = 0;
  let offsetX = 0;
  let fixedSide = 0;
  let fixedArc = 0;

  let activeQuerierIndex = -1;
  let activeQuerier: AngularComponent | null = null;
  let localWhere = "";
  let width = 0;

  interactor.addEventListener("modifystart", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("where")!;
    const queriers = instrument.getState("queriers");
    activeQuerierIndex = instrument.getState("activeQuerierIndex")
    activeQuerier = queriers[activeQuerierIndex] as AngularComponent;
    const {x1, x2, y, startAngle, endAngle} = activeQuerier.getLayoutConstraints()!;
    switch (localWhere) {
      case "innerArc":
      {
        offsetAngle = Math.atan2(event.offsetY - y, event.offsetX - x1) - startAngle;
        spanAngle = endAngle - startAngle;
        break;
      }
      case "hLineLeftRect": 
      {
        offsetX = event.offsetX - x1;
        fixedSide = x2;
        break;
      }
      case "hLineRightRect":
      {
        offsetX = event.offsetX - x2;
        fixedSide = x1;
        break;
      } 
      case "arcTopArc":
      {
        offsetAngle = Math.atan2(event.offsetY - y, event.offsetX - x1) - startAngle;
        fixedArc = endAngle;
        break;
      }
      case "arcBottomArc":
      {
        offsetAngle = Math.atan2(event.offsetY - y, event.offsetX - x1) - endAngle;
        fixedArc = startAngle;
        // console.log("startAngle",startAngle);
        // console.log("endAngle",endAngle);
        // console.log("*******")
        break;
      }
    }
  
  });
  interactor.addEventListener("modifying", (event, props) => {
    if (!(event instanceof MouseEvent)) return;
    const { container, instrument } = props;
    const queriers = instrument.getState("queriers");
    let {x1, x2, y, startAngle, endAngle} = activeQuerier!.getLayoutConstraints()!;
    // let where = instrument.getState("where")
    switch(localWhere) {
      case "innerArc":  
      {
        const currentAngle = Math.atan2(event.offsetY - y, event.offsetX - x1);
        // console.log("y", event.offsetY - y);
        // console.log("x", event.offsetX - x1);
        // console.log(currentAngle);
        // console.log("off", offsetAngle);
        const newStartAngle = currentAngle - offsetAngle;
        const newEndAngle = newStartAngle + spanAngle;
        // console.log("startAngle", newStartAngle);
        // console.log("endAngle", newEndAngle)
        if(newStartAngle > -Math.PI/2 && newEndAngle < Math.PI/2){
          activeQuerier!.setLayoutConstraints({startAngle: newStartAngle, endAngle: newEndAngle});
        }
        break;
      }
      case "hLineLeftRect": 
      {
        const newX = event.offsetX - offsetX; 
        if (newX > fixedSide) { x1 = fixedSide; x2 = newX; }
        else x1 = newX;
        if(newX > fixedSide) localWhere = "hLineRightRect";
        activeQuerier!.setLayoutConstraints({x1, x2, y, startAngle, endAngle});
        break;
      }
      case "hLineRightRect":
      {
        const newX = event.offsetX - offsetX; 
        if (newX < fixedSide) { x1 = newX; x2 = fixedSide; }
        else x2 = newX;
        if (newX < fixedSide) localWhere = "hLineLeftRect";
        activeQuerier!.setLayoutConstraints({x1, x2, y, startAngle, endAngle});
        break;
      }
      case "arcTopArc":
      {
        const currentAngle = Math.atan2(event.offsetY - y, event.offsetX - x1);
        const newStartAngle = currentAngle - offsetAngle;
        const newEndAngle = endAngle;
        if (newStartAngle > fixedArc) { endAngle = newStartAngle; startAngle = fixedArc; }
        else startAngle = newStartAngle;
        if (newStartAngle > fixedArc) {localWhere = "arcBottomArc"; fixedArc = endAngle;}
        console.log(startAngle, endAngle, fixedArc,'*********');
        if (startAngle > -Math.PI/2 && endAngle < Math.PI/2){
          activeQuerier!.setLayoutConstraints({startAngle, endAngle});
        }
        break;
      }
      case "arcBottomArc":
      {
        const currentAngle = Math.atan2(event.offsetY - y, event.offsetX - x1);
        const newEndAngle = currentAngle - offsetAngle;
        const newStartAngle = startAngle;
        if (newEndAngle < fixedArc) { startAngle = newEndAngle; endAngle = fixedArc; }
        else endAngle = newEndAngle;
        if (newEndAngle < fixedArc) {localWhere = "arcTopArc"; fixedArc = startAngle;}
        if (startAngle > -Math.PI/2 && endAngle < Math.PI/2){
          activeQuerier!.setLayoutConstraints({startAngle, endAngle});
        }
        break;
      }
    }
    renderTargetLayer.clear();
    queriers.forEach((query, i) => {i !== activeQuerierIndex && query.render()});
    if(localWhere === "innerArc" || localWhere === "hLineLeftRect" || localWhere === "hLineRightRect" || localWhere === "arcBottomArc" || localWhere === "arcTopArc") {
      activeQuerier!.render({highlights: [localWhere]});
    }
  })
  interactor.addEventListener("modifyend", (event, props) => {
    const { container, instrument } = props;
    // just set preview as result conponent
    const queriers = instrument.getState("queriers");
    renderTargetLayer.clear();
    queriers.forEach((query) => {query.render()});
  })

  interactor.addEventListener("modifywheel", (event, props) => {
    if (!(event instanceof WheelEvent)) return;
    const { container, instrument } = props;
    localWhere = instrument.getState("where")!;
    const queriers = instrument.getState("queriers");
    activeQuerierIndex = instrument.getState("activeQuerierIndex")
    activeQuerier = queriers[activeQuerierIndex] as AngularComponent;
    const {startAngle, endAngle} = activeQuerier.getLayoutConstraints()!;
    console.log(startAngle, endAngle)
        let newStartAngle = 180 / Math.PI * startAngle ;
        let newEndAngle = 180 / Math.PI * endAngle;
        const sign = Math.sign(event.deltaY);
        newStartAngle = Math.max(-90, newStartAngle - sign);
        newEndAngle = Math.min(90, newEndAngle + sign);
        newStartAngle = Math.PI / 180 * newStartAngle;
        newEndAngle = Math.PI / 180 * newEndAngle;
        activeQuerier!.setLayoutConstraints({startAngle: newStartAngle, endAngle: newEndAngle});

    renderTargetLayer.clear();
    queriers.forEach((query, i) => {i !== activeQuerierIndex && query.render()});
    if(localWhere === "innerArc") {
      activeQuerier!.render({highlights: [localWhere]});
    }
  })

  return interactor;
}