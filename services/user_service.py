from models import Users
from typing import List, Dict, Tuple
from database import db

def get_all_users() -> List[Dict]:
    """ get all users """
    users = Users.query.all()
    users_list = []
    for user in users:
        user_dict = {
            'user_id': user.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
        users_list.append(user_dict)
    return users_list

def edit_user(user_id, edited_first_name, edited_last_name) -> Tuple[str, int]:
    """ edit user first name and last name """
    user = Users.query.filter_by(user_id=user_id).one_or_none()
    if not user:
        return f'User {user_id} does not exist', 400
    try:
        user.first_name = edited_first_name
        user.last_name = edited_last_name

        db.session.commit()
        return f'User {user_id} has been updated successfully', 200
    
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while updating the user', 500
    
def add_user(first_name, last_name) -> Tuple[str, int]:
    """ add new user by first name and last name"""
    user = Users(first_name=first_name,
                 last_name=last_name)
    try:
        db.session.add(user)
        db.session.commit()
        return f'User {user.user_id} has been added successfully', 200
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while adding the user', 500
    
def delete_user(user_id) -> Tuple[str, int]:
    """ delete user by id """
    user = Users.query.filter_by(user_id=user_id).one_or_none()
    if not user:
        return f'User {user_id} does not exist', 400
    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while deleting the user', 500
    return f'{user_id} deleted successfully', 200