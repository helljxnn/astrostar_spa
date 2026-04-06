import { useEffect, useMemo, useState } from "react";
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

const getDriveStreamUrl = (fileId = "") =>
  `https://drive.google.com/uc?export=download&id=${fileId}`;

const isDirectVideoFile = (url = "") =>
  /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(url).trim());

const buildPreviewConfig = (url = "") => {
  const cleanUrl = String(url).trim();
  if (!cleanUrl) {
    return {
      type: "none",
      openUrl: "",
    };
  }

  const driveId = getDriveFileId(cleanUrl);
  if (driveId) {
    return {
      type: "drive",
      openUrl: cleanUrl,
      embedUrl: getEmbeddableUrl(cleanUrl),
      streamUrl: getDriveStreamUrl(driveId),
    };
  }

  if (isDirectVideoFile(cleanUrl)) {
    return {
      type: "video",
      openUrl: cleanUrl,
      streamUrl: cleanUrl,
    };
  }

  return {
    type: "iframe",
    openUrl: cleanUrl,
    embedUrl: cleanUrl,
  };
};

const VideoPlaceholder = ({ hasVideo, videoUrl, title }) => {
  const previewConfig = useMemo(() => buildPreviewConfig(videoUrl), [videoUrl]);
  const [useFallbackPreview, setUseFallbackPreview] = useState(false);

  useEffect(() => {
    setUseFallbackPreview(false);
  }, [previewConfig.openUrl]);

  if (hasVideo) {
    return (
      <div className="rounded-xl border border-primary-purple/20 bg-primary-purple/5 p-4">
        <p className="text-sm text-slate-700 mb-3">
          Video listo para esta ayuda.
        </p>

        {(previewConfig.type === "drive" || previewConfig.type === "video") &&
        !useFallbackPreview ? (
          <video
            className="w-full rounded-xl border border-slate-200 bg-black"
            controls
            preload="metadata"
            src={previewConfig.streamUrl}
            onError={() => setUseFallbackPreview(true)}
          >
            Tu navegador no soporta reproducción de video.
          </video>
        ) : previewConfig.type === "iframe" ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 h-52 sm:h-56">
            <iframe
              src={previewConfig.embedUrl}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            La vista previa no está disponible en este navegador. Usa el botón
            para abrir el video.
          </div>
        )}

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
