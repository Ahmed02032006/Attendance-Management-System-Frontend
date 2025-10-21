{/* Loading Overlay */}
{isLoading && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
        <Loader className="w-6 h-6 animate-spin mr-3 text-sky-500" />
        <span>Loading complaints...</span>
      </div>
    </div>
  )}