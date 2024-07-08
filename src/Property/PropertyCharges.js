import React, { useEffect, useState, useCallback } from "react";

function PropertyCharges({ triggerNextStep }) {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState('');

    const fetchData = useCallback(async () => {
        const queryUrl = `http://localhost:5000/propertyTaxChages`

        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "ServiceId": 266,
                    "CityId": 3
                })
            });

            const data = await response.json();
            if (data.Result.ResponseVal === 1) {
                const details = data.Result.ResponseData;
                console.log(details);
                const taxDetails = [
                    "Service Charge: " + details.ServiceCharge,
                    "User Charge: " + details.UserCharge,
                    "DeptUser Charge: " + details.DeptUserCharge,
                    // "Total Amount: " + billAmt
                ];
                setResult(taxDetails);
            }
            else {
                setResult([data.Result.Reason]);
            }
        }
        catch (error) {
            console.error('Error fetching data: ', error);
            setResult(['Error fetching data']);
        }

        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!loading && result.length > 0) {
            triggerNextStep();
        }
    }, [loading, result, triggerNextStep]);

    return (
        <div className="Tax details">
            {loading ? (
                <div>loading....</div>
            ) : (
                <div>
                    <p>Tax details:</p>
                    {result.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PropertyCharges;