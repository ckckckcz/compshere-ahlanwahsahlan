from urllib.parse import urlparse


class UserModel:
    def __init__(self, database):
        self.__database = database

    def get_user(self):
        response = self.__database.table('user').select('*').execute()
        return response.data
    
    def get_user_by_id(self, id_user):
        response = self.__database.table('user').select('*').eq('id', id_user).execute()
        return response.data[0] if response.data else None
    
    def get_user_by_email(self, email):
        response = self.__database.table('user').select('*').eq('email', email).execute()
        return response.data[0] if response.data else None
    
    def update_user(self, id_user, data):
        response = self.__table.update(data).eq('id', id_user).execute()
        return response.data[0]
    
    def login(self):
        response = self.__database.table('user').select('*').execute()
        return response.data
    
    def add_user(self, email, password, id_role):
        data = {"email": email, "password": password, "id_role": id_role}
        response = self.__database.table('user').insert(data).execute()
        return response.data[0]
    
    def __get_path_from_url(self, url):
        parsed = urlparse(url)
        full_path = parsed.path
        relative_path = full_path.split("/object/public/KAI-bucket/")[-1]
        return relative_path
    

    def store_image(self, filename, file_bytes, file):
        self.__database.storage.from_(self.__bucket).upload(
            path=self.__folder + '/' + filename,
            file=file_bytes,
            file_options={"content-type": file.mimetype or 'application/octet-stream'},
        )

        url = self.__database.storage.from_(self.__bucket).get_public_url(filename)
        return url
    
    def delete_image(self, url):
        path = self.__get_path_from_url(url)
        self.__database.storage.from_(self.__bucket).remove([self.__folder + '/' + path])