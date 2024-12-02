from routes.user_routes import user_bp
from routes.asset_routes import asset_bp
from routes.util_routes import utils_bp
from flask import Flask

def register_route_blueprints(app: Flask):
    app.register_blueprint(user_bp)
    app.register_blueprint(asset_bp)
    app.register_blueprint(utils_bp)