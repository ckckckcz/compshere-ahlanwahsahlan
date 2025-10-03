import io
import qrcode
import random
import string

class OrderController:
    def __init__(self, database, snap, core_api):
        self.__model = database
        self.__snap = snap
        self.__core_api = core_api

    def get_order_by_id_user(self, id_user):
        data = self.__model.get_order_by_id_user(id_user)
        return data
    
    def get_order_by_code_and_nik(self, order_code, nik):
        data = self.__model.get_order_by_code_and_nik(order_code, nik)
        return data
    
    def get_status_payment(self, id_order):
        return self.__core_api.transactions.status(id_order)
    
    def __generate_order_code(self, length):
        characters = string.ascii_uppercase + string.digits 
        order_code = ''.join(random.choices(characters, k=length))
        return order_code
    
    def create_transaction(self, data):
        id_user = data['id_user']
        gross_amount = data['gross_amount']
        id_family = data['id_family']
        id_dummy = data['id']

        order_code = self.__generate_order_code(6)

        order = self.__model.add_order(id_user, gross_amount, id_dummy, order_code)

        order_id = order['id']

        seat = self.__model.add_seat(id_family, order_id)

        user = self.__model.get_user_by_id(id_user)

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
    
    def __generate_qr_code(self, id_order):
        data = f"order:{id_order}"

        img = qrcode.make(data)

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        file_bytes = buffer.getvalue()
        buffer.seek(0)

        filename = f"qr_{id_order}.png"

        return filename, file_bytes, buffer
    
    def payment_callback(self, midtrans_notification):
        status = self.__core_api.transactions.notification(midtrans_notification)
        order_id = status.get("order_id")
        transaction_status = status.get("transaction_status")
        fraud_status = status.get("fraud_status")

        status = 'success'
        foto = None
        
        if transaction_status == 'capture':
            if fraud_status == 'challenge':
                status = 'challenge'
            elif fraud_status == 'accept':
                status = 'success'
                filename, file_bytes, _ = self.__generate_qr_code(order_id)
                foto = self.__model.store_qrcode(filename, file_bytes, "image/png")
        elif transaction_status == 'cancel' or transaction_status == 'deny' or transaction_status == 'expire':
            status = 'failure'
        elif transaction_status == 'pending':
            status = 'pending'
        elif transaction_status == 'settlement':
            status = 'success'
            filename, file_bytes, _ = self.__generate_qr_code(order_id)
            foto = self.__model.store_qrcode(filename, file_bytes, "image/png")
        
        data = {'status': status, 'qr_code': foto}
        r = self.__model.update_order_by_id(order_id, data)
        return status
