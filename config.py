class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///asset_dash.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    SECRET_KEY = 'your_secret_key'
    Production = False
    PORT = 9000
    Admins = [{'name': 'admin', 'password': 'pass'}]
    sling_user_id = 0
    sling_org_id = 0