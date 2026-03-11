import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiFilter, FiRefreshCw, FiDownload, FiAlertCircle, FiCheckCircle, FiClock, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import HeaderComponent from '../../components/HeaderComponent';

const AdminComplaints_Page = () => {
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshCount, setRefreshCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [iframeKey, setIframeKey] = useState(0);

    // Mock data for statistics
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        inProgress: 0
    });

    // Refresh iframe function
    const handleRefresh = () => {
        setRefreshCount(prev => prev + 1);
        setIframeKey(prev => prev + 1);
        setLoading(true);

        // Simulate loading
        setTimeout(() => {
            setLoading(false);
        }, 1500);
    };

    // Filter options
    const filters = [
        { value: 'All', label: 'All Complaints', color: 'bg-gray-100 text-gray-800' },
        { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'Resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
        { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
        { value: 'Urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
    ];

    // Export function
    const handleExport = () => {
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRi7Gv4sPMG5bVYyal3Wtku0i1nDnFWx5bMJVxKUOQhRhL_-AAvxAEmWI-ueduk0CvwIWg6WlF2SpiZ/pub?output=csv';
        window.open(sheetUrl, '_blank');
    };

    // Format date for last refresh
    const formatLastRefresh = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Mock stats data - In real app, you would fetch this from your API
    useEffect(() => {
        // Simulate fetching stats
        setStats({
            total: 156,
            pending: 24,
            resolved: 125,
            inProgress: 7
        });
    }, [refreshCount]);

    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderComponent
                heading={"Complaints Management"}
                subHeading={"Monitor and manage user complaints from Google Sheet"}
                role='admin'
            />

            <div className="container max-w-full mx-auto p-4 lg:p-6">
                {/* Google Sheet Embed Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Live Complaints Sheet</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Direct integration with Google Sheets • Auto-refreshes every 30 seconds
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-600">Live Connected</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="p-8 lg:p-12 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-lg font-medium text-gray-700">Refreshing complaints data...</p>
                            <p className="text-sm text-gray-500 mt-2">Loading latest updates from Google Sheets</p>
                        </div>
                    ) : (
                        <div className="p-0">
                            {/* Info Banner */}
                            <div className="bg-blue-50 border-b border-blue-200 px-4 lg:px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <FiAlertCircle className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm text-blue-700">
                                            This is a live view of your Google Sheet. Scroll to see all complaints.
                                        </p>
                                    </div>
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        Last updated: {formatLastRefresh()}
                                    </span>
                                </div>
                            </div>

                            {/* Google Sheet Iframe */}
                            <div className="relative w-full overflow-hidden bg-gray-100">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500"></div>

                                <div key={iframeKey} className="iframe-container">
                                    <iframe
                                        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRi7Gv4sPMG5bVYyal3Wtku0i1nDnFWx5bMJVxKUOQhRhL_-AAvxAEmWI-ueduk0CvwIWg6WlF2SpiZ/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false"
                                        title="Complaints Google Sheet"
                                        className="w-full h-[600px] lg:h-[700px] border-0"
                                        loading="lazy"
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-4 bg-linear-to-t from-white to-transparent"></div>
                            </div>

                            {/* Instructions */}
                            <div className="px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-bold">1</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">View Complaints</p>
                                            <p className="text-xs text-gray-600 mt-1">Scroll through the sheet to view all complaints</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-bold">2</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Update Status</p>
                                            <p className="text-xs text-gray-600 mt-1">Edit directly in Google Sheets to update complaint status</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-bold">3</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Refresh Data</p>
                                            <p className="text-xs text-gray-600 mt-1">Click refresh button to sync latest changes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Styles for iframe */}
            <style jsx>{`
        .iframe-container {
          position: relative;
          width: 100%;
          height: 600px;
        }
        
        @media (min-width: 1024px) {
          .iframe-container {
            height: 700px;
          }
        }
        
        .iframe-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
        </div>
    );
};

export default AdminComplaints_Page;