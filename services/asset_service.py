from models import Assets, Users
from typing import List, Dict, Tuple, Literal
from database import db
from .utils import get_eastern_time, time_to_string

def log_transaction(transaction_type: Literal["in", "out"], asset: Assets) -> None:
    """ logs a transaction by type and asset information """
    with open("instance/asset_log.csv", "a") as f:
        f.write(f'{transaction_type},{asset.get_csv_string()}\n')

def get_assets() -> List[Dict]:
    """ get all assets """
    assets = Assets.query.all()
    assets_list = []
    for asset in assets:
        assets_list.append({
            'asset_id': str(asset.asset_id),
            'name': asset.name,
            'type': asset.type,
            'checked_out_by': asset.checked_out_by,
            'time_checked': asset.time_checked,
        })
    return assets_list

def get_checked_out_assets() -> List[Dict]:
    """ get assets that are checked out """
    assets = Assets.query.filter(Assets.checked_out_by != None).all()
    assets_list = []
    for asset in assets:
        id = asset.checked_out_by
        user = db.session.query(Users).filter(
            Users.user_id == id).one_or_none()
        assets_list.append({
            'asset_id': asset.asset_id,
            'name': asset.name,
            'type': asset.type,
            'checked_out_by': user.first_name + ' ' + user.last_name,
            'time_checked': time_to_string(asset.time_checked),
        })
    return assets_list

def add_asset(asset_id, asset_name, asset_type) -> Tuple[str, int]:
    """ add asset (id, name, type )"""
    if not isinstance(asset_id, int):
        asset_id = None
    asset = Assets(asset_id=asset_id, name=asset_name, type=asset_type)
    try:
        db.session.add(asset)
        db.session.commit()
        return f'Asset {asset_name} has been added successfully', 200
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while adding the asset', 500

def edit_asset(asset_id, edited_id, edited_name, edited_type) -> Tuple[str, int]:
    """ edit asset (id, name, and type) by id """
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    if not asset:
        return f'Asset {asset_id} does not exist', 400
    try:
        asset.asset_id = edited_id
        asset.name = edited_name
        asset.type = edited_type

        db.session.commit()
        return f'Asset {asset.name} has been updated successfully', 200
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while updating the asset', 500

def delete_asset(asset_id) -> Tuple[str, int]:
    """ delete asset by id """
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    if not asset:
        return f'Asset {asset_id} does not exist', 400
    try:
        db.session.delete(asset)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return f'An error: {e} occurred while deleting the asset', 500
    return f'{asset.name} deleted successfully', 200

def check_out_asset(asset_id, user_id) -> Tuple[str, int]:
    """ check out asset by id with user by user id """
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    user = Users.query.filter_by(user_id=user_id).one_or_none()
    if not user:
        return f'User does not exist', 400
    if not asset:
        return f'Asset {asset_id} does not exist', 400
    if asset.checked_out_by:
        return f'{asset.name} already checked out', 400
    asset.checked_out_by = user.user_id
    asset.time_checked = get_eastern_time()
    db.session.commit()
    log_transaction("out", asset)
    return f'{asset.name} checked out by {user.first_name} {user.last_name}', 200


def check_in_asset(asset_id) -> Tuple[str, int]:
    """ checks in asset by id """
    asset = Assets.query.filter_by(asset_id=asset_id).one_or_none()
    if not asset:
        return f'Asset (asset.get_descriptor()) does not exist', 400
    if not asset.checked_out_by:
        return f'Asset {asset.get_descriptor()} already checked in', 400
    log_transaction("in", asset)
    asset.checked_out_by = None
    asset.time_checked = get_eastern_time()
    db.session.commit()
    return f'{asset.get_descriptor()} checked in successfully', 200

