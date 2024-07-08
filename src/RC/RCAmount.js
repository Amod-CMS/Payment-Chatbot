import React, { useState, useEffect } from 'react';

const RCDetails = ({ steps, triggerNextStep }) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState('');
    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const queryUrl = `http://localhost:5000/fetchRcPayment`;
            const data = {
                "ServiceId": 7, // As per your previous code
                "CityId": 2
            };

            try {
                const response = await fetch(queryUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const bindings = await response.json();

                if (response.ok && bindings.Result.ResponseData !== null && bindings.Result.ResponseVal === 1) {
                    let billAmt = bindings.Result.ResponseData.ServiceCharge +
                        bindings.Result.ResponseData.UserCharge +
                        bindings.Result.ResponseData.DeptUserCharge +
                        bindings.Result.ResponseData.ChargeValue;

                    setResult(["Total Amount: " + billAmt]);
                } else {
                    setResult([bindings.Result.Reason]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setResult(['Error fetching data']);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && result.length > 0 && !trigger) {
            setTrigger(true);
            triggerNextStep();
        }
    }, [loading, result, trigger, triggerNextStep]);

    return (
        <div className="WaterBill">
            {loading ? <p>Loading...</p> : (
                <div>
                    <p>RC Charges details:</p>
                    {result.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RCDetails;