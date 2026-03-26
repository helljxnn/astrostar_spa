import { FaQuestionCircle } from "react-icons/fa";

const EmptyHelpState = ({ message }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
      <FaQuestionCircle size={16} />
    </div>
    <p className="text-sm font-medium text-slate-700">{message}</p>
  </div>
);

export default EmptyHelpState;
