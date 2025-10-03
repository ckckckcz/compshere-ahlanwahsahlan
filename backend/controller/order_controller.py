class OrderController:
    def __init__(self, database, snap, core_api):
        self.__model = database
        self.__snap = snap
        self.__core_api = core_api

    def get_status_payment(self, id_order):
        return self.__core_api.transactions.status(id_order)
    
    def create_transaction(self, data):
        id_user = data['id_user']
        gross_amount = data['gross_amount']
        print(data)
        order = self.__model.add_order(id_user, gross_amount)

        user = self.__model.get_user_by_id(id_user)

        order_id = order['id']

        if user['nomor_telefon'] is None:
            return {'status': 'error', 'message': 'Nomor telepon belum diisi'}
        
        if user['nama_keluarga'] is None:
            return {'status': 'error', 'message': 'Nama keluarga belum diisi'}
        
        customer_details = {
            "first_name": user['nama_keluarga'],
            "email": user['email'],
            "phone": user['nomor_telefon']
        }

        transaction_params = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": gross_amount
            },
            "customer_details": customer_details
        }

        transaction = self.__snap.create_transaction(transaction_params)
        transaction_token = transaction['token']
        return {'status': 'success', 'data': transaction_token}
    
    def payment_callback(self, midtrans_notification):
        status = self.__core_api.transactions.notification(midtrans_notification)
        order_id = status.get("order_id")
        transaction_status = status.get("transaction_status")
        fraud_status = status.get("fraud_status")
        # print(transaction_status)

        status = 'success'
        if transaction_status == 'capture':
            if fraud_status == 'challenge':
                status = 'challenge'
            elif fraud_status == 'accept':
                status = 'success'
        elif transaction_status == 'cancel' or transaction_status == 'deny' or transaction_status == 'expire':
            status = 'failure'
        elif transaction_status == 'pending':
            status = 'pending'
        elif transaction_status == 'settlement':
            status = 'success'
        
        data = {'status': status}
        r = self.__model.update_order_by_id(order_id, data)
        print(r)
        return status
