import { FaArrowLeft } from "react-icons/fa";
import VideoPlaceholder from "./VideoPlaceholder";

const HelpDetailView = ({ item, onBack }) => (
  <div className="space-y-4">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-purple/30"
    >
      <FaArrowLeft size={10} />
      Volver
    </button>

    <div>
      <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
    </div>

    <VideoPlaceholder
      hasVideo={item.hasVideo}
      videoUrl={item.videoUrl}
      title={item.title}
    />

    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">Pasos rápidos</h4>
      <ol className="space-y-1 text-sm text-slate-600 list-decimal list-inside">
        {item.steps.map((step, index) => (
          <li key={`${item.actionId}-step-${index}`}>{step}</li>
        ))}
      </ol>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">Tips</h4>
      <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside">
        {item.tips.map((tip, index) => (
          <li key={`${item.actionId}-tip-${index}`}>{tip}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default HelpDetailView;
