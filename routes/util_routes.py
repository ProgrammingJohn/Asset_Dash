from flask import Blueprint, request, jsonify
from sling import get_full_events
from config import Config

utils_bp = Blueprint('utils', __name__)

@utils_bp.route("/utils/sling-events", methods=["GET"])
def get_sling_events():
    days_in_advance = request.args.get('days_in_advance')
    if not days_in_advance:
        days_in_advance = 21
    else:
        days_in_advance = int(days_in_advance)
    events = get_full_events(org_id=Config.sling_org_id, user_id=Config.sling_user_id, days_in_advance=days_in_advance)
    return jsonify(events)

@utils_bp.route("/utils/asset-log", methods=["GET"])
def get_log():
    logs = []
    headers = ["type", "time_checked", "asset_id", "name",
               "first_name", "last_name", "user_id"]
    
    try:
        with open('./instance/asset_log.csv', 'r') as f:
            for transaction in f.readlines():
                transaction = transaction[:-2]
                transaction_dir = {}
                for index, attr in enumerate(transaction.split(',')):
                    transaction_dir[headers[index]] = attr
                logs.append(transaction_dir)
            return jsonify(logs)
    except:
        open("./instance/asset_log.csv", "w")
    return jsonify(None)