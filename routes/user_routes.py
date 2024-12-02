from flask import Blueprint, request, jsonify
from services.user_service import get_all_users, edit_user, add_user, delete_user
import json

user_bp = Blueprint('user', __name__)

@user_bp.route('/users/all', methods=['GET'])
def get_users():
    users = get_all_users()
    return jsonify(users)

@user_bp.route("/users/edit", methods=["POST"])
def edit_user_():
    data = json.loads(request.data.decode())
    user_id = data["user_id"]
    edited_first_name = data["edited_first_name"]
    edited_last_name = data["edited_last_name"]
    status = edit_user(user_id, edited_first_name, edited_last_name)
    return status

@user_bp.route("/users/add", methods=["POST"])
def add_user_():
    data = json.loads(request.data.decode())
    user_first_name = data["user_first_name"]
    user_last_name = data["user_last_name"]
    status = add_user(user_first_name, user_last_name)
    return status

@user_bp.route("/users/delete", methods=["POST"])
def delete_user_():
    data = json.loads(request.data.decode())
    user_id = data["user_id"]
    status = delete_user(user_id)
    return status