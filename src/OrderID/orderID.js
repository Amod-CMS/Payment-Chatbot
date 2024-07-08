import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Loading } from 'react-simple-chatbot'

let KonePaymentId;
let orderID
let bindings;

// RC Extract code begins
class OrderIDGeneratorRC extends Component {
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
        // const { steps } = this.props;

        const queryUrl = `http://localhost:5000/fetchRcOderId`;
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', readyStateChange);

        function readyStateChange() {
            if (this.readyState === 4) {
                if (this.responseText.trim() !== "") {
                    bindings = JSON.parse(this.responseText);
                    console.log(bindings);
                    KonePaymentId = bindings.Result.ResponseData.KonePaymentId
                    console.log(KonePaymentId);
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
            "ServiceId": 7,
            "CityId": 2
        }
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

export { KonePaymentId, OrderIDGeneratorRC, bindings }