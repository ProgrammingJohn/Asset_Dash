from flask import Blueprint, request, jsonify
from services.asset_service import check_out_asset, check_in_asset, edit_asset, add_asset, delete_asset, get_checked_out_assets, get_assets
import json

asset_bp = Blueprint('asset', __name__)

@asset_bp.route("/assets/all", methods=["GET"])
def get_all_assets():
    assets = get_assets()
    return assets

@asset_bp.route("/assets/out", methods=["GET"])
def get_checked_out_assets_():
    assets = get_checked_out_assets()
    return jsonify(assets)

@asset_bp.route("/assets/check-out", methods=["POST"])
def check_out():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    user_id = data["user_id"]
    status = check_out_asset(asset_id, user_id)
    return status

@asset_bp.route("/assets/check-in", methods=["POST"])
def check_in():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    status = check_in_asset(asset_id)
    return status

@asset_bp.route("/assets/edit", methods=["POST"])
def edit_asset_():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    edited_id = data["edited_id"]
    edited_name = data["edited_name"]
    edited_type = data["edited_type"]
    status = edit_asset(asset_id, edited_id, edited_name, edited_type)
    return status

@asset_bp.route("/assets/add", methods=["POST"])
def add_asset_():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    asset_name = data["asset_name"]
    asset_type = data["asset_type"]
    status = add_asset(asset_id, asset_name, asset_type)
    return status

@asset_bp.route("/assets/delete", methods=["POST"])
def delete_asset_():
    data = json.loads(request.data.decode())
    asset_id = data["asset_id"]
    status = delete_asset(asset_id)
    return status
