from views.admin_views import admin_bp
from views.kiosk_views import kiosk_bp
from flask import Flask

def register_view_blueprints(app: Flask):
    app.register_blueprint(admin_bp)
    app.register_blueprint(kiosk_bp)