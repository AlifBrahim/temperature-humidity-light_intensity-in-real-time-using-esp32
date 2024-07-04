import React from 'react';

const Insights = ({ data }) => {
    if (!data || data.length === 0) return null;

    const calculateInsights = (data) => {
        const total = data.length;
        const avgTemp = (data.reduce((sum, entry) => sum + entry.temperature, 0) / total).toFixed(2);
        const avgHumidity = (data.reduce((sum, entry) => sum + entry.humidity, 0) / total).toFixed(2);
        const avgLightIntensity = (data.reduce((sum, entry) => sum + entry.light_intensity, 0) / total).toFixed(2);

        const minTemp = Math.min(...data.map(entry => entry.temperature));
        const maxTemp = Math.max(...data.map(entry => entry.temperature));

        const minHumidity = Math.min(...data.map(entry => entry.humidity));
        const maxHumidity = Math.max(...data.map(entry => entry.humidity));

        const minLightIntensity = Math.min(...data.map(entry => entry.light_intensity));
        const maxLightIntensity = Math.max(...data.map(entry => entry.light_intensity));

        return {
            avgTemp,
            avgHumidity,
            avgLightIntensity,
            minTemp,
            maxTemp,
            minHumidity,
            maxHumidity,
            minLightIntensity,
            maxLightIntensity
        };
    };

    const insights = calculateInsights(data);

    return (
        <div className="p-4 bg-white shadow rounded-lg mb-5">
            <h2 className="text-2xl font-semibold mb-3">Insights</h2>
            <p className="text-lg"><strong>Average Temperature:</strong> {insights.avgTemp} °C</p>
            <p className="text-lg"><strong>Minimum Temperature:</strong> {insights.minTemp} °C</p>
            <p className="text-lg"><strong>Maximum Temperature:</strong> {insights.maxTemp} °C</p>
            <p className="text-lg"><strong>Average Humidity:</strong> {insights.avgHumidity} %</p>
            <p className="text-lg"><strong>Minimum Humidity:</strong> {insights.minHumidity} %</p>
            <p className="text-lg"><strong>Maximum Humidity:</strong> {insights.maxHumidity} %</p>
            <p className="text-lg"><strong>Average Light Intensity:</strong> {insights.avgLightIntensity}</p>
            <p className="text-lg"><strong>Minimum Light Intensity:</strong> {insights.minLightIntensity}</p>
            <p className="text-lg"><strong>Maximum Light Intensity:</strong> {insights.maxLightIntensity}</p>
        </div>
    );
};

export default Insights;
