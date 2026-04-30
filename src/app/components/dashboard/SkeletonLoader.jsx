const SkeletonCard = () => (
    <div className="flex items-center justify-between p-3.5 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-transparent animate-pulse">
        <div className="flex items-center min-w-0 gap-3 w-full">
            <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-9 h-9"></div>
            <div className="min-w-0 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1.5"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
        </div>
        <div className="w-4 h-4 rounded-md bg-gray-200 dark:bg-gray-700"></div>
    </div>
);

const SkeletonNoteCard = () => (
    <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse flex flex-col h-[160px]">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-2"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
        <div className="mt-auto flex items-center justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
    </div>
);

const SkeletonLoader = ({ type, count }) => {
  const cards = Array.from({ length: count || 3 }).map((_, index) => {
    if (type === "folder") {
      return <SkeletonCard key={index} />;
    } else {
      return <SkeletonNoteCard key={index} />;
    }
  });

  return <>{cards}</>;
};

export default SkeletonLoader;
