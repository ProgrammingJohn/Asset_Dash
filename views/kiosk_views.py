from flask import Blueprint, render_template
from config import Config
from services.utils import get_ip_address

kiosk_bp = Blueprint('kiosk', __name__, template_folder='templates')

@kiosk_bp.route("/kiosk/checkout", methods=["GET"])
def check_out():
    return render_template("check-out.html", ip=get_ip_address(), port=Config.PORT)

@kiosk_bp.route('/kiosk/dashboard')
def dashboard():
    return render_template('viewer.html')

@kiosk_bp.route("/kiosk/directory", methods=["GET"])
def directory():
    return render_template("directory.html", ip=get_ip_address(), port=Config.PORT)