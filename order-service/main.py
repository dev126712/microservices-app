import os
import requests
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database configuration via environment variables
DB_URL = os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/orders_db')
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
db = SQLAlchemy(app)

# Simple Order Model
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='PENDING')

@app.route('/order', methods=['POST'])
def create_order():
    data = request.json
    new_order = Order(product_id=data['product_id'])
    
    db.session.add(new_order)
    db.session.commit()

    # Trigger the Notification Service (Service-to-Service communication)
    try:
        requests.post("http://notification-service:5001/notify", 
                      json={"order_id": new_order.id, "msg": "Order Created!"})
    except Exception as e:
        print(f"Notification failed: {e}")

    return jsonify({"message": "Order placed", "order_id": new_order.id}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Automatically creates tables for the demo
    app.run(host='0.0.0.0', port=5000)
