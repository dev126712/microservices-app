import os
import requests
import time
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import OperationalError

app = Flask(__name__)

# Config
DB_URL = os.getenv('DATABASE_URL', 'postgresql://user:pass@db:5432/orders_db')
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
db = SQLAlchemy(app)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(50), nullable=False)
    product_name = db.Column(db.String(100)) # New: store the name too
    status = db.Column(db.String(20), default='PLACED')

@app.route('/order', methods=['POST'])
def create_order():
    data = request.json
    p_id = data.get('product_id')

    # 1. Step Up: Verify product exists by calling Product Service
    try:
        # Internal Docker DNS: 'product-service' port 3000
        response = requests.get(f"http://product-service:3000/{p_id}", timeout=2)
        if response.status_code != 200:
            return jsonify({"error": "Product not found in inventory"}), 404
        
        product_data = response.json().get('data', {})
        p_name = product_data.get('name', 'Unknown Item')
    except Exception as e:
        return jsonify({"error": f"Product service unavailable: {str(e)}"}), 503

    # 2. Save Order
    new_order = Order(product_id=p_id, product_name=p_name)
    db.session.add(new_order)
    db.session.commit()

    # 3. Step Up: Send Detailed Notification to Go Service
    notification_payload = {
        "order_id": new_order.id,
        "product_name": p_name,
        "msg": f"Success! Your order for '{p_name}' is being processed."
    }

    try:
        requests.post("http://notification-service:5001/notify", json=notification_payload, timeout=2)
    except:
        print(">>> Warning: Notification service is down, but order was saved.")

    return jsonify({"message": "Order placed successfully", "order_id": new_order.id}), 201


if __name__ == '__main__':
    with app.app_context(): # <--- This must be indented (4 spaces)
        # Retry logic to wait for Postgres to finish booting
        connected = False
        while not connected:
            try:
                db.create_all()
                print(">>> Database connection established!")
                connected = True
            except OperationalError:
                print(">>> Database not ready, retrying...")
                time.sleep(2)
    
    # This also must be indented to be part of the 'if' block
    app.run(host='0.0.0.0', port=5000)