from sqlalchemy import Column, Integer, String, BLOB, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'login'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(50), unique=False, nullable=False)
    last_name = Column(String(50), unique=False, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    credential = Column(String(50), unique=False, nullable=False)
    
    # Relationship to OriginalFiles
    original_files = relationship('OriginalFile', back_populates='user')

    def __repr__(self):
        return f'<User(user_id={self.user_id}, first_name={self.first_name}, last_name={self.last_name}, email={self.email}, credential={self.credential})>'

class OriginalFile(Base):
    __tablename__ = 'original_files'

    file_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('login.user_id'), nullable=False)
    file_name = Column(String(150), nullable=False)
    file_content = Column(BLOB, nullable=False)
    original_language = Column(String(50), nullable=False)
    upload_date = Column(DateTime, nullable=False)

    # Relationship to User
    user = relationship("User", back_populates="original_files")

    # Relationship to TranslatedFiles
    translated_files = relationship("TranslatedFile", order_by="TranslatedFile.file_id", back_populates="original_file")

    def __repr__(self):
        return f'<OriginalFile(file_id={self.file_id}, user_id={self.user_id}, file_name={self.file_name}, file_content={self.file_content}, original_language={self.original_language}, upload_date={self.upload_date})>'

class TranslatedFile(Base):
    __tablename__ = 'translated_files'

    file_id = Column(Integer, primary_key=True, autoincrement=True)
    og_file_id = Column(Integer, ForeignKey('original_files.file_id'), nullable=False)
    file_content = Column(BLOB, nullable=False)
    translated_language = Column(String(50), nullable=False)
    upload_date = Column(DateTime, nullable=False)

    # Relationship to OriginalFile
    original_file = relationship("OriginalFile", back_populates="translated_files")

    def __repr__(self):
        return f'<TranslatedFile(file_id={self.file_id}, og_file_id={self.og_file_id}, file_content={self.file_content}, translated_language={self.translated_language}, upload_date={self.upload_date})>'
