from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, render_template, request, session, redirect, url_for
import json
import os
import pytz
import datetime
from typing import Literal
import yaml
import socket

app = Flask(__name__)
PORT = 9000

try:
    with open('instance/env.yaml', 'r') as f:
        enviornment_variables = yaml.safe_load(f)
except FileNotFoundError:
    with open('instance/env.yaml', 'w+') as f:
        env_template = {
            'admins': [{'username': 'admin', 'password': 'pass'}],
            'secret_key': os.urandom(24).hex()
        }
        print("No env.yaml found.\nwriting to /instance/env.yaml\nusername: admin\npassword: pass")
        yaml.dump(env_template, f)
        enviornment_variables = env_template

app.secret_key = enviornment_variables['secret_key']

db = SQLAlchemy()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///asset_dash.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db.init_app(app)


class Users(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)


class Assets(db.Model):
    __tablename__ = 'Assets'
    asset_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    checked_out_by = db.Column(db.Integer, db.ForeignKey('Users.user_id'))
    time_checked = db.Column(
        db.TIMESTAMP, server_default=db.func.current_timestamp())

    def get_csv_string(self) -> str:
        user = Users.query.filter_by(user_id=self.checked_out_by).one_or_none()
        return f'{self.time_checked},{self.asset_id},{self.name},{user.first_name},{user.last_name},{self.checked_out_by}'


def get_ip_address() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip_address = s.getsockname()[0]
    except Exception as e:
        ip_address = 'Unable to get IP address'
    finally:
        s.close()

    return ip_address


def add_users_from_csv(path="instance/roster.csv"):
    with app.app_context():
        with open(path, "r") as f:
            users = f.readlines()[1:]
            for user in users:
                last_name, first_name = user.split(",")
                user = Users(first_name=first_name,
                             last_name=last_name)
                print(user)
                db.session.add(user)
                db.session.commit()


with app.app_context():
    db.create_all()


def get_eastern_time():
    eastern = pytz.timezone('US/Eastern')
    return datetime.datetime.now(eastern)


def log_transaction(transaction_type: Literal["in", "out"], asset: Assets):
    with open("instance/asset_log.csv", "a") as f:
        f.write(f'{transaction_type},{asset.get_csv_string()}\n')


def time_to_string(date):
    return date.strftime("%Y-%m-%d %I:%M %p")


@app.route('/view', methods=['GET'])
def view_table():
    return render_template('viewer.html')


@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if session.get('logged_in'):
        return redirect(url_for('admin_table'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        for admin in enviornment_variables['admins']:
            if username == admin['username'] and password == admin['password']:
                session['logged_in'] = True
                return redirect(url_for('admin_table'))

    return render_template('login.html')


@app.route('/admin', methods=["GET"])
def admin_table():
    if not session.get('logged_in'):
        return redirect(url_for('admin_login'))
    return render_template("admin-table.html")


@app.route('/admin/log', methods=["GET"])
def admin_log():
    if not session.get('logged_in'):
        return redirect(url_for('admin_login'))
    # return render_template("admin-log.html")
    with open('asset_log.csv', 'r') as f:
        return "<pre>"+f.read()+"</pre>"


@app.route('/admin/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('admin_login'))


@app.route("/", methods=["GET"])
def check_out_page():
    return render_template("check-out.html", ip=get_ip_address(), port=PORT)


@app.route("/api/get/log", methods=["GET"])
def get_log():
    logs = []
    headers = ["type", "time_checked", "asset_id", "name",
               "first_name", "last_name", "user_id"]
    with open("asset_log.csv", "r") as f:
        for transaction in f.readlines():
            transaction = transaction[:-2]
            transaction_dir = {}
            for index, attr in enumerate(transaction.split(',')):
                transaction_dir[headers[index]] = attr
            logs.append(transaction_dir)
        return jsonify(logs)


@app.route("/api/get/users/all", methods=["GET"])
def get_users():
    users = Users.query.all()
    users_list = []
    for user in users:
        user_dict = {
            'user_id': user.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
        users_list.append(user_dict)
    return jsonify(users_list)


@app.route("/api/post/assets/check-out", methods=["POST"])
def check_out():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    user_id = data["user_id"]
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    user = Users.query.filter_by(user_id=user_id).one_or_none()
    if not user:
        return f'User does not exist', 400
    if not asset:
        return f'Asset {asset_id} does not exist', 400
    if asset.checked_out_by:
        return f'{asset.name} already checked out', 400
    asset.checked_out_by = user.user_id
    asset.time_checked = get_eastern_time()
    db.session.commit()
    log_transaction("out", asset)
    return f'{asset.name} checked out by {user.first_name} {user.last_name}', 200


@app.route("/api/post/assets/check-in", methods=["POST"])
def check_in():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    log_transaction("in", asset)
    if not asset:
        return f'Asset {asset_id} does not exist', 400
    if not asset.checked_out_by:
        return f'Asset {asset_id} already checked in', 400
    asset.checked_out_by = None
    asset.time_checked = get_eastern_time()
    db.session.commit()
    return f'{asset.name} checked in successfully', 200


@app.route("/api/post/users/edit", methods=["POST"])
def edit_user():
    data = json.loads(request.data.decode())
    user_id = data["user_id"]
    edited_first_name = data["edited_first_name"]
    edited_last_name = data["edited_last_name"]
    user = Users.query.filter_by(user_id=user_id).one_or_none()
    if not user:
        return f'User {user_id} does not exist', 400
    try:
        user.first_name = edited_first_name
        user.last_name = edited_last_name

        db.session.commit()
        return f'User {user_id} has been updated successfully', 200
    except Exception as e:
        # Rollback the transaction if there is an error
        db.session.rollback()
        return f'An error: {e} occurred while updating the user', 500


@app.route("/api/post/assets/edit", methods=["POST"])
def edit_asset():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    edited_id = data["edited_id"]
    edited_name = data["edited_name"]
    edited_type = data["edited_type"]
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    if not asset:
        return f'Asset {asset_id} does not exist', 400
    try:
        asset.asset_id = edited_id
        asset.name = edited_name
        asset.type = edited_type

        db.session.commit()
        return f'Asset {asset.name} has been updated successfully', 200
    except Exception as e:
        # Rollback the transaction if there is an error
        db.session.rollback()
        return f'An error: {e} occurred while updating the asset', 500


@app.route("/api/post/users/add", methods=["POST"])
def add_user():
    data = json.loads(request.data.decode())
    print(data)
    user_first_name = data["user_first_name"]
    user_last_name = data["user_last_name"]
    user = Users(first_name=user_first_name,
                 last_name=user_last_name)
    try:
        db.session.add(user)
        db.session.commit()
        return f'User {user.user_id} has been added successfully', 200
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while adding the user', 500


@app.route("/api/post/assets/add", methods=["POST"])
def add_asset():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    asset_name = data["asset_name"]
    asset_type = data["asset_type"]
    asset = Assets(asset_id=asset_id, name=asset_name, type=asset_type)
    try:
        db.session.add(asset)
        db.session.commit()
        return f'Asset {asset_name} has been added successfully', 200
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while adding the asset', 500


@app.route("/api/post/users/delete", methods=["POST"])
def delete_user():
    data = json.loads(request.data.decode())
    user_id = data["user_id"]
    user = Users.query.filter_by(user_id=user_id).one_or_none()
    if not user:
        return f'User {user_id} does not exist', 400
    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while deleting the user', 500
    return f'{user_id} deleted successfully', 200


@app.route("/api/post/assets/delete", methods=["POST"])
def delete_asset():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    if not asset:
        return f'Asset {asset_id} does not exist', 400
    try:
        db.session.delete(asset)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while deleting the asset', 500
    return f'{asset.name} deleted successfully', 200


@app.route("/api/get/assets/out", methods=["GET"])
def get_assets_out():
    assets = Assets.query.filter(Assets.checked_out_by != None).all()
    assets_list = []
    for asset in assets:
        user = Users.query.get(asset.checked_out_by)
        assets_list.append({
            'asset_id': asset.asset_id,
            'name': asset.name,
            'type': asset.type,
            'checked_out_by': user.first_name + ' ' + user.last_name,
            'time_checked': time_to_string(asset.time_checked),
        })
    return jsonify(assets_list)


@app.route("/api/get/assets/all", methods=["GET"])
def get_assets():
    assets = Assets.query.all()
    assets_list = []
    for asset in assets:
        assets_list.append({
            'asset_id': str(asset.asset_id),
            'name': asset.name,
            'type': asset.type,
            'checked_out_by': asset.checked_out_by,
            'time_checked': asset.time_checked,
        })
    return jsonify(assets_list)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
