import React, { Component } from 'react';
import {Loading} from 'react-simple-chatbot'
import { getElectricityBillDetails } from '../Electricity/electricityState';

let billAmt
let orderID

class ElectricityPaymentDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            result: '',
            trigger: false,
        };

        this.triggetNext = this.triggetNext.bind(this);
    }
    componentDidMount() {
        this.triggetNext()
    }

    UNSAFE_componentWillMount() {
        const self = this;
        const queryUrl = `http://localhost:5000/fetchElectricityPayment`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            const FinalAmount = getElectricityBillDetails();
            console.log(FinalAmount);
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    const bindings = JSON.parse(this.responseText);
                    console.log(bindings);
                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        billAmt = FinalAmount.CurrentDemand + bindings.Result.ResponseData.ServiceCharge + bindings.Result.ResponseData.UserCharge
                        console.log(billAmt);
                        console.log("-------> " + billAmt);
                        orderID = [
                            "ServiceCharge: " + bindings.Result.ResponseData.ServiceCharge,
                            "UserCharge: " + bindings.Result.ResponseData.UserCharge,
                            "Total Amount: " + billAmt
                        ];
                        self.setState({ loading: false, result: orderID });
                    } else {
                        orderID = [
                            bindings.Result.Reason
                        ];
                        self.setState({ loading: false, result: orderID });
                    }
                } else {
                    self.setState({ loading: true, result: orderID });
                }
            }
        }

        const data = {
            "ServiceId": 77,
            "CityId": 2
        };
        xhr.open('POST', queryUrl);
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data));
    }

    triggetNext() {
        this.setState({ trigger: true }, () => {
            this.props.triggerNextStep();
        });
    }

    render() {
        const { trigger, loading } = this.state;
        return (
            <div className="WaterBill">
                {loading ? <Loading /> : <div>
                    <p>Charges details:</p>
                    {orderID.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>}
                {
                    !loading &&
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 20,
                        }}
                    >
                        {
                            !trigger &&
                            <button>
                                Continue
                            </button>
                        }
                    </div>
                }
            </div>
        );

    }
}

export default ElectricityPaymentDetails