const SkeletonCard = () => (
  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between animate-pulse h-32">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const SkeletonNoteCard = () => (
  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between animate-pulse h-32">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards}
    </div>
  );
};

export default SkeletonLoader;
