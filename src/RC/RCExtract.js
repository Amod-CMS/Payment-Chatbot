import React, { useEffect, useState, useCallback } from "react";

function RcExtract({ steps, triggerNextStep }) {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState('');

    const fetchData = useCallback(async () => {
        const vechicleNum = steps.getRCNo.value;
        const queryUrl = `http://localhost:5000/fetchRCDetails`;

        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vechicleNum })
            });

            const data = await response.json();
            if (data.Result.ResponseVal === 1) {
                const displayInfo = data.Result.ResponseData;
                const rcDetailsDisplay = [
                    "Owner Name : " + displayInfo.OwnerName,
                    "RTO Code : " + displayInfo.RTOCode,
                    "Registration Number : " + displayInfo.RegistrationNo,
                    "Chasis Number : " + displayInfo.ChasisNo,
                ]
                setResult(rcDetailsDisplay);
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

export default RcExtract;