class FamilyController:
    def __init__(self, database):
        self.__model = database
    
    def get_family_by_id_user(self, id_user):
        data = self.__model.get_family_by_id_user(id_user)
        return data
    
    def get_family_by_id_user_and_name(self, id_user, name):
        data = self.__model.get_family_by_id_user_and_name(id_user, name)
        return data
    
    def add_family(self, id_user, data):
        family_members = []
        id_user = int(id_user)

        for member in data:
            family_members.append({
                "id_user": id_user,
                "name": member['name'],
                "nik": member['nik'],
                "gender": member['gender']
            })

        print(family_members)

        if family_members:
            data = self.__model.add_family(data)
            return data
        
        return None
    