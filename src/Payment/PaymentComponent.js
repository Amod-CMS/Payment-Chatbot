import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { bindings } from '../RC/RCorderID';
import { bindings } from '../OrderID/orderID';

const PaymentComponent = ({ billAmt, triggerNextStep }) => {
    const [currency] = useState('INR');
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [receiptUrl, setReceiptUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentAttempted, setPaymentAttempted] = useState(false);

    
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            const scriptToRemove = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (scriptToRemove) {
                document.head.removeChild(scriptToRemove);
            }
        };
    }, []);

    const handlePayment = async () => {
        setIsLoading(true);
        setPaymentStatus(null);
        setPaymentAttempted(true);

        try {
            const response = await axios.post('http://localhost:5000/create_order', {
                amount: billAmt * 100,
                currency,
            });
            console.log("response is ==> ", bindings.Result.ResponseData.amt);
            const orderData = response.data;
            console.log("orderData is ===>", orderData);
            // console.log(orderData.receipt);
            const options = {
                key: 'rzp_test_GzwTMEbXRNMYpY',
                amount: bindings.Result.ResponseData.amt,
                currency: 'INR',
                name: "Amod's Chatbot",
                description: 'Payment for your utility bill',
                order_id: bindings.Result.ResponseData.orderid,
                handler: async (response) => {
                    try {
                        const transactionResponse = await axios.post('http://localhost:5000/commitTransaction', {
                            "Order_id": bindings.Result.ResponseData.orderid,
                            "PaymentId": response.razorpay_payment_id,
                            "Signature": response.razorpay_signature
                        });
                        const receiptUrl = transactionResponse.data;
                        setPaymentStatus('Your payment is successful.');
                        setReceiptUrl(receiptUrl);
                        setIsLoading(false);

                        setTimeout(() => {
                            triggerNextStep();
                        }, 5000);
                    } catch (error) {
                        console.error('Error committing transaction:', error);
                        setPaymentStatus('Error committing transaction. Please try again.');
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: 'Customer Name',
                    email: 'customer@example.com',
                    contact: '9999999999',
                },
                notes: {
                    "reference_no": bindings.Result.ResponseData.KonePaymentId,
                    // "reference_no": orderData.receipt,
                },
                theme: {
                    color: '#F37254',
                },
                modal: {
                    ondismiss: () => {
                        setPaymentStatus('Payment unsuccessful.');
                        setIsLoading(false);
                    },
                },
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error('Error creating order:', error);
            setPaymentStatus('Error creating order. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && <p>Your payment is processing... Don't close or refresh the page.</p>}
            {!isLoading && !paymentAttempted && <button onClick={handlePayment}>Make Payment</button>}
            {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
            {receiptUrl && (
                <p>
                    <a target='_blank' rel='noreferrer' href={receiptUrl} download>Download Receipt</a>
                </p>
            )}
        </div>
    );
};

export default PaymentComponent;