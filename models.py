from database import db
from services.utils import time_to_string, get_eastern_time

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
        return f'{time_to_string(get_eastern_time())},{self.asset_id},{self.name},{user.first_name},{user.last_name},{self.checked_out_by}'

    def get_descriptor(self) -> str:
        return f'{self.name} ({self.asset_id})'
