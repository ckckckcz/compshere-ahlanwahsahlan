class OrderController:
    def __init__(self, database, snap, core_api):
        self.__model = database
        self.__snap = snap
        self.__core_api = core_api

    def get_status_payment(self, id_order):
        return self.__core_api.transactions.status(id_order)
    def create_transaction(self, order_id, gross_amount, customer_details):
        
        transaction_params = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": gross_amount
            },
            "customer_details": customer_details
        }
        transaction = self.__snap.create_transaction(transaction_params)
        transaction_token = transaction['token']
        return transaction_token
    
    def payment_callback(self, midtrans_notification):
        status = self.__core_api.transactions.notification(midtrans_notification)
        order_id = status.get("order_id")
        transaction_status = status.get("transaction_status")
        fraud_status = status.get("fraud_status")
        print(transaction_status)

        if transaction_status == 'capture':
            if fraud_status == 'challenge':
                return 'challenge'
            elif fraud_status == 'accept':
                return 'success'
        elif transaction_status == 'cancel' or transaction_status == 'deny' or transaction_status == 'expire':
            return 'failure'
        elif transaction_status == 'pending':
            return 'pending'
        elif transaction_status == 'settlement':
            return 'success'
