# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import users_collection, reminders_collection
import bcrypt

app = Flask(__name__)
CORS(app)  # Allow frontend access

# Route: Register
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if users_collection.find_one({'email': email}):
        return jsonify({'message': 'Email already registered'}), 400

    # Hash the password before storing
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    users_collection.insert_one({'name': name, 'email': email, 'password': hashed_pw})
    return jsonify({'message': 'User registered successfully'}), 200

# Route: Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({'email': email})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'message': 'Login successful', 'email': user['email'], 'name': user['name']}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)

# Add this route to save reminders
@app.route('/add_reminder', methods=['POST'])
def add_reminder():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    time = data.get('time')
    date = data.get('date')

    if not all([email, name, time, date]):
        return jsonify({'message': 'Missing fields'}), 400

    reminder = {
        'email': email,
        'name': name,
        'time': time,
        'date': date
    }

    reminders_collection.insert_one(reminder)
    return jsonify({'message': 'Reminder saved successfully'}), 200

@app.route('/get_reminders', methods=['GET'])
def get_reminders():
    email = request.args.get('email')
    if not email:
        return jsonify({'message': 'Missing email'}), 400
    reminders = list(reminders_collection.find({'email': email}))
    for r in reminders:
        r['_id'] = str(r['_id'])
    return jsonify({'reminders': reminders}), 200




