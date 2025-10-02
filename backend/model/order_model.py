class OrderModel:
    def __init__(self, database):
        self.__database = database

    def add_order(self, id_user, gross_amount):
        data = {"id_user" : id_user, "gross_amount" : gross_amount, "status" : "pending"}
        response = self.__database.table('order').insert(data).execute()
        return response.data[0]
    
    def update_order_by_id(self, id_order, data):
        response = self.__database.table('order').update(data).eq('id', id_order).execute()
        return response.data