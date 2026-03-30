import { FaExternalLinkAlt, FaPlayCircle } from "react-icons/fa";

const getDriveFileId = (url = "") => {
  const matchByPath = String(url).match(/\/file\/d\/([^/]+)/i);
  if (matchByPath?.[1]) return matchByPath[1];

  const matchByQuery = String(url).match(/[?&]id=([^&]+)/i);
  if (matchByQuery?.[1]) return matchByQuery[1];

  return "";
};

const getEmbeddableUrl = (url = "") => {
  const driveId = getDriveFileId(url);
  if (driveId) return `https://drive.google.com/file/d/${driveId}/preview?rm=minimal`;

  return String(url).trim();
};

const isDirectVideoFile = (url = "") =>
  /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(url).trim());

const VideoPlaceholder = ({ hasVideo, videoUrl, title }) => {
  if (hasVideo) {
    const embedUrl = getEmbeddableUrl(videoUrl);
    const renderAsIframe = embedUrl.startsWith("https://drive.google.com/file/d/");

    return (
      <div className="rounded-xl border border-primary-purple/20 bg-primary-purple/5 p-4">
        <p className="text-sm text-slate-700 mb-3">
          Video listo para esta ayuda.
        </p>

        {renderAsIframe ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 h-52 sm:h-56">
            <iframe
              src={embedUrl}
              title={title}
              className="absolute inset-x-0 -top-8 w-full h-[calc(100%+64px)] border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        ) : isDirectVideoFile(embedUrl) ? (
          <video
            className="w-full rounded-xl border border-slate-200 bg-black"
            controls
            preload="metadata"
            src={embedUrl}
          >
            Tu navegador no soporta reproducción de video.
          </video>
        ) : null}

        <div className="mt-3">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-purple px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-blue transition-colors"
          >
            <FaPlayCircle size={12} />
            Abrir video
            <FaExternalLinkAlt size={10} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        <FaPlayCircle size={16} />
      </div>
      <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
      <p className="text-xs text-slate-500">
        Video no disponible todavía. Agrega un videoUrl cuando esté listo.
      </p>
    </div>
  );
};

export default VideoPlaceholder;
