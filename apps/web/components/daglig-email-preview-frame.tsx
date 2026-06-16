"use client";

import { useCallback, useEffect, useRef } from "react";

type DagligEmailPreviewFrameProps = {
  previewHtml: string;
};

const injectPreviewStyles = (html: string): string => {
  const styles =
    "<style>html,body{margin:0;padding:0;overflow:hidden;height:auto !important;}</style>";

  if (html.includes("</head>")) {
    return html.replace("</head>", `${styles}</head>`);
  }

  return `${styles}${html}`;
};

const measureIframeHeight = (iframe: HTMLIFrameElement): number => {
  const doc = iframe.contentDocument;

  if (!doc?.body) {
    return 0;
  }

  const { body, documentElement } = doc;

  return Math.ceil(
    Math.max(
      body.scrollHeight,
      body.offsetHeight,
      documentElement.scrollHeight,
      documentElement.offsetHeight,
      body.getBoundingClientRect().height,
    ),
  );
};

export const DagligEmailPreviewFrame = ({
  previewHtml,
}: DagligEmailPreviewFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const previewDocument = injectPreviewStyles(previewHtml);

  const resizeIframe = useCallback((): void => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return;
    }

    const height = measureIframeHeight(iframe);

    if (height > 0) {
      iframe.style.height = `${height}px`;
    }
  }, []);

  const scheduleResize = useCallback((): void => {
    resizeIframe();
    requestAnimationFrame(resizeIframe);
    window.setTimeout(resizeIframe, 0);
    window.setTimeout(resizeIframe, 100);
    window.setTimeout(resizeIframe, 300);
  }, [resizeIframe]);

  const handleLoad = useCallback((): void => {
    observerRef.current?.disconnect();

    scheduleResize();

    const doc = iframeRef.current?.contentDocument;

    if (!doc?.body) {
      return;
    }

    const observer = new ResizeObserver(() => {
      resizeIframe();
    });

    observer.observe(doc.body);
    observer.observe(doc.documentElement);
    observerRef.current = observer;
  }, [resizeIframe, scheduleResize]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    scheduleResize();
  }, [previewDocument, scheduleResize]);

  return (
    <iframe
      ref={iframeRef}
      className="block w-full overflow-hidden border-0 bg-[#f4f4f5]"
      onLoad={handleLoad}
      sandbox="allow-same-origin"
      scrolling="no"
      srcDoc={previewDocument}
      title="Daglig e-mail preview"
    />
  );
};
