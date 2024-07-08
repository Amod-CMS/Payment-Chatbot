
// class PaymentComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             currency: 'INR',
//             paymentStatus: null,
//             receiptUrl: null,
//             isLoading: false,
//             paymentAttempted: false, // Added to track whether a payment attempt has been made
//         };
//         this.handlePayment = this.handlePayment.bind(this);
//     }

//     componentDidMount() {
//         const script = document.createElement('script');
//         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//         script.async = true;
//         document.head.appendChild(script);
//     }

//     componentWillUnmount() {
//         const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
//         if (script) {
//             document.head.removeChild(script);
//         }
//     }

//     async handlePayment() {
//         const { currency } = this.state;
//         this.setState({ isLoading: true, paymentStatus: null, paymentAttempted: true }); // Indicate loading and payment attempt
//         try {
//             const response = await axios.post('http://localhost:5000/create_order', {
//                 amount: billAmt * 100, // Ensure billAmt is defined or passed as a prop
//                 currency,
//             });

//             const orderData = response.data;
//             console.log(orderData.amount);
//             const options = {
//                 key: 'rzp_test_GzwTMEbXRNMYpY',
//                 amount: orderData.amount,
//                 currency: 'INR',
//                 name: "Amod's Chatbot",
//                 description: 'Payment for your utility bill',
//                 order_id: orderData.id,
//                 handler: async (response) => {
//                     try {
//                         const transactionResponse = await axios.post('http://localhost:5000/commitTransaction', {
//                             "Order_id": orderData.id,
//                             "PaymentId": response.razorpay_payment_id,
//                             "Signature": response.razorpay_signature
//                         });
//                         const receiptUrl = transactionResponse.data;
//                         this.setState({
//                             paymentStatus: 'Your payment is successful.',
//                             receiptUrl: receiptUrl,
//                             isLoading: false
//                         });

//                         setTimeout(() => {
//                             this.props.triggerNextStep();
//                         }, 5000);
//                     } catch (error) {
//                         console.error('Error committing transaction:', error);
//                         this.setState({ paymentStatus: 'Error committing transaction. Please try again.', isLoading: false });
//                     }
//                 },
//                 prefill: {
//                     name: 'Customer Name',
//                     email: 'customer@example.com',
//                     contact: '9999999999',
//                 },
//                 notes: {
//                     "reference_no": KonePaymentId // Ensure KonePaymentId is defined or passed as a prop
//                 },
//                 theme: {
//                     color: '#F37254',
//                 },
//                 modal: {
//                     ondismiss: () => {
//                         this.setState({ paymentStatus: 'Payment unsuccessful.', isLoading: false });
//                     },
//                 },
//             };
//             const rzp1 = new window.Razorpay(options);
//             rzp1.open();
//         } catch (error) {
//             console.error('Error creating order:', error);
//             this.setState({ paymentStatus: 'Error creating order. Please try again.', isLoading: false });
//         }
//     }

//     render() {
//         const { paymentStatus, receiptUrl, isLoading, paymentAttempted } = this.state;

//         return (
//             <div>
//                 {isLoading && <p>Your payment is processing... Don't close or refresh the page.</p>}
//                 {!isLoading && !paymentAttempted && <button onClick={this.handlePayment}>Make Payment</button>}
//                 {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
//                 {receiptUrl && (
//                     <p>
//                         <a target='_blank' rel='noreferrer' href={receiptUrl} download>Download Receipt</a>
//                     </p>
//                 )}
//             </div>
//         );
//     }
// }

// PaymentComponent.propTypes = {
//     steps: PropTypes.object,
//     triggerNextStep: PropTypes.func,
// };

// PaymentComponent.defaultProps = {
//     steps: undefined,
//     triggerNextStep: undefined,
// };
// Electricity code ends