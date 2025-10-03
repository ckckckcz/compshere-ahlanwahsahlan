class FamilyModel:
    def __init__(self, database):
        self.__database = database

    def get_family_by_id_user(self, id_user):
        response = self.__database.table("family").select("*").eq("id_user", id_user).execute()
        return response.data
    
    def get_family_by_id_user_and_name(self, id_user, name):
        response = self.__database.table("family").select("*").eq("id_user", id_user).eq("name", name).execute()
        return response.data[0] if response.data else None
       
    
    def add_family(self, data):
        print("Data before insert:", data)
        response = self.__database.table("family").insert(data).execute()
        return response.data
       