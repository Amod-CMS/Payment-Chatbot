import React, { Component } from 'react';
import { Loading } from 'react-simple-chatbot'

let KonePaymentId;
let orderID
let bindings;

class OrderIDGeneratorElectricity extends Component {
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
        const queryUrl = `http://localhost:5000/fetchElectricityOrderID`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    bindings = JSON.parse(this.responseText);
                    console.log("konepayment " + bindings.Result.ResponseData.KonePaymentId);
                    KonePaymentId = bindings.Result.ResponseData.KonePaymentId
                    if (bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                        orderID = [
                            bindings.Result.ResponseData
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

        // Get the current date in IST (Indian Standard Time)
        var istDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        // Extract date components
        var dateComponents = istDate.split(/\/|, |:| /);
        // Ensure date components are padded properly
        var localDate = `${dateComponents[2]}-${dateComponents[0].padStart(2, '0')}-${dateComponents[1].padStart(2, '0')} ${dateComponents[3].padStart(2, '0')}:${dateComponents[4].padStart(2, '0')}:${dateComponents[5].padStart(2, '0')}`;
        console.log(localDate);

        const dbXHR = new XMLHttpRequest();
        dbXHR.open('POST', 'http://35.154.163.181:5432/insertElectricityBill', true);
        dbXHR.setRequestHeader('Content-Type', 'application/json');
        dbXHR.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log('Line 332 Data sent successfully');
            }
        };
        // console.log("line 105 " + billAmountDetail);
        // dbXHR.send(JSON.stringify({
        //     welcomeMessage,
        //     optionMessage,
        //     regNo,
        //     billAmt,
        //     localDate
        // }));
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
                    <p>Payment Initiated</p>
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

export { KonePaymentId, OrderIDGeneratorElectricity, bindings }