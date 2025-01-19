import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://127.0.0.1:5000', {
    transports: ['websocket'],
});

function RealtimeMonitor() {
    const [data, setData] = useState({
        cpu: [],
        memory: {},
        processes: [],
        disk: {},
    });

    useEffect(() => {
        console.log("Setting up WebSocket connection...");

        socket.on('connect', () => {
            console.log("Connected to WebSocket");
        });

        // Listen to the 'update' event to get real-time system data
        socket.on('update', (newData) => {
            console.log("Received data:", newData);

            // Using the callback form of setState to ensure we get the latest state
            setData(prevData => {
                // Force a complete update by copying the entire previous data object and merging with newData
                const updatedData = { ...prevData, ...newData };
                console.log("Updated state:", updatedData); // Check if the state is updating
                return updatedData; // Return the updated data
            });
        });

        // Interval for refreshing every second (or adjust interval as needed)
        const interval = setInterval(() => {
            socket.emit('request_update'); // Emit a request for updated data from the server
            console.log("Requesting update...");
        }, 1000);  // Refresh every 1000ms (1 second)

        // Cleanup the socket and interval when the component is unmounted
        return () => {
            socket.off('update');
            socket.off('connect');
            socket.off('disconnect');
            clearInterval(interval); // Clear the interval when the component unmounts
        };

    }, []);  // Empty dependency array means this effect runs once when the component is mounted

    // Render the data
    return (
        <div>
            <h1>Real-Time OS Monitor</h1>

            <div>
                <h2>CPU Usage</h2>
                {Array.isArray(data.cpu) && data.cpu.length > 0 ? (
                    data.cpu.map((usage, index) => (
                        <p key={index}>Core {index + 1}: {usage}%</p>
                    ))
                ) : (
                    <p>No CPU data available</p>
                )}
            </div>

            <div>
                <h2>Memory Usage</h2>
                {data.memory && Object.keys(data.memory).length > 0 ? (
                    <>
                        <p>Used: {data.memory.used} bytes</p>
                        <p>Available: {data.memory.available} bytes</p>
                        <p>Percent: {data.memory.percent}%</p>
                    </>
                ) : (
                    <p>No memory data available</p>
                )}
            </div>

            <div>
                <h2>Processes</h2>
                {Array.isArray(data.processes) && data.processes.length > 0 ? (
                    <ul>
                        {data.processes.map((proc) => (
                            <li key={proc.pid}>
                                {proc.name} (PID: {proc.pid}, CPU: {proc.cpu_percent}%, Memory: {proc.memory_percent}%)
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No process data available</p>
                )}
            </div>

            <div>
                <h2>Disk Usage</h2>
                {data.disk && Object.keys(data.disk).length > 0 ? (
                    <>
                        <p>Used: {data.disk.used} bytes</p>
                        <p>Free: {data.disk.free} bytes</p>
                        <p>Percent: {data.disk.percent}%</p>
                        <p>Read Count: {data.disk.read_count}</p>
                        <p>Write Count: {data.disk.write_count}</p>
                    </>
                ) : (
                    <p>No disk data available</p>
                )}
            </div>
        </div>
    );
}

export default RealtimeMonitor;
