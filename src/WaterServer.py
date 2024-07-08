import json
from urllib.request import Request, urlopen
from flask import Flask, jsonify, request
from flask import request as R
from flask_cors import CORS
import razorpay
import mysql.connector
import random

# OTP verification
# Fill details
# Options
# Payment
# Database

app = Flask(__name__)
CORS(app)

razorpay_key_id = "rzp_test_GzwTMEbXRNMYpY"
razorpay_key_secret = "a6LN2sj9osPgR8evvf8anAyf"
client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

baseURL = "https://koneapi.cmsuat.co.in:3443/KarnatakaMobileOne/api/1.1/"
userID = 148


@app.route("/userOTP", methods=["POST"])
def fetchOTP():
    global userNameDetails
    global otp
    global userID
    dataReceived = request.json
    otp = random.randint(100000, 999999)
    apiUrl = baseURL + 'Account/AuthenticateUser'
    data = {
        "MobileNumber": dataReceived['mobileNumber'],
        "OTP": otp
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    userNameDetails = urlopen(req).read().decode()
    userNameDetails = json.loads(userNameDetails)
    # userID = userNameDetails['Result']['ResponseData']['UserId']
    userID = 148
    return jsonify(userNameDetails)


@app.route("/verifyOtp", methods=["POST"])
def verifyOTP():
    data = request.json
    userOTP = int(data.get("userOTP"))
    return jsonify(1) if userOTP == otp else jsonify(0)


@app.route("/addUser", methods=['POST'])
def addUser():
    dataReceived = request.json
    apiUrl = baseURL + "Account/updateMobileuserinfo"
    data = {
        "UserId": userID,
        "FirstName": dataReceived['firstName'],
        "LastName": dataReceived['lastName'],
        "PinCode": dataReceived['pinCode'],
        "Profession": "Profession"
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    addUser = urlopen(req).read().decode()
    addUser = json.loads(addUser)
    return addUser


@app.route("/dashBoard", methods=['POST'])
def dashBoard():
    apiUrl = baseURL + "Services/GetDepartmentsCityandServices"
    req = Request(apiUrl, {})
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", "148")
    addUser = urlopen(req).read().decode()
    addUser = json.loads(addUser)
    return addUser


@app.route("/fetchElectricityBillDetails", methods=["POST"])
def fetch_data_electricity_bill():
    global electricityBillDeatilsResponse
    global electricityBillDetails
    data = R.get_json()
    regNo = data.get("AccountId")
    apiUrl = baseURL + "Electricity/ESCOMBillDetailsByAccNo"
    data = {
        "AccountId": regNo,
        "SubdivisionType": "BESCOM",
        "DuplicateCheckRequired": "N",
        "CityCode": "",
        "ServiceCityId": "6",
        "CityId": "0"
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    electricityBillDetails = urlopen(req).read().decode()
    electricityBillDeatilsResponse = json.loads(electricityBillDetails)[
        "Result"]["ResponseData"]
    jsonify(electricityBillDetails)
    electricityBillDetails = json.loads(electricityBillDetails)
    return electricityBillDetails


@app.route("/fetchElectricityPayment", methods=["POST"])
def fetch_data_electricity_payment():
    global electricityBillPaymodeResponse
    global electricityPaymodeDetails
    data = R.get_json()
    apiUrl = baseURL + "Services/PaymodeDetails"
    data = {
        "ServiceId": 77,
        "CityId": 2
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    electricityPaymodeDetails = urlopen(req).read().decode()
    jsonify(electricityPaymodeDetails)
    electricityBillPaymodeResponse = json.loads(electricityPaymodeDetails)[
        "Result"]["ResponseData"]
    electricityPaymodeDetails = json.loads(electricityPaymodeDetails)
    return electricityPaymodeDetails


@app.route("/fetchElectricityOrderID", methods=["POST"])
def fetch_data_electricity_order_id():
    data = R.get_json()
    regNo = data.get("BillDetails", {}).get("regNo")
    apiUrl = baseURL + "Electricity/ESCOMBillPost"
    data = {
        "ServiceDetails": {
            "ServiceCode": 6,
            "CityCode": "BN",
            "ServiceId": 77,
            "EventId": 0,
            "EQMSTimeStamp": "2024-02-07",
            "DuplicateCheckRequired": "N"
        },
        "PaymentDetails": {
            "ServiceCharge": electricityBillPaymodeResponse['ServiceCharge'],
            "UserCharge": electricityBillPaymodeResponse['UserCharge'],
            "DeptCharge": electricityBillPaymodeResponse['DeptUserCharge'],
            "TotalBill": electricityBillDeatilsResponse['CurrentDemand'] + electricityBillPaymodeResponse['UserCharge'] + electricityBillPaymodeResponse['DeptUserCharge'],
            "ChargePercentage": electricityBillPaymodeResponse['ChargePercentage'],
            "CardType": "RazorPayMUPI",
            "PayType": "RAZORPAY",
            "ChargeType": "F",
            "ChargeValue": electricityBillPaymodeResponse['ChargeValue'],
            "AmountPaid": electricityBillDeatilsResponse['CurrentDemand'],
        },
        "BillDetails": {
            "CustomerName": electricityBillDeatilsResponse['CustomerName'],
            "AccountId": electricityBillDeatilsResponse['AccountId'],
            "BillNumber": electricityBillDeatilsResponse['BillNumber'],
            "SubDivision": electricityBillDeatilsResponse['SubDivision'],
            "EnableStatus": electricityBillDeatilsResponse['EnableStatus'],
            "SubDivisionCompany": electricityBillDeatilsResponse['SubDivisionCompany'],
            "BillDate": electricityBillDeatilsResponse['BillDate'],
            "AllowCheque": electricityBillDeatilsResponse['AllowCheque'],
            "IsSecurityDepositPaid": electricityBillDeatilsResponse['IsSecurityDepositPaid'],
            "Address": electricityBillDeatilsResponse['Address'],
            "AllowedPartialPayment": electricityBillDeatilsResponse['AllowedPartialPayment'],
            "DueSecurityDeposit": electricityBillDeatilsResponse['DueSecurityDeposit'],
            "CurrentDemand": electricityBillDeatilsResponse['CurrentDemand'],
            "AccountCode": electricityBillDeatilsResponse['AccountCode'],
            "IsPaid": electricityBillDeatilsResponse['IsPaid'],
            "CityCode": electricityBillDeatilsResponse['CityCode'],
            "ServiceCityId": electricityBillDeatilsResponse['ServiceCityId'],
            "CityId": electricityBillDeatilsResponse['CityId'],
            "RowIndex": electricityBillDeatilsResponse['RowIndex'],
            "TransactionNumber": electricityBillDeatilsResponse['TransactionNumber'],
            "Receipt": electricityBillDeatilsResponse['Receipt'],
            "Response": {
                "ResponseVal": electricityBillDeatilsResponse['Response']['ResponseVal'],
                "Reason": electricityBillDeatilsResponse['Response']['Reason'],
            },
            "AmountPaid": electricityBillDeatilsResponse['CurrentDemand'],
            "EventId": 0,
            "OrderInfo": "null",
            "StockItem": {
                "StockName": "null",
                "TransactionCount": 1
            }
        }
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    response = urlopen(req).read().decode()
    jsonify(response)
    global custom_order_id
    custom_order_id = json.loads(response)["Result"]["ResponseData"]["orderid"]
    response = json.loads(response)
    return response


@app.route("/commitTransaction", methods=["POST"])
def fetch_data_commit_transaction():
    data = R.get_json()
    apiUrl = baseURL + "Payment/CommitTransaction"
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header("Content-Type", "application/json")
    req.add_header("auth_userid", "148")
    transactionResponse = urlopen(req).read().decode()
    jsonify(transactionResponse)
    transactionResponse = json.loads(transactionResponse)
    receipt_url = transactionResponse['Result']['ResponseData']['ReceiptURL']
    return receipt_url

# RC Extract Starts


@app.route("/fetchRCDetails", methods=["POST"])
def fetch_data_RC():
    global rcExtractDetails
    data = R.get_json()
    vehicleNum = data.get("RegNo")
    apiUrl = baseURL + 'RTOServices/RCExtractFetchDetails'
    data = {
        "RegNo": vehicleNum,
        "DuplicateCheckRequired": "N",
        "CityCode": "BN",
        "ServiceCityId": "7",
        "CityId": 2
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    rcExtractDetails = urlopen(req).read().decode()
    jsonify(rcExtractDetails)
    rcExtractDetails = json.loads(rcExtractDetails)
    return rcExtractDetails


@app.route("/fetchRcPayment", methods=["POST"])
def fetch_data_rc_payment():
    data = R.get_json()
    apiUrl = baseURL + "Services/PaymodeDetails"
    data = {
        "ServiceId": data['ServiceId'],
        "CityId": data['CityId']
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    global rcPaymodeDetails
    rcPaymodeDetails = urlopen(req).read().decode()
    jsonify(rcPaymodeDetails)
    rcPaymodeDetails = json.loads(rcPaymodeDetails)
    return rcPaymodeDetails


@app.route("/fetchRcOderId", methods=["POST"])
def fetch_data_rc_orderId():
    global orderIdResponse
    global orderIdDetails
    data = R.get_json()
    apiUrl = baseURL + "RTOServices/RCExtractPost"
    data = {
        "ServiceDetails":
            {
                "ServiceCode": 15,
                "CityCode": "BN",
                "ServiceId": 7,
                "EQMSTimeStamp": "2023-03-15",
                "DuplicateCheckRequired": "N"
            },
            "PaymentDetails": {
                "ServiceCharge": rcPaymodeDetails['Result']['ResponseData']['ServiceCharge'],
                "UserCharge": rcPaymodeDetails['Result']['ResponseData']['UserCharge'],
                "DeptCharge": rcPaymodeDetails['Result']['ResponseData']['DeptUserCharge'],
                "TotalBill": 25,
                "ChargePercentage": rcPaymodeDetails['Result']['ResponseData']['ChargePercentage'],
                "CardType": "RazorPayMUPI",
                "PayType": "RAZORPAY",
                "ChargeType": "F",
                "ChargeValue": 0,
                "AmountPaid": rcPaymodeDetails['Result']['ResponseData']['ServiceCharge']
            },
        "BillDetails": {
                "RegistrationNo": rcExtractDetails['Result']['ResponseData']['RegistrationNo'],
                "RTOCode": rcExtractDetails['Result']['ResponseData']['RTOCode'],
                "RTOName": rcExtractDetails['Result']['ResponseData']['RTOName'],
                "OwnerName": rcExtractDetails['Result']['ResponseData']['OwnerName'],
                "ChasisNo": rcExtractDetails['Result']['ResponseData']['ChasisNo'],
                "ApplicantName": "Amod Nagpal",
                "MobileNo": "+91 8529776050",
                "EMail": "amod_nagpal@cms.co.in",
                "Address": "cms computers",
                "Response": {
                    "ResponseVal": True,
                    "Reason": None
                },
                "AmountPaid": rcPaymodeDetails['Result']['ResponseData']['ServiceCharge'],
            },
        "ResponseVal": 1,
        "Reason": None
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    orderIdDetails = urlopen(req).read().decode()
    jsonify(orderIdDetails)
    orderIdResponse = json.loads(orderIdDetails)["Result"]["ResponseData"]
    global custom_order_id
    custom_order_id = (orderIdResponse)["orderid"]
    orderIdDetails = json.loads(orderIdDetails)

    return orderIdDetails

# RC Code ends

# Property Tax Starts


@app.route("/propertyTax", methods=["POST"])
def fetch_data_property_tax():
    global propertyTaxDetails

    data = request.get_json()
    PID = data.get("PID")

    apiUrl = 'https://koneapi.cmsuat.co.in:3443/KarnatakaMobileOne/api/1.1/PropertyTaxMysore/MysorePropertyTaxFetchData'
    data = {
        "PID": PID
    }

    # Converting the JSON data from single quote to double quote
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)

    try:
        propertyTaxDetails = urlopen(req).read().decode()
        propertyTaxDetails = json.loads(propertyTaxDetails)
        return jsonify(propertyTaxDetails)
    except Exception as e:
        return jsonify({'error': str(e)})


@app.route("/propertyTaxChages", methods=["POST"])
def fetch_data_property_charges():
    data = R.get_json()
    apiUrl = baseURL + "Services/PaymodeDetails"
    data = {
        "ServiceId": data['ServiceId'],
        "CityId": data['CityId']
    }
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    global propertyTaxCharges
    propertyTaxCharges = urlopen(req).read().decode()
    jsonify(propertyTaxCharges)
    propertyTaxCharges = json.loads(propertyTaxCharges)
    return propertyTaxCharges


@app.route("/propertyTaxOrderId", methods=["POST"])
def fetch_data_property_tax_order_id():
    global orderIdResponse
    global orderIdDetails
    data = R.get_json()
    apiUrl = 'https://koneapi.cmsuat.co.in:3443/KarnatakaMobileOne/api/1.1/PropertyTaxMysore/MysorePropertyTaxPostData'
    data = {
        "ServiceDetails": {
            "ServiceCode": 21,
            "CityCode": "MY",
            "ServiceId": 266,
            "EQMSTimeStamp": "2023-11-13",
            "DuplicateCheckRequired": "N"
        },
        "PaymentDetails": {
            "ServiceCharge": propertyTaxCharges['Result']['ResponseData']['ServiceCharge'],
            "UserCharge": propertyTaxCharges['Result']['ResponseData']['UserCharge'],
            "DeptCharge": propertyTaxCharges['Result']['ResponseData']['DeptUserCharge'],
            "TotalBill": propertyTaxDetails['Result']['ResponseData']
            ['PropertyTaxMysuruPaymentList'][0]['PayableAmount'],
            "ChargePercentage":  propertyTaxCharges['Result']['ResponseData']['ChargePercentage'],
            "CardType": "RazorPayMUPI",
            "PayType": "RAZORPAY",
            "ChargeType": "F",
            "ChargeValue": 0,
            "AmountPaid": propertyTaxDetails['Result']['ResponseData']
            ['PropertyTaxMysuruPaymentList'][0]['PayableAmount']
        },
        "BillDetails": {
            "FirstName": propertyTaxDetails['Result']['ResponseData']['FirstName'],
            "MiddleName": propertyTaxDetails['Result']['ResponseData']['MiddleName'],
            "LastName": propertyTaxDetails['Result']['ResponseData']['LastName'],
            "Address": propertyTaxDetails['Result']['ResponseData']['Address'],
            "PropertyNo": propertyTaxDetails['Result']['ResponseData']['PropertyNo'],
            "Mobile": propertyTaxDetails['Result']['ResponseData']['Mobile'],
            "WardNo": propertyTaxDetails['Result']['ResponseData']['WardNo'],
            "PID": propertyTaxDetails['Result']['ResponseData']['PID'],
            "SelectedYear": None,
            "PTaxCityId": 0,
            "TotalAmountInWords": None,
            "PropertyTaxMysuruPaymentList": [
                {
                    "AssessmentYear": propertyTaxDetails['Result']['ResponseData']
                    ['PropertyTaxMysuruPaymentList'][0]['AssessmentYear'],
                    "SASID": propertyTaxDetails['Result']['ResponseData']
                    ['PropertyTaxMysuruPaymentList'][0]['SASID'],
                    "Tax": propertyTaxDetails['Result']['ResponseData']
                    ['PropertyTaxMysuruPaymentList'][0]['Tax'],
                    "Cess": propertyTaxDetails['Result']['ResponseData']
                    ['PropertyTaxMysuruPaymentList'][0]['Cess'],
                    "Cess": propertyTaxDetails['Result']['ResponseData']
                    ['PropertyTaxMysuruPaymentList'][0]['Cess'],
                    "Penalty": propertyTaxDetails['Result']['ResponseData']
                    ['PropertyTaxMysuruPaymentList'][0]['Penalty'],
                    "PayableAmount": propertyTaxDetails['Result']['ResponseData']
                    ['PropertyTaxMysuruPaymentList'][0]['PayableAmount']
                }
            ]
        },
        "AmountPaid": propertyTaxDetails['Result']['ResponseData']
        ['PropertyTaxMysuruPaymentList'][0]['PayableAmount'],
        "EventId": propertyTaxDetails['Result']['ResponseData']['EventId'],
        "OrderInfo": None,
        "StockItem": {
            "StockName": None,
            "TransactionCount": 1
        }

    }
    # Converting the json data from single quote to double quote
    data1 = json.dumps(data)
    req = Request(apiUrl, data1.encode())
    req.add_header("Authorization", "Basic a29uZW1vYjprb25lbW9i")
    req.add_header('Content-Type', 'application/json')
    req.add_header("auth_userid", userID)
    orderIdDetails = urlopen(req).read().decode()
    jsonify(orderIdDetails)
    orderIdResponse = json.loads(orderIdDetails)["Result"]["ResponseData"]
    global custom_order_id
    custom_order_id = (orderIdResponse)["orderid"]
    orderIdDetails = json.loads(orderIdDetails)
    return orderIdDetails

# Property Tax Ends


@app.route('/create_order', methods=['POST'])
def create_order():
    """
    Create an order.

    This endpoint is used to create an order with the provided amount and currency.

    Parameters:
        JSON data containing 'amount' (in paisa) and 'currency'.

    Returns:
        JSON response containing the created order information or an error message if the creation fails.
    """
    try:
        data = R.get_json()
        amount = data['amount']  # in paisa
        currency = data['currency']

        order_data = {
            'amount': amount,
            'currency': currency,
            'id': custom_order_id,
        }
        order = client.order.create(order_data)
        return jsonify(order)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


mysql_config = {
    'host': '35.154.163.181',
    'database': 'test',
    'user': 'amod',
    'password': 'amod@cms',
    'port': '3306',
}


def insert_data_into_mysql(data):
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**mysql_config)
        cursor = conn.cursor()

        query = "INSERT INTO cbtest (message, billType, consumerID, billAmount, messageTime) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(
            query, (data['welcomeMessage'], data['optionMessage'],
                    data['regNo'], data['billAmt'], data['localDate'])
        )

        conn.commit()
        # print("Inserted data successfully!")
        return True
    except Exception as e:
        # print("Error inserting data into MySQL:", e)
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/insertElectricityBill', methods=['POST'])
def insert_electricity_bill():
    """
    This function performs the necessary operations to insert an electricity
    bill into the database. It retrieves the bill information from some source
    (e.g., an API) and stores it in the appropriate format in the database.

    Parameters:
    None

    Returns:
    None
    """
    data = R.json

    if insert_data_into_mysql(data):
        return jsonify({'message': 'Data inserted successfully into MySQL database'})
    return jsonify({'message': 'Error inserting data into MySQL database'}), 500


if __name__ == "__main__":
    app.run(debug=True)
