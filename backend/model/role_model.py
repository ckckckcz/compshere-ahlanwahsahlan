class RoleModel:
    def __init__(self, database):
        self.__database = database

    def get_role_by_role(self, role_name):
        response = self.__database.table('role').select('*').eq('role', role_name).execute()
        return response.data[0] if response.data else None
