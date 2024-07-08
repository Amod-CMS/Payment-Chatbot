import React, { useState, useEffect, useCallback } from 'react';

function PropertyTax({ steps, triggerNextStep }) {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState('');

    const fetchData = useCallback(async () => {
        const PID = steps.getPID.value;
        const queryUrl = `http://localhost:5000/propertyTax`;
        
        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ PID })
            });

            const data = await response.json();

            if (data.Result.ResponseVal === 1) {
                const details = data.Result.ResponseData.PropertyTaxMysuruPaymentList[0];
                const PropertyTaxDetails = [
                    "Tax : " + details.Tax,
                    "Cemetery Cess : " + details.CemeteryCess,
                    "Cess : " + details.Cess,
                    "Garden Cess : " + details.GardenCess,
                    "SWM Cess : " + details.SWMCess,
                    "SWM Charges : " + details.SWMCharges,
                    "UnLawfulTax : " + details.UnLawfulTax,
                    "Vehicle Cess : " + details.VehicleCess,
                    "Penalty : " + details.Penalty,
                    "Payable Amount : " + details.PayableAmount,
                ];
                setResult(PropertyTaxDetails);
            } else {
                setResult([data.Result.Reason]);
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            setResult(['Error fetching data']);
        } finally {
            setLoading(false);
        }
    }, [steps]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Trigger next step when loading finishes and data is loaded successfully
    useEffect(() => {
        if (!loading && result.length > 0) {
            triggerNextStep();
        }
    }, [loading, result, triggerNextStep]);

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
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

export default PropertyTax;
