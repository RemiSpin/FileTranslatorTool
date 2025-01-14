# database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User, OriginalFile, TranslatedFile, Team, TeamMember
from flask import send_file, request, jsonify
from io import BytesIO
import io
from datetime import datetime

# MySQL Database URL Format: mysql://username:password@host:port/database_name
db_url = 'mysql://root@localhost:3306/team_project'
engine = create_engine(db_url)

Session = sessionmaker(bind=engine)
session = Session()

def get_all_users():
    return session.query(User).all()

def add_user(first_name, last_name, email, credential):
    user = User(first_name=first_name, last_name=last_name, email=email, credential=credential)
    session.add(user)
    session.commit()
    
def validate_user(email_search, credential_search):
    user = session.query(User).filter_by(email=email_search).first()
    if user and user.credential == credential_search:
       return user
    elif user:
        return 1
    else:
        return 2
    
def check_for_email(email_search):
    user = session.query(User).filter_by(email=email_search).first()
    if user:
        return True
    else:
        return False

def add_trans_file(og_file_id, file_content, translated_language, upload_date):
    trans_content = file_content.read()
    sanitized_content = trans_content.replace(b"\xe2\x80\x8b", b" ")
        
    file = TranslatedFile(og_file_id=og_file_id, file_content=sanitized_content, translated_language=translated_language, upload_date=upload_date)
    exists = session.query(TranslatedFile).filter_by(og_file_id=og_file_id, translated_language = translated_language).first()
    if exists:
       return "This file was already translated to this language"
    else:
        session.add(file)
        session.commit()
        return "Translation saved"

def add_original_file(user_id, og_file, src_lang, upload_date):
    try:
        file_content = og_file.read()
        sanitized_content = file_content.replace(b"\xe2\x80\x8b", b" ")
        
        # Create the OriginalFile instance and add it to the session
        original_file = OriginalFile(user_id=user_id, file_name=og_file.filename, file_content=sanitized_content, original_language=src_lang, upload_date=upload_date)
        session.add(original_file)
        session.commit()
        return "Translation Saved"
    except Exception as e:
        session.rollback()  # Rollback the transaction if an error occurs
        print("Error:", e)
        return "Sum Ting Wong"

def get_users_files(user_id):
    # Get user's own files
    original_files = session.query(OriginalFile).filter_by(user_id=user_id).all()
    user_files = {}

    # Add user's own files
    for file in original_files:
        trans_files = session.query(TranslatedFile).filter_by(og_file_id=file.file_id).all()
        translated_languages = [trans_file.translated_language for trans_file in trans_files]
        user_files[file.file_name] = translated_languages

    # Get user's team ID if they're in a team
    team_member = session.query(TeamMember).filter_by(user_id=user_id).first()
    if team_member:
        # Get all team members except current user
        team_members = session.query(TeamMember).filter(
            TeamMember.team_id == team_member.team_id,
            TeamMember.user_id != user_id
        ).all()
        
        # Get files from each team member
        for member in team_members:
            member_files = session.query(OriginalFile).filter_by(user_id=member.user_id).all()
            for file in member_files:
                trans_files = session.query(TranslatedFile).filter_by(og_file_id=file.file_id).all()
                translated_languages = [trans_file.translated_language for trans_file in trans_files]
                # Add "(Team)" suffix to team members' files
                user_files[f"{file.file_name} (Team)"] = translated_languages

    # Convert to table format
    table_data = []
    for key, items in user_files.items():
        items_string = ', '.join(items)
        row = {'Key': key, 'Item': items_string}
        table_data.append(row)

    return table_data

def get_users_og_files(user_id):
    original_files = session.query(OriginalFile).filter_by(user_id=user_id).all()
    file_names = [file.file_name for file in original_files]
    
    return file_names

def get_users_trans_files(user_id):
    original_files = session.query(OriginalFile).filter_by(user_id=user_id).all()
    file_ids = [file.file_id for file in original_files]
    
    all_trans_files = {}
    
    for file_id in file_ids:
        tran_files = session.query(TranslatedFile).filter_by(og_file_id=file_id).all()
        all_trans_files = {file_id : tran_files}
        
    return all_trans_files

def download_file(user_id, og_file_name, trans_lan):
    original_file = session.query(OriginalFile).filter_by(user_id=user_id, file_name=og_file_name).first()
    trans_lan = trans_lan.lstrip()

    if trans_lan == 'none':
        file_content = original_file.file_content
        file_name = og_file_name
    else:
        og_id = original_file.file_id
        translated_file = session.query(TranslatedFile).filter_by(og_file_id=og_id, translated_language=trans_lan).first()
        file_content = translated_file.file_content
        just_name = '-'.join(og_file_name.split('.')[:-1])
        file_name = f"{just_name} ~{trans_lan}.{og_file_name.split('.')[-1]}"
    
    file_data = BytesIO(file_content)
    
    file_data.seek(0)
    
    return send_file(file_data, as_attachment=True, download_name=file_name)

def create_team(team_name, user_id):
    team = Team(team_name=team_name, created_date=datetime.now())
    session.add(team)
    session.commit()
    
    member = TeamMember(team_id=team.team_id, user_id=user_id, join_date=datetime.now())
    session.add(member)
    session.commit()
    return team.team_id

def join_team(team_id, user_id):
    # Convert string inputs to integers
    try:
        team_id = int(team_id)
        user_id = int(user_id)
    except ValueError:
        raise Exception("Invalid team ID or user ID format")

    # Check if team exists
    team = session.query(Team).filter_by(team_id=team_id).first()
    if not team:
        raise Exception("Team does not exist")

    # Check if user is already in team
    existing_member = session.query(TeamMember).filter_by(
        team_id=team_id, 
        user_id=user_id
    ).first()
    
    if existing_member:
        raise Exception("User is already a member of this team")
        
    member = TeamMember(team_id=team_id, user_id=user_id, join_date=datetime.now())
    session.add(member)
    session.commit()

def leave_team(user_id):
    try:
        member = session.query(TeamMember).filter_by(user_id=user_id).first()
        if not member:
            raise Exception("User is not a member of any team")
        
        session.delete(member)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e

def get_team_files(team_id):
    team_members = session.query(TeamMember).filter_by(team_id=team_id).all()
    all_files = []
    for member in team_members:
        files = get_users_files(member.user_id)
        all_files.extend(files)
    return all_files

def check_team_membership(user_id):
    member = session.query(TeamMember).filter_by(user_id=user_id).first()
    if member:
        return member.team_id
    return None