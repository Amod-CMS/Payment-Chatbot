import React, { useCallback, useEffect, useState } from "react";
import { setElectricityBillDetails } from "./electricityState";

function FetchElectricityBill({ steps, triggerNextStep }) {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState([]);

    const fetchData = useCallback(async () => {
        const AccountId = steps.getElectricityRegNo.value;
        const queryUrl = `http://localhost:5000/fetchElectricityBillDetails`;

        setLoading(true);
        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ AccountId })
            });

            const data = await response.json();
            if (data.Result.ResponseVal === 1) {
                const displayInfo = data.Result.ResponseData;
                if (displayInfo && displayInfo.CurrentDemand) {
                    const electricityBillDetails = [
                        "Bill Number: " + displayInfo.BillNumber,
                        "Bill Date: " + displayInfo.BillDate,
                        "Bill Amount: " + displayInfo.CurrentDemand,
                    ];
                    console.log(electricityBillDetails)
                    setElectricityBillDetails(displayInfo);
                    setResult(electricityBillDetails);
                    triggerNextStep({ trigger: 'displayDetailsElectricity' });
                } else {
                    triggerNextStep({ trigger: 'anotherBill' });
                }
            } else {
                // Handling cases where ResponseVal is not 1
                setResult([data.Result.Reason]);
                triggerNextStep({ trigger: 'anotherBill' });
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            setResult(['Error fetching data']);
            triggerNextStep({ trigger: 'anotherBill' });
        } finally {
            setLoading(false);
        }
    }, [steps.getElectricityRegNo.value, triggerNextStep]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <p>Electricity Bill Details:</p>
                    {result.map((detail, index) => (
                        <p key={index}>{detail}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FetchElectricityBill;