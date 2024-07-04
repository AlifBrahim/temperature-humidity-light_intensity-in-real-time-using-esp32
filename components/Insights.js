import React, { useState, useEffect } from 'react';

const Insights = ({ data }) => {
    const [timeFrame, setTimeFrame] = useState('all');
    const [selectedDate, setSelectedDate] = useState(null);
    const [avgHumidityLast30Minutes, setAvgHumidityLast30Minutes] = useState(null);

    useEffect(() => {
        async function fetchAvgHumidityLast30Minutes() {
            try {
                const response = await fetch('/api/averageHumidity');
                const result = await response.json();
                setAvgHumidityLast30Minutes(result.avgHumidity);
            } catch (error) {
                console.error('Error fetching last 30 minutes humidity data:', error);
            }
        }

        fetchAvgHumidityLast30Minutes();
    }, []);

    if (!data || data.length === 0) return null;

    const filterDataByTimeFrame = (data, timeFrame, selectedDate) => {
        const now = new Date();
        let filteredData = [];

        switch (timeFrame) {
            case 'today':
                filteredData = data.filter(entry => new Date(entry.timestamp).toDateString() === now.toDateString());
                break;
            case 'last7days':
                filteredData = data.filter(entry => new Date(entry.timestamp) >= new Date(now.setDate(now.getDate() - 7)));
                break;
            case 'last30days':
                filteredData = data.filter(entry => new Date(entry.timestamp) >= new Date(now.setDate(now.getDate() - 30)));
                break;
            case 'date':
                filteredData = data.filter(entry => new Date(entry.timestamp).toDateString() === new Date(selectedDate).toDateString());
                break;
            default:
                filteredData = data;
        }

        return filteredData;
    };

    const calculateInsights = (filteredData) => {
        if (filteredData.length === 0) return {};

        const total = filteredData.length;
        const avgTemp = (filteredData.reduce((sum, entry) => sum + entry.temperature, 0) / total).toFixed(2);
        const avgHumidity = (filteredData.reduce((sum, entry) => sum + entry.humidity, 0) / total).toFixed(2);
        const avgLightIntensity = (filteredData.reduce((sum, entry) => sum + entry.light_intensity, 0) / total).toFixed(2);

        const minTemp = Math.min(...filteredData.map(entry => entry.temperature));
        const maxTemp = Math.max(...filteredData.map(entry => entry.temperature));

        const minHumidity = Math.min(...filteredData.map(entry => entry.humidity));
        const maxHumidity = Math.max(...filteredData.map(entry => entry.humidity));

        const minLightIntensity = Math.min(...filteredData.map(entry => entry.light_intensity));
        const maxLightIntensity = Math.max(...filteredData.map(entry => entry.light_intensity));

        const tempStdDev = Math.sqrt(filteredData.reduce((sum, entry) => sum + Math.pow(entry.temperature - avgTemp, 2), 0) / total).toFixed(2);
        const humidityStdDev = Math.sqrt(filteredData.reduce((sum, entry) => sum + Math.pow(entry.humidity - avgHumidity, 2), 0) / total).toFixed(2);
        const lightIntensityStdDev = Math.sqrt(filteredData.reduce((sum, entry) => sum + Math.pow(entry.light_intensity - avgLightIntensity, 2), 0) / total).toFixed(2);

        const maxTempTime = filteredData.find(entry => entry.temperature === maxTemp)?.timestamp || '';
        const minTempTime = filteredData.find(entry => entry.temperature === minTemp)?.timestamp || '';
        const maxHumidityTime = filteredData.find(entry => entry.humidity === maxHumidity)?.timestamp || '';
        const minHumidityTime = filteredData.find(entry => entry.humidity === minHumidity)?.timestamp || '';
        const maxLightIntensityTime = filteredData.find(entry => entry.light_intensity === maxLightIntensity)?.timestamp || '';
        const minLightIntensityTime = filteredData.find(entry => entry.light_intensity === minLightIntensity)?.timestamp || '';

        return {
            avgTemp,
            avgHumidity,
            avgLightIntensity,
            minTemp,
            maxTemp,
            minHumidity,
            maxHumidity,
            minLightIntensity,
            maxLightIntensity,
            tempStdDev,
            humidityStdDev,
            lightIntensityStdDev,
            maxTempTime,
            minTempTime,
            maxHumidityTime,
            minHumidityTime,
            maxLightIntensityTime,
            minLightIntensityTime
        };
    };

    const filteredData = filterDataByTimeFrame(data, timeFrame, selectedDate);
    const insights = calculateInsights(filteredData);

    return (
        <div className="p-4 bg-white shadow rounded-lg mb-5">
            <h2 className="text-2xl font-semibold mb-3">Insights</h2>
            <div className="mb-3">
                <label className="mr-2">Select Time Frame:</label>
                <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)} className="border rounded p-1">
                    <option value="all">All Data</option>
                    <option value="today">Today</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="date">Select Date</option>
                </select>
                {timeFrame === 'date' && (
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded p-1 ml-2"
                    />
                )}
            </div>
            {insights.avgTemp && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded bg-blue-300 relative">
                        <p className="text-lg"><strong>Average Temperature:</strong> {insights.avgTemp} °C</p>
                    </div>
                    <div className="p-3 border rounded bg-blue-300 relative">
                        <p className="text-lg"><strong>Minimum Temperature:</strong> {insights.minTemp} °C (at {new Date(insights.minTempTime).toLocaleString()})</p>
                    </div>
                    <div className="p-3 border rounded bg-blue-300 relative">
                        <p className="text-lg"><strong>Maximum Temperature:</strong> {insights.maxTemp} °C (at {new Date(insights.maxTempTime).toLocaleString()})</p>
                    </div>
                    <div className="p-3 border rounded bg-yellow-100 relative">
                        <p className="text-lg"><strong>Average Humidity:</strong> {insights.avgHumidity} %</p>
                    </div>
                    <div className="p-3 border rounded bg-yellow-100 relative">
                        <p className="text-lg"><strong>Average Humidity Last 30 Minutes:</strong> {avgHumidityLast30Minutes !== null ? `${avgHumidityLast30Minutes} %` : 'Loading...'}</p>
                    </div>
                    <div className="p-3 border rounded bg-yellow-100 relative">
                        <p className="text-lg"><strong>Minimum Humidity:</strong> {insights.minHumidity} % (at {new Date(insights.minHumidityTime).toLocaleString()})</p>
                    </div>
                    <div className="p-3 border rounded bg-yellow-100 relative">
                        <p className="text-lg"><strong>Maximum Humidity:</strong> {insights.maxHumidity} % (at {new Date(insights.maxHumidityTime).toLocaleString()})</p>
                    </div>
                    <div className="p-3 border rounded bg-orange-300 relative">
                        <p className="text-lg"><strong>Average Light Intensity:</strong> {insights.avgLightIntensity}</p>
                    </div>
                    <div className="p-3 border rounded bg-orange-300 relative">
                        <p className="text-lg"><strong>Minimum Light Intensity:</strong> {insights.minLightIntensity} (at {new Date(insights.minLightIntensityTime).toLocaleString()})</p>
                    </div>
                    <div className="p-3 border rounded bg-orange-300 relative">
                        <p className="text-lg"><strong>Maximum Light Intensity:</strong> {insights.maxLightIntensity} (at {new Date(insights.maxLightIntensityTime).toLocaleString()})</p>
                    </div>
                    <div className="p-3 border rounded bg-red-300 relative">
                        <p className="text-lg"><strong>Temperature Standard Deviation:</strong> {insights.tempStdDev} °C</p>
                        <span className="absolute top-0 right-0 mt-2 mr-2 text-xs bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center cursor-pointer" title="Standard deviation is a measure of the amount of variation or dispersion of a set of values.">i</span>
                    </div>
                    <div className="p-3 border rounded bg-red-300 relative">
                        <p className="text-lg"><strong>Humidity Standard Deviation:</strong> {insights.humidityStdDev} %</p>
                        <span className="absolute top-0 right-0 mt-2 mr-2 text-xs bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center cursor-pointer" title="Standard deviation is a measure of the amount of variation or dispersion of a set of values.">i</span>
                    </div>
                    <div className="p-3 border rounded bg-red-300  relative">
                        <p className="text-lg"><strong>Light Intensity Standard Deviation:</strong> {insights.lightIntensityStdDev}</p>
                        <span className="absolute top-0 right-0 mt-2 mr-2 text-xs bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center cursor-pointer" title="Standard deviation is a measure of the amount of variation or dispersion of a set of values.">i</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Insights;
