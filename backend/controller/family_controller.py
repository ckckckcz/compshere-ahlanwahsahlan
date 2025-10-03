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
        if isinstance(data, dict):
            data = [data]

        family_members = []
        id_user = int(id_user)

        for member in data:
            if isinstance(member, dict):
                family_members.append({
                    "id_user": id_user,
                    "name": member.get('name'),
                    "nik": member.get('nik'),
                    "gender": member.get('gender')
                })
            
        if family_members:
            data = self.__model.add_family(family_members)
            return data
        
        return None
    