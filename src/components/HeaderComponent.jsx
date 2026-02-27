import React, { useState, useEffect } from 'react'

const HeaderComponent = ({ heading, subHeading, role = "superAdmin" }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Set up interval to update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Clean up interval on component unmount
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div>
            {/* Enhanced Clean Header with Real-time Timestamp */}
            <header className="bg-white border-b border-gray-200">
                <div className={`px-6 ${role == "superAdmin" ? 'py-[15px]' : 'py-[11px]'} flex items-center justify-between`}>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                            {heading}
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {subHeading}
                        </p>
                    </div>
                    <div className="text-right hidden md:block lg:block">
                        <div className="text-sm font-medium text-gray-700">
                            {currentTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                            })}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {currentTime.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}

export default HeaderComponent