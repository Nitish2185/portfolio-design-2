function Bracket({ className }) {
  return (
    <div
      className={`h-[calc(var(--s)*20)] w-[calc(var(--s)*20)] border-dark2 absolute ${className}`}
    />
  );
}

// Markup only — the loading percentage and the intro/outro timelines are
// driven by webgl/AssetLoader.js once the scene starts loading.
export default function Preloader() {
  return (
    <div className="fixed top-0 left-0 z-[99] w-full h-[100dvh]" id="preloader">
      <div className="w-full h-full bg-dark1 p-[calc(var(--s)*20)] relative flex justify-center items-center text-sm lg:text-xsm text-dark2">
        <p data-preloader-count="" className="opacity-0">
          0%
        </p>
        <div
          data-preloader-center=""
          className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] aspect-square"
          style={{ height: 0 }}
        >
          <Bracket className="border-l border-t top-0 left-0" />
          <Bracket className="border-l border-b bottom-0 left-0" />
          <Bracket className="border-t border-r top-0 right-0" />
          <Bracket className="border-b border-r bottom-0 right-0" />
        </div>
      </div>
    </div>
  );
}
