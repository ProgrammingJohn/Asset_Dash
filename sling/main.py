from datetime import datetime, timedelta
from dateutil import parser
import requests, json
from typing import List, Dict, Any

def next_days_iso(delta=7):
    now = datetime.now()
    days_delta = now + timedelta(days=delta)
    
    # ISO 8601
    # date_range = f"{now.strftime('%Y-%m-%dT%H:%M:%SZ')}/{days_delta.strftime('%Y-%m-%dT%H:%M:%SZ')}"
    duration = f'P0Y0M{delta}DT0H0M0S'
    date_range = f"{now.strftime('%Y-%m-%dT%H:%M:%SZ')}/{duration}"
    return date_range

def get_auth_header():
    authorization_token = 'dfd49f8f3ed646bc9165c2b0cebff14e'
    return {
        "Authorization": authorization_token,
        "accept": "*/*"
    }

def get_request(url_endpoint, params=None):
    server = "api.getsling.com"
    url = f"https://{server}{url_endpoint}"
    headers = get_auth_header()
    response = requests.get(url, headers=headers, params=params)
    response = response.content.decode()
    return json.loads(response)

def get_calendar(org_id, user_id, days_in_advance = 14):

    url = f"/calendar/{org_id}/users/{user_id}"
    params = {
        "dates": next_days_iso(delta=days_in_advance)
    }
    response = get_request(url, params=params)
    return response

def get_shift(event_id):
    url = f"/shifts/{event_id}/detailed"
    response = get_request(url)
    return response

def get_organization(org_id=957702):
    url = f"/organisations/{org_id}"
    response = get_request(url)
    return response

def get_shift_templates():
    url = f"/shift/templates"
    response = get_request(url)
    return response

def get_user(user_id):
    url= f"/users/{user_id}"
    response = get_request(url)
    return response

def iso_to_datetime(iso_string):
    return parser.isoparse(iso_string)


def get_location_names():
    location_names = {}
    for template in get_shift_templates():
        location_names[template["locationId"]] = template["name"] 
    return location_names

def get_full_events(org_id, user_id, days_in_advance=14) -> List[Dict]:
    location_names = get_location_names()
    events = []
    raw_events = get_calendar(org_id, user_id, days_in_advance=days_in_advance)
    for event in raw_events:
        user_obj = None
        id = event['id']
        location_id = event["location"]["id"]
        location_name = location_names[location_id]
        date_start = event['dtstart']
        date_end = event['dtend']
        try:
            user_id = event['user']['id']
            user = get_user(user_id)
            user_obj = {'id': user['id'],
                       'first_name': user['name'],
                       'last_name': user['lastname']}
        except:
            pass
    
        events.append({
            'id': id,
            'location_id': location_id,
            'location_name': location_name,
            'date_start': date_start,
            'date_end': date_end,
            'worker': user_obj
        })
    return events

if __name__ == "__main__":
    print(get_full_events())
    pass

