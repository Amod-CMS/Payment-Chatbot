import React, { useEffect, useState, useCallback } from "react";
import ChatBot from 'react-simple-chatbot';

let FirstName = "";

function MyChatbot() {
    const [setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    return (
        <>
            <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '20px' }}>
                    <input type="file" onChange={handleFileChange} accept=".pdf" />
                </div>
            </div>
            <ChatBot
                steps={[
                    {
                        id: '1',
                        message: 'Please enter your mobile number',
                        trigger: 'mobile-number-input',
                    },
                    {
                        id: 'mobile-number-input',
                        user: true,
                        trigger: 'fetch-rc',
                    },
                    {
                        id: 'fetch-rc',
                        component: <SendOTP />,
                        waitAction: true,
                        replace: true,
                        asMessage: true,
                    },
                    {
                        id: 'otpRead',
                        message: 'Enter the 6 digit OTP',
                        trigger: 'otpConfirm',
                    },
                    {
                        id: 'otpConfirm',
                        user: true,
                        trigger: 'confirm-otp',
                    },
                    {
                        id: 'confirm-otp',
                        component: <VerifyOTP />,
                        waitAction: true,
                        replace: true,
                        asMessage: true,
                    },
                    {
                        id: 'registration',
                        message: 'Please enter your first name.',
                        trigger: 'firstNameInp',
                    },
                    {
                        id: 'firstNameInp',
                        user: true,
                        trigger: 'lastName',
                    },
                    {
                        id: 'lastName',
                        message: 'Please enter your last name name.',
                        trigger: 'lastNameInp',
                    },
                    {
                        id: 'lastNameInp',
                        user: true,
                        trigger: 'pinCode',
                    },
                    {
                        id: 'pinCode',
                        message: 'Please enter your pincode.',
                        trigger: 'pinCodeInp',
                    },
                    {
                        id: 'pinCodeInp',
                        user: true,
                        trigger: 'userAdded',
                    },
                    {
                        id: 'userAdded',
                        component: <AddUser />,
                        waitAction: true,
                        replace: true,
                        asMessage: true,
                    },
                    {
                        id: 'payYesNo',
                        message: 'Would you like to proceed with payment?',
                        trigger: 'confirm-payment',
                    },
                    {
                        id: 'confirm-payment',
                        options: [
                            { value: 'yes', label: 'Yes', trigger: 'payment' },
                            { value: 'no', label: 'No', trigger: 'end' }
                        ],
                    },
                    {
                        id: 'payment',
                        message: 'Processing payment...',
                        trigger: 'end',
                    },
                    {
                        id: 'end',
                        message: 'Thank you for using our service!',
                        end: true,
                    },
                ]}
            />
        </>
    );
}

function SendOTP({ steps, triggerNextStep }) {
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const mobileNumber = steps['mobile-number-input'].value;
        // const userOTP = steps['otpConfirm'].value;
        const queryUrl = `http://localhost:5000//userOTP`;

        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobileNumber,
                    // userOTP
                })
            });

            const data = await response.json();
            console.log("line 92" + data);
            if (data.Result.ResponseVal === 1) {
                const displayInfo = data.Result.ResponseData;
                FirstName = displayInfo.FirstName;
                console.log(FirstName.length);
                if (displayInfo.FirstName) {
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
    }, [steps, triggerNextStep]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div>
            {loading ? <div>Loading...</div> : null}
        </div>
    );
}

function VerifyOTP({ steps, triggerNextStep }) {
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const userOTP = steps['otpConfirm'].value; // Correct step ID
        console.log("User OTP:", userOTP);
        const queryUrl = `http://localhost:5000/verifyOtp`;
        // const queryUrl = `http://localhost:5000/`;

        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userOTP })
            });

            const data = await response.json();
            console.log(typeof (data));
            console.log("Response from verifyOtp:", data);

            if (data === 1) {
                if (FirstName.length > 0) {
                    triggerNextStep({ trigger: 'payYesNo' });
                }
                else {
                    triggerNextStep({ trigger: 'registration' })
                }
            } else {
                triggerNextStep({ trigger: 'otpRead' });
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            triggerNextStep({ trigger: 'end' });
        } finally {
            setLoading(false);
        }
    }, [steps, triggerNextStep]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div>
            {loading ? <div>Loading...</div> : null}
        </div>
    );
}
function AddUser({ steps, triggerNextStep }) {
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const firstName = steps['firstNameInp'].value;
        const lastName = steps['lastNameInp'].value;
        const pinCode = steps['pinCodeInp'].value;

        console.log(firstName, lastName, pinCode);
        // const userOTP = steps['otpConfirm'].value;
        const queryUrl = `http://localhost:5000//addUser`;

        try {
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    pinCode
                })
            });

            const data = await response.json();
            console.log("line 92" + data);
            if (data.Result.ResponseVal === 1) {
                const displayInfo = data.Result.ResponseData;
                FirstName = displayInfo.FirstName;
                console.log(FirstName.length);
                if (displayInfo.FirstName) {
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
    }, [steps, triggerNextStep]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div>
            {loading ? <div>Loading...</div> : null}
        </div>
    );
}

export default MyChatbot;