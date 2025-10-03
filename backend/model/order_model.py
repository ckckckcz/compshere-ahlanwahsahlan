class OrderModel:
    def __init__(self, database):
        self.__database = database
        self.__bucket = 'KAI-bucket'
        self.__folder = 'QRCode'

    def get_order_by_id_user(self, id_user):
        response = self.__database.table('order').select('*').eq('id_user', id_user).eq('status', 'success').execute()
        return response.data
    
    def add_order(self, id_user, gross_amount, id_dummy):
        data = {"id_user" : id_user, "gross_amount" : gross_amount, "id_dummy" : id_dummy, "status" : "pending"}
        response = self.__database.table('order').insert(data).execute()
        return response.data[0]
    
    def update_order_by_id(self, id_order, data):
        response = self.__database.table('order').update(data).eq('id', id_order).execute()
        return response.data
    
    def store_qrcode(self, filename, file_bytes, mimetype="application/octet-stream"):
        path = f"{self.__folder}/{filename}"
        self.__database.storage.from_(self.__bucket).upload(
            path=path,
            file=file_bytes,
            file_options={"content-type": mimetype}
        )
        url = self.__database.storage.from_(self.__bucket).get_public_url(path)
        return url
    
        # path = f"{self.__folder}/{filename}"

        # self.__database.storage.from_(self.__bucket).upload(
        #     path=path,
        #     file=file_bytes,
        #     file_options={"content-type": file.mimetype or 'application/octet-stream'},
        # )

        # url = self.__database.storage.from_(self.__bucket).get_public_url(path)
        # return url
    
    
