from flask import Flask, jsonify
from flask_socketio import SocketIO
import psutil
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

def get_system_data():
    """
    Helper function to gather system data (CPU, memory, processes, disk usage).
    Returns a dictionary with system metrics.
    """
    # Gather CPU usage
    cpu_usage = psutil.cpu_percent(percpu=True)
    avg_cpu_usage = sum(cpu_usage) / len(cpu_usage)  # Calculate average CPU usage

    # Gather memory usage
    memory = psutil.virtual_memory()
    memory_data = {
        'used': memory.used,
        'available': memory.available,
        'percent': memory.percent
    }
    
    # Gather running processes
    processes = []
    for proc in psutil.process_iter(attrs=['pid', 'name', 'memory_percent', 'cpu_percent']):
        processes.append(proc.info)
    
    # Gather disk usage
    disk = psutil.disk_usage('/')
    disk_io = psutil.disk_io_counters()
    disk_data = {
        'used': disk.used,
        'free': disk.free,
        'percent': disk.percent,
        'read_count': disk_io.read_count,
        'write_count': disk_io.write_count
    }

    return {
        'cpu': cpu_usage,
        'avg_cpu': avg_cpu_usage,  # Include average CPU usage
        'memory': memory_data,
        'processes': processes,
        'disk': disk_data
    }

@app.route('/api/static', methods=['GET'])
def get_static_data():
    """
    Endpoint for static data like total disk and memory.
    """
    disk = psutil.disk_usage('/')
    return jsonify({'total_disk': disk.total, 'total_memory': psutil.virtual_memory().total})

def send_realtime_data():
    """
    Function to send real-time data continuously to the client every second.
    """
    while True:
        data_to_emit = get_system_data()  # Gather system data
        print(f"Real-time Data: {data_to_emit}")  # Debug log

        # Emit the full system data
        socketio.emit('update', data_to_emit)

        time.sleep(1)  # Adjust update frequency

@socketio.on('connect')
def handle_connect():
    """
    Handle client connection by sending a success message.
    """
    print("Client connected")
    socketio.emit('connection_success', {'message': 'Connection successful'})
    print("Connection success message sent to client.")

@socketio.on('request_update')
def handle_request_update():
    """
    Handle the 'request_update' event from the client to send real-time system data.
    """
    print("Received request for system update")
    data_to_send = get_system_data()  # Gather system data

    # Emit the full system data
    socketio.emit('update', data_to_send)
    print("Real-time data sent in response to request.")

@socketio.on('disconnect')
def handle_disconnect():
    """
    Handle client disconnection.
    """
    print("Client disconnected")

if __name__ == '__main__':
    # Start the Flask app and SocketIO server
    socketio.start_background_task(send_realtime_data)  # Start real-time data emission
    socketio.run(app, debug=True)
