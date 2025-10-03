class SeatModel:
    def __init__(self, database):
        self.__database = database

    def get_seat_by_id_order(self, id_order):
        response = self.__database.table("seat").select("*").eq("id_order", id_order).execute()
        return response.data
    
    # def get_seat_by_id_schedule(self, id_schedule):
    #     response = self.__database.table("seat").select("*").eq("id_schedule", id_schedule).execute()
    #     return response
    
    def add_seat(self, data):
        response = self.__database.table("seat").insert(data).execute()
        return response.data
