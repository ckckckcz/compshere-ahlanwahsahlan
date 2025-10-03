class SeatController:
    def __init__(self, database):
        self.__model = database

    def get_seat_by_id_order(self, id_order):
        return self.__model.get_seat_by_id_order(id_order)
    
    def add_seat(self, data):
        return self.__model.add_seat(data)

    