import { DicomSeries } from "../hooks/useStudyData";

interface SeriesPanelProps {
  series: DicomSeries[];
  onSeriesSelect: (series: DicomSeries) => void;
  currentSeriesUID: string | null;
}

const SeriesPanel = ({
  series,
  onSeriesSelect,
  currentSeriesUID,
}: SeriesPanelProps) => {
  return (
    <aside className="bg-slate-900/50 border-r border-white/10 w-72 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Series</h2>
      <ul className="space-y-2">
        {series.map((s) => {
          const seriesInstanceUID = s["0020000E"].Value[0];
          const seriesNumber = s["00200011"]?.Value[0] || "N/A";
          const modality = s["00080060"]?.Value[0] || "N/A";
          const seriesDescription = s["0008103E"]?.Value[0] || "No description";
          const instanceCount = s.instances.length;

          return (
            <li
              key={seriesInstanceUID}
              onDoubleClick={() => onSeriesSelect(s)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentSeriesUID === seriesInstanceUID
                  ? "bg-cyan-500/20 border border-cyan-500"
                  : "bg-white/5 border border-transparent hover:bg-white/10"
              }`}
            >
              <div className="font-bold text-white">
                Series {seriesNumber} ({modality})
              </div>
              <div className="text-sm text-cyan-200/70 mt-1">
                {seriesDescription}
              </div>
              <div className="text-xs text-cyan-200/50 mt-2">
                {instanceCount} instances
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default SeriesPanel;
