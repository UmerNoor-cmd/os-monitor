import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './RealtimeMonitor.css'; // Import CSS for the speedometer

const socket = io('http://127.0.0.1:5000', {
    transports: ['websocket'],
});

function RealtimeMonitor() {
    const [avgCpu, setAvgCpu] = useState(0); // State for average CPU usage
    const [memory, setMemory] = useState({ used: 0, available: 0, percent: 0 });
    const [disk, setDisk] = useState({ used: 0, free: 0, percent: 0 });
    const [processes, setProcesses] = useState([]); // State for processes
    const [showProcessDetails, setShowProcessDetails] = useState(false); // State to toggle process details
    const needleRef = useRef(null); // Ref for the CPU speedometer needle
    const speedNumberRef = useRef(null); // Ref for the CPU speed display
    const memoryNeedleRef = useRef(null); // Ref for the memory speedometer needle
    const memorySpeedNumberRef = useRef(null); // Ref for the memory speedometer number
    const diskNeedleRef = useRef(null); // Ref for the disk speedometer needle
    const diskSpeedNumberRef = useRef(null); // Ref for the disk speedometer number
    const processesNeedleRef = useRef(null); // Ref for the processes speedometer needle
    const processesSpeedNumberRef = useRef(null); // Ref for the processes speedometer number

    useEffect(() => {
        console.log("Setting up WebSocket connection...");

        // Listen for connection
        socket.on('connect', () => {
            console.log("Connected to WebSocket");
        });

        // Listen for system data updates (CPU, memory, processes, disk)
        socket.on('update', (data) => {
            console.log("Received system data:", data);
            setAvgCpu(data.avg_cpu); // Update average CPU usage state
            setMemory(data.memory); // Update memory data
            setDisk(data.disk); // Update disk data
            setProcesses(data.processes); // Update processes data
            updateSpeedometer(data.avg_cpu); // Update CPU speedometer
            updateMemorySpeedometer(data.memory.percent); // Update memory speedometer
            updateDiskSpeedometer(data.disk); // Update disk speedometer
            updateProcessesSpeedometer(data.processes.length); // Update processes speedometer
        });

        // Emit a request for system updates every second
        const interval = setInterval(() => {
            socket.emit('request_update');
        }, 1000);

        // Cleanup on component unmount
        return () => {
            socket.off('update');
            socket.off('connect');
            clearInterval(interval);
        };
    }, []);

    // Function to dynamically update the CPU speedometer
    const updateSpeedometer = (percentage) => {
        const needle = needleRef.current;
        const speedNumber = speedNumberRef.current;

        if (needle && speedNumber) {
            // Map percentage (0–100) to needle rotation (-45 to 225 degrees)
            const angle = (percentage / 100) * 270 - 45;

            // Rotate the needle
            needle.style.transform = `rotate(${angle}deg)`;

            // Update the displayed number
            speedNumber.textContent = Math.ceil(percentage);
        }
    };

    const updateDiskSpeedometer = (diskData) => {
        const needle = diskNeedleRef.current;
        const speedNumber = diskSpeedNumberRef.current;

        if (needle && speedNumber) {
            const percentage = diskData.percent || 0; // Use diskData.percent and handle undefined/null values

            // Map percentage (0–100) to needle rotation (-45 to 225 degrees)
            const angle = (percentage / 100) * 270 - 45;

            // Rotate the needle
            needle.style.transform = `rotate(${angle}deg)`;

            // Update the displayed percentage
            speedNumber.textContent = `${Math.ceil(percentage)}%`;
        }
    };

    // Function to dynamically update the memory speedometer
    const updateMemorySpeedometer = (percentage) => {
        const needle = memoryNeedleRef.current;
        const speedNumber = memorySpeedNumberRef.current;

        if (needle && speedNumber) {
            // Map percentage (0–100) to needle rotation (-45 to 225 degrees)
            const angle = (percentage / 100) * 270 - 45;

            // Rotate the needle
            needle.style.transform = `rotate(${angle}deg)`;

            // Update the displayed number
            speedNumber.textContent = Math.ceil(percentage);
        }
    };

    const updateProcessesSpeedometer = (count) => {
        const needle = processesNeedleRef.current;
        const speedNumber = processesSpeedNumberRef.current;

        if (needle && speedNumber) {
            // Assuming a maximum process count of 100 for speedometer scale
            const maxProcesses = 100;
            const percentage = Math.min((count / maxProcesses) * 100, 100);

            // Map percentage (0–100) to needle rotation (-45 to 225 degrees)
            const angle = (percentage / 100) * 270 - 45;

            // Rotate the needle
            needle.style.transform = `rotate(${angle}deg)`;

            // Update the displayed count
            speedNumber.textContent = count;
        }
    };

    // Function to handle the click event on the process speedometer
    const handleProcessSpeedometerClick = () => {
        setShowProcessDetails(!showProcessDetails); // Toggle process details visibility
    };

    return (
        <div>
            <h1>Real-Time OS Monitor</h1>

            {/* Speedometer for CPU */}
            <div className="container cpu-speedometer">
                <div className="center">
                    <div className="speedometr">
                        <svg className="speed" width="400" height="342" viewBox="0 0 400 342">
                            {/* Gradients */}
                            <defs>
                                <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06AFFD" />
                                    <stop offset="100%" stopColor="#F1E50C" />
                                </linearGradient>
                                <linearGradient id="linear2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="50%" stopColor="#fff" />
                                    <stop offset="90%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>

                            {/* Paths */}
                            <path
                                id="arc2"
                                style={{
                                    fill: 'none',
                                    strokeWidth: '52',
                                    strokeMiterlimit: 1,
                                    strokeOpacity: 0.05,
                                    transformOrigin: '180px 180px',
                                    transform: 'scale(0.9 0.9)',
                                }}
                                transform="scale(0.9 0.9) translate(20 18)"
                                stroke="url(#linear)"
                                d="m 66.906305,293.33748 a 160.10918,160.10918 0 0 1 10e-7,-226.428566 a 160.10918,160.10918 0 0 1 226.428574,10e-7 a 160.10918,160.10918 0 0 1 -10e-6,226.428565"
                            />
                            <path
                                id="path"
                                style={{
                                    fill: 'none',
                                    strokeWidth: '38',
                                    stroke: '#223050',
                                    strokeOpacity: 0.5,
                                }}
                                d="m 66.906305,293.33748 a 160.10918,160.10918 0 0 1 10e-7,-226.428566 a 160.10918,160.10918 0 0 1 226.428574,10e-7 a 160.10918,160.10918 0 0 1 -10e-6,226.428565"
                            />
                            <path
                                id="arc"
                                style={{
                                    fill: 'none',
                                    strokeWidth: '40',
                                    stroke: 'url(#linear)',
                                }}
                                d="m 66.906305,293.33748 a 160.10918,160.10918 0 0 1 10e-7,-226.428566 a 160.10918,160.10918 0 0 1 226.428574,10e-7 a 160.10918,160.10918 0 0 1 -10e-6,226.428565"
                            />

                            {/* Needle */}
                            <polygon
                                id="bigLine"
                                ref={needleRef}
                                className="line"
                                fill="url(#linear2)"
                                points="180,168 180,192  65,188  65,172"
                                style={{
                                    fillOpacity: 0.9,
                                    transformOrigin: '180px 180px',
                                }}
                            />

                            {/* Markings */}
                            {[226, 253, 280, 307, 334, 361, 388, 415, 442, 469, 494].map((angle, index) => (
                                <line
                                    key={index}
                                    className="metka"
                                    x1="180"
                                    y1="14"
                                    x2="180"
                                    y2="26"
                                    transform={`rotate(${angle} 180 180)`}
                                />
                            ))}

                            {/* Text Markings */}
                            <text x="85" y="275" className="number">0</text>
                            <text x="50" y="222" className="number">10</text>
                            <text x="48" y="162" className="number">20</text>
                            <text x="75" y="110" className="number">30</text>
                            <text x="117" y="74" className="number">40</text>
                            <text x="175" y="65" className="number">50</text>
                            <text x="227" y="74" className="number">60</text>
                            <text x="270" y="110" className="number">70</text>
                            <text x="290" y="162" className="number">80</text>
                            <text x="285" y="222" className="number">90</text>
                            <text x="250" y="275" className="number">100</text>

                        </svg>
                        <div id="speed-number" ref={speedNumberRef} className="speed-number" style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#fff',
                            textAlign: 'center',

                        }}>
                            0
                        </div>
                        <div className="mbps">CPU Usage (%)</div>
                    </div>
                </div>
            </div>

            {/* Speedometer for Memory (smaller, positioned left) */}
            <div className="container memory-speedometer" style={{ position: 'absolute', left: '470px', top: '530px' }}>
                <div className="center">
                    <div className="speedometr">
                        <svg className="speed" width="300" height="255" viewBox="0 0 400 442">
                            {/* Same gradient and path logic for memory as above */}
                            <defs>
                                <linearGradient id="linearMemory" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#AA4203" />
                                    <stop offset="100%" stopColor="#FF13F0 " />
                                </linearGradient>
                                <linearGradient id="linearMemory2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="50%" stopColor="#fff" />
                                    <stop offset="90%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>

                            <path
                                style={{
                                    fill: 'none',
                                    strokeWidth: '40',
                                    stroke: 'url(#linearMemory)',
                                }}
                                d="m 66.906305,293.33748 a 160.10918,160.10918 0 0 1 10e-7,-226.428566 a 160.10918,160.10918 0 0 1 226.428574,10e-7 a 160.10918,160.10918 0 0 1 -10e-6,226.428565"
                            />
                            <polygon
                                ref={memoryNeedleRef}
                                className="line"
                                fill="url(#linearMemory2)"
                                points="180,168 180,192 65,188 65,172"
                                style={{
                                    fillOpacity: 0.9,
                                    transformOrigin: '170px 190px',
                                }}
                            />

                            {/* Markings */}
                            {[226, 253, 280, 307, 334, 361, 388, 415, 442, 469, 494].map((angle, index) => (
                                <line
                                    key={index}
                                    className="metka"
                                    x1="180"
                                    y1="14"
                                    x2="180"
                                    y2="26"
                                    transform={`rotate(${angle} 180 180)`}
                                />
                            ))}

                            {/* Text Markings */}
                            <text x="85" y="275" className="number">0</text>
                            <text x="50" y="222" className="number">10</text>
                            <text x="48" y="162" className="number">20</text>
                            <text x="75" y="110" className="number">30</text>
                            <text x="117" y="74" className="number">40</text>
                            <text x="175" y="65" className="number">50</text>
                            <text x="227" y="74" className="number">60</text>
                            <text x="270" y="110" className="number">70</text>
                            <text x="290" y="162" className="number">80</text>
                            <text x="285" y="222" className="number">90</text>
                            <text x="250" y="275" className="number">100</text>
                        </svg>
                        <div id="speed-number-memory" ref={memorySpeedNumberRef} className="speed-number" style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#fff',
                            top: '500 px', /* Adjust based on desired position */
                            left: '500 px',

                        }}>
                            0
                        </div>
                        <div className="mbps-memory" >Memory Usage (%)</div>
                    </div>
                </div>
            </div>

            {/* Speedometer for Disk (smaller, positioned right) */}
            <div className="container disk-speedometer" style={{ position: 'absolute', left: '1390px', top: '530px' }}>
                <div className="center">
                    <div className="speedometr">
                        <svg className="speed" width="300" height="255" viewBox="0 0 400 442">
                            {/* Same gradient and path logic for memory as above */}
                            <defs>
                                <linearGradient id="linearMemory" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06AFFD" />
                                    <stop offset="100%" stopColor="#F1E50C" />
                                </linearGradient>
                                <linearGradient id="linearMemory2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="50%" stopColor="#fff" />
                                    <stop offset="90%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>

                            <path
                                style={{
                                    fill: 'none',
                                    strokeWidth: '40',
                                    stroke: 'url(#linearMemory)',
                                }}
                                d="m 66.906305,293.33748 a 160.10918,160.10918 0 0 1 10e-7,-226.428566 a 160.10918,160.10918 0 0 1 226.428574,10e-7 a 160.10918,160.10918 0 0 1 -10e-6,226.428565"
                            />
                            <polygon
                                ref={diskNeedleRef}
                                className="line"
                                fill="url(#linearMemory2)"
                                points="180,168 180,192 65,188 65,172"
                                style={{
                                    fillOpacity: 0.9,
                                    transformOrigin: '170px 190px',
                                }}
                            />

                            {/* Markings */}
                            {[226, 253, 280, 307, 334, 361, 388, 415, 442, 469, 494].map((angle, index) => (
                                <line
                                    key={index}
                                    className="metka"
                                    x1="180"
                                    y1="14"
                                    x2="180"
                                    y2="26"
                                    transform={`rotate(${angle} 180 180)`}
                                />
                            ))}

                            {/* Text Markings */}
                            <text x="85" y="275" className="number">0</text>
                            <text x="50" y="222" className="number">10</text>
                            <text x="48" y="162" className="number">20</text>
                            <text x="75" y="110" className="number">30</text>
                            <text x="117" y="74" className="number">40</text>
                            <text x="175" y="65" className="number">50</text>
                            <text x="227" y="74" className="number">60</text>
                            <text x="270" y="110" className="number">70</text>
                            <text x="290" y="162" className="number">80</text>
                            <text x="285" y="222" className="number">90</text>
                            <text x="250" y="275" className="number">100</text>
                        </svg>
                        <div id="speed-number-disk" ref={diskSpeedNumberRef} className="speed-number" style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#fff',
                            top: '500 px', /* Adjust based on desired position */
                            left: '500 px',

                        }}>
                            0
                        </div>
                        <div className="mbps-disk" >Disk Usage (%)</div>
                    </div>
                </div>
            </div>

            {/* Speedometer for Processes (smaller, positioned bottom) */}
            <div className="container processes-speedometer" style={{ position: 'absolute', left: '920px', top: '810px' }}>
                <div className="center">
                    {/* Wrap the speedometer in a clickable div */}
                    <div className="speedometr" onClick={handleProcessSpeedometerClick} style={{ cursor: 'pointer' }}>
                        <svg className="speed" width="300" height="255" viewBox="0 0 400 522">
                            {/* Same gradient and path logic for memory as above */}
                            <defs>
                                <linearGradient id="linearMemory" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#DMC606" />
                                    <stop offset="100%" stopColor="#F1E50C" />
                                </linearGradient>
                                <linearGradient id="linearMemory2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="50%" stopColor="#fff" />
                                    <stop offset="90%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>

                            <path
                                style={{
                                    fill: 'none',
                                    strokeWidth: '40',
                                    stroke: 'url(#linearMemory)',
                                }}
                                d="m 66.906305,293.33748 a 160.10918,160.10918 0 0 1 10e-7,-226.428566 a 160.10918,160.10918 0 0 1 226.428574,10e-7 a 160.10918,160.10918 0 0 1 -10e-6,226.428565"
                            />
                            <polygon
                                ref={processesNeedleRef}
                                className="line"
                                fill="url(#linearMemory2)"
                                points="180,168 180,192 65,188 65,172"
                                style={{
                                    fillOpacity: 0.9,
                                    transformOrigin: '170px 190px',
                                }}
                            />

                        </svg>
                        <div id="speed-number-process" ref={processesSpeedNumberRef} className="speed-number" style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#fff',
                            top: '200 px', /* Adjust based on desired position */
                            left: '500 px',

                        }}>
                            0
                        </div>
                        <div className="mbps-process">Processes(%)</div>
                    </div>
                </div>
            </div>

            {/* Modal or Section for Process Details */}
            {showProcessDetails && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                }}>
                    <h2>Process Details</h2>
                    <button onClick={() => setShowProcessDetails(false)} style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                    }}>
                        ×
                    </button>
                    <table>
                        <thead>
                            <tr>
                                <th>PID</th>
                                <th>Name</th>
                                <th>CPU %</th>
                                <th>Memory %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processes.map((process, index) => (
                                <tr key={index}>
                                    <td>{process.pid}</td>
                                    <td>{process.name}</td>
                                    <td>{process.cpu_percent.toFixed(2)}</td>
                                    <td>{process.memory_percent.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RealtimeMonitor;