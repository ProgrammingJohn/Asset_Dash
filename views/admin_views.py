from flask import Blueprint, render_template, session, request, redirect, url_for
from config import Config

admin_bp = Blueprint('admin', __name__, template_folder='templates')

@admin_bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if session.get('logged_in'):
        return redirect(url_for('admin.admin_dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        for admin in Config.Admins:
            if username == admin['name'] and password == admin['password']:
                session['logged_in'] = True
                return redirect(url_for('admin.admin_dashboard'))

    return render_template('login.html')

@admin_bp.route('/admin/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('admin.admin_login'))

@admin_bp.route('/admin/dashboard', methods=["GET"])
def admin_dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('admin.admin_login'))
    return render_template("admin-table.html")

@admin_bp.route('/admin/asset-log', methods=["GET"])
def admin_asset_log():
    if not session.get('logged_in'):
        return redirect(url_for('admin.admin_login'))
    return render_template("admin-log.html")