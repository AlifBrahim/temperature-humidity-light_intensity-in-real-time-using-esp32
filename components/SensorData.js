import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import 'tailwindcss/tailwind.css';
import Insights from './Insights';

const SensorData = () => {
    const [data, setData] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const svgRef = useRef();
    const [lightIntensity, setLightIntensity] = useState(0);

    useEffect(() => {
        // Initial fetch
        fetch('/api/fetchData')
            .then(response => response.json())
            .then(initialData => {
                setData(initialData);
                setLightIntensity(initialData[0].light_intensity / 4095);
            });

        // EventSource for real-time updates
        const eventSource = new EventSource('/api/realtime');
        eventSource.onmessage = event => {
            const newData = JSON.parse(event.data);
            setData(prevData => [newData, ...prevData]);
            setLightIntensity(newData.light_intensity / 4095);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetch('/api/fetchData')
                .then(response => response.json())
                .then(newData => {
                    setData(newData);
                    setLightIntensity(newData[0].light_intensity / 4095);
                });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (!data.length) return;

        // Filter data for today
        const todayData = data.filter(entry => new Date(entry.timestamp).toDateString() === new Date().toDateString());

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 800;
        const height = 400;
        const margin = { top: 20, right: 50, bottom: 70, left: 60 };

        const x = d3.scaleTime()
            .domain(d3.extent(todayData, d => new Date(d.timestamp)))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(todayData, d => Math.max(d.temperature, d.humidity))])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(new Date(d.timestamp)));

        const lines = [
            { value: 'temperature', color: 'red' },
            { value: 'humidity', color: 'blue' },
        ];

        lines.forEach(lineData => {
            svg.append('path')
                .datum(todayData)
                .attr('fill', 'none')
                .attr('stroke', lineData.color)
                .attr('stroke-width', 2)
                .attr('d', line.y(d => y(d[lineData.value])));

            svg.append('text')
                .attr('x', width - margin.right)
                .attr('y', y(d3.max(todayData, d => d[lineData.value])))
                .attr('text-anchor', 'end')
                .attr('font-size', '12px')
                .attr('fill', lineData.color)
                .text(lineData.value.charAt(0).toUpperCase() + lineData.value.slice(1));
        });

        svg.append('g')
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M:%S')))
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append('g')
            .call(d3.axisLeft(y))
            .attr('transform', `translate(${margin.left}, 0)`);

        svg.append('path')
            .datum(todayData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('d', line);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('fill', 'black')
            .text('Time');

        svg.append('text')
            .attr('x', -(height / 2))
            .attr('y', 20)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('fill', 'black')
            .text('Temperature (°C) + Humidity');

    }, [data, currentTime]);

    const formatTimestamp = (timestamp) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Kuala_Lumpur',
        };
        return new Intl.DateTimeFormat('en-GB', options).format(new Date(timestamp));
    };

    return (
        <div className="p-5">
            <h1 className="text-3xl font-semibold mb-5">Real-Time Sensor Data</h1>
            <div className="flex justify-start items-start mb-5 space-x-20">
                <svg ref={svgRef} width={600} height={400}></svg>
                <div align='center'>
                    <h2 className="text-2xl font-semibold mb-2">Light Intensity</h2>
                    <div className="bg-black rounded"
                         style={{
                             width: 7,
                             height: 70,
                             bottom: 0
                         }}></div>
                    <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center">
                        <div className="bg-yellow-500 rounded-full"
                             style={{
                                 width: 500,
                                 height: 100,
                                 opacity: `${Math.min(lightIntensity * 4, 1)}` // Scaling factor of 4, capped at 1
                             }}></div>
                    </div>
                    <br/>
                    <h1 className="text-2xl font-semibold">Brightness: {Math.floor(lightIntensity*4096)}</h1>
                </div>
            </div>
            <Insights data={data} /> {/* Add Insights component */}
            <div className="overflow-auto mt-5">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-lg leading-normal">
                        <th className="py-3 px-6 text-left">Timestamp</th>
                        <th className="py-3 px-6 text-left">Temperature</th>
                        <th className="py-3 px-6 text-left">Humidity</th>
                        <th className="py-3 px-6 text-left">Light Intensity</th>
                    </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-medium">
                    {data.map((entry, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                            <td className="py-3 px-6 text-left whitespace-nowrap">{formatTimestamp(entry.timestamp)}</td>
                            <td className="py-3 px-6 text-left">{entry.temperature}</td>
                            <td className="py-3 px-6 text-left">{entry.humidity}</td>
                            <td className="py-3 px-6 text-left">{entry.light_intensity}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SensorData;
