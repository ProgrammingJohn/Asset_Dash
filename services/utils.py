import pytz
import datetime
import socket
from flask import Flask
from database import db

def get_eastern_time() -> datetime.datetime:
    """ local time """
    eastern = pytz.timezone('US/Eastern')
    return datetime.datetime.now(eastern)

def time_to_string(date: datetime.datetime) -> str:
    """ datetime obj to str representation %Y-%m-%d %I:%M %p """
    return date.strftime("%Y-%m-%d %I:%M %p")

def get_ip_address() -> str:
    """ gets ip via socket """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip_address = s.getsockname()[0]
    except Exception as e:
        ip_address = 'Unable to get IP address'
    finally:
        s.close()

    return ip_address

def add_users_from_csv(app: Flask, users_model, path="roster_main.csv") -> None:
    """ given user sqlalchemy model and app load users to db """
    with open(path, "r") as f:
        users = f.readlines()[1:]
    unique_users = []
    for user in users:
        user = user.replace("\n", "")
        if user not in unique_users:
            unique_users.append(user)

    with app.app_context():
        db.session.query(users_model).delete()

        for user in unique_users:
            last_name, first_name = user.split(",")
            user = users_model(first_name=first_name, last_name=last_name)
            db.session.add(user)

        db.session.commit()
