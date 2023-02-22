
type CommonLayerInfo = {
  id: string;
  name: string,
  opacity: number,
  // strokeStyleScale: (id: number) => string,
  lineCount?: number,
  diverse?: number,
}

export type DensityLayerInfo = {
  type: "density",
  id: "raw_density" | "selected_density",
  colormap: Colormap,
  colorScale: (weight) => [number, number, number]
} & CommonLayerInfo;

export type LineLayerInfo = {
  type: "line",
  id: "raw_line" | "selected_line" | "rep_line",
} & CommonLayerInfo;

export type LayerInfo = DensityLayerInfo | LineLayerInfo;