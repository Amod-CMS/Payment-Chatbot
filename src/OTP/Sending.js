import React, { useCallback, useEffect, useState } from "react";
let FirstName = "";

function SendOTP({ steps, triggerNextStep, onFirstNameChange }) {
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const vehicleNum = steps['mobile-number-input'].value;
        const queryUrl = `http://localhost:5000//userOTP`;

        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vehicleNum,
                    OTP: "123456"
                })
            });

            const data = await response.json();
            console.log("line 92" + data);
            if (data.Result.ResponseVal === 1) {
                const displayInfo = data.Result.ResponseData;
                FirstName = displayInfo.FirstName;
                console.log(FirstName.length);
                if (displayInfo.FirstName) {
                    onFirstNameChange(displayInfo.FirstName);
                    triggerNextStep({ trigger: 'otpRead' });
                } else {
                    triggerNextStep({ trigger: 'otpRead' });
                }
            } else {
                triggerNextStep({ trigger: 'end' });
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            triggerNextStep({ trigger: 'end' });
        } finally {
            setLoading(false);
        }
    }, [steps, triggerNextStep, onFirstNameChange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div>
            {loading ? <div>Loading...</div> : null}
        </div>
    );
}

export default SendOTP;