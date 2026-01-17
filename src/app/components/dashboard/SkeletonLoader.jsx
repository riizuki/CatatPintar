const SkeletonCard = () => (
    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-lg mr-4"></div>
                <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
        </div>
    </div>
);

const SkeletonNoteCard = () => (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-start">
            <div className="w-8 h-8 bg-gray-200 rounded-lg mr-4 mt-1"></div>
            <div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
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
