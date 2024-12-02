from flask import Flask
from database import init_db
from routes import register_route_blueprints
from views import register_view_blueprints
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
init_db(app)

# Register blueprints
register_route_blueprints(app)
register_view_blueprints(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.Production)