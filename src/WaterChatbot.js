// IMPORTING THE REQUIRED LIBRARIES
import React, { useRef, useEffect, useState } from 'react';
import ChatBot /* { Loading } */ from 'react-simple-chatbot';
// import PropTypes from 'prop-types';
// IMPORTING ALL THE COMPONENTS
import PropertyTax from './Property/PropertyTax';
import PropertyCharges from './Property/PropertyCharges';
import RcExtract from './RC/RCExtract';
import RCDetails from './RC/RCAmount';
// import logo from './CMSlogo.png'
import FetchElectricityBill from './Electricity/BillDetails';
// import Dashboard from './Dashboard/Dashboard';
import PaymentComponent from './Payment/PaymentComponent';
import { OrderIDGeneratorRC } from './RC/RCorderID';
import { OrderIDGeneratorElectricity } from './Electricity/ElectricityOrderID';
import ElectricityPaymentDetails from './Charges/Charges';
import { Department, Service, ServiceCity } from './DataModel';
import OrderIDGeneratorPropertyTax from './Property/OrderID';

const UserIdRegex = /^\d{10}$/;
const ValidateElectricityBill = (value) => {
    if (!UserIdRegex.test(value)) {
        return 'Please enter a valid account number';
    }
    return true;
};

const RCIdExtract = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
const ValidateRcExtract = (value) => {
    if (!RCIdExtract.test(value)) {
        return 'Please enter a valid vehicle number';
    }
    return true;
};

const PIDregex = /^\d{1}$/;
const ValidatePropertyTax = (value) => {
    if (!PIDregex.test(value)) {
        return 'Please enter a valid PID';
    }
    return true;
};

function WaterCB() {
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/dashBoard', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic a29uZW1vYjprb25lbW9i',
                        'Content-Type': 'application/json',
                        'auth_userid': '148'
                    }
                });
                const data = await response.json();
                // console.log(data.Result.ResponseData[1])
                const mappedDepartments = data.Result.ResponseData.map(deptJson => {
                    const services = deptJson.Services.map(service => {
                        const serviceCities = service.ServiceCity.map(city => {
                            try {
                                var serviceCityModel = new ServiceCity(
                                    city.CityID,
                                    city.CityCode,
                                    city.ServiceCityImage,
                                    city.ServiceCityId,
                                    city.ServiceCityName,
                                    city.DuplicateCheckRequired,
                                    city.FetchAPIName,
                                    city.PaymentAPIName
                                );
                            } catch (error) {
                                console.log("error on serviceCityModel: ", error);
                            }
                            // console.log(serviceCityModel);
                            return serviceCityModel;
                        });

                        try {
                            var serviceModel = new Service(
                                service.ServiceName,
                                service.ServiceImage,
                                service.ServiceCode,
                                serviceCities
                            );
                        } catch (error) {
                            console.log("error on serviceModel: ", error);
                        }
                        

                        // console.log(serviceModel);
                        return serviceModel;
                    });
                    var deptModel = new Department(
                        deptJson.DeptCode,
                        deptJson.DeptName,
                        deptJson.DeptImage,
                        deptJson.ShortName,
                        deptJson.DisplayPop,
                        deptJson.isNew,
                        services
                    );

                    console.log(deptModel);
                    return deptModel;
                });
                console.log(mappedDepartments);
                setDepartments(mappedDepartments);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, []);

    const handleDeptCode = (deptCode) => {
        console.log(deptCode);
        switch (deptCode) {
            case 'Electricity':
                return 'area';
            case 144:
                return 'welcome'
            default:
                return 'welcome';
        }
    };

    const staticOptions = [
        { value: 'RC Extract', label: 'RC Extract', trigger: 'rcExtractConsumerID' },
    ];
    const myref = useRef(null);

    return (
        <div>
            {departments.length > 0 && (
                <ChatBot ref={myref}
                    // botAvatar={logo}
                    floating={true}
                    headerTitle="CMS PayBOT"
                    steps={[
                        {
                            id: 'payYesNo',
                            message: 'Would you like to proceed with payment?',
                            trigger: 'confirm-payment',
                        },
                        {
                            id: 'confirm-payment',
                            options: [
                                { value: 'yes', label: 'Yes', trigger: 'options' },
                                { value: 'no', label: 'No', trigger: 'welcome' }
                            ],
                        },
                        {
                            id: 'dashBoard',
                            // component: <ServiceList />,
                            trigger: 'options',
                            waitAction: true,
                            replace: true,
                            asMessage: true,
                            end: true
                        },
                        {
                            id: 'welcome',
                            message: 'Welcome to the M1/K1 bill payment bot. Which bill do you want to pay?',
                            trigger: 'options',
                            delay: 500,
                        },
                        {
                            id: 'options',
                            options: [
                                ...departments.map(department => ({
                                    value: department.ShortName,
                                    label: department.ShortName,
                                    trigger: handleDeptCode(department.isNew)
                                })),
                                ...staticOptions
                            ],
                        },
                        {
                            id: 'area',
                            message: "Select your area",
                            trigger: 'urbanRural'
                        },
                        {
                            id: 'urbanRural',
                            options: [
                                { value: 'Urban', label: 'Urban', trigger: 'providerMessage' },
                                { value: 'Rural', label: 'Rural', trigger: 'providerMessage' }]
                        },
                        {
                            id: 'providerMessage',
                            message: "Select your service provider",
                            trigger: 'serviceProvider'
                        },
                        {
                            id: 'serviceProvider',
                            options: [
                                ...departments.map(city => ({
                                    value: city.paymentAPIName,
                                    label: city.paymentAPIName,
                                    trigger: 'electricityConsumerID'
                                })),
                            ],
                        },
                        {
                            id: "electricityConsumerID",
                            message: "Please enter your consumer ID",
                            trigger: "getElectricityRegNo"
                        },
                        {
                            id: 'getElectricityRegNo',
                            user: true,
                            validator: ValidateElectricityBill,
                            trigger: 'fetchElectricityData',
                        },
                        {
                            id: 'fetchElectricityData',
                            message: 'Fetching bill details .....',
                            trigger: 'displayElectricityData',
                        },
                        {
                            id: 'displayElectricityData',
                            asMessage: true,
                            component: <FetchElectricityBill />,
                            waitAction: true,
                            delay: 2000,
                            trigger: 'displayDetailsElectricity',
                        },
                        {
                            id: 'displayDetailsElectricity',
                            asMessage: true,
                            component: <ElectricityPaymentDetails />,
                            waitAction: true,
                            delay: 2000,
                            trigger: 'PayOrNotElectricity',
                        },
                        {
                            id: 'anotherBill',
                            message: "Do you want to pay another bill?",
                            trigger: "otherBillOptions"
                        },
                        {
                            id: "otherBillOptions",
                            options: [
                                { value: 'yes', label: 'Yes', trigger: 'options' },
                                { value: 'no', label: 'No', trigger: 'noMessage' }
                            ],
                        },
                        {
                            id: 'PayOrNotElectricity',
                            message: 'Do you want to pay the bill?',
                            delay: 3000,
                            trigger: 'yesNoElectricity',
                        },
                        {
                            id: 'yesNoElectricity',
                            options: [
                                { value: 'Yes', label: 'YES', trigger: 'orderIDElectricity' },
                                { value: 'No', label: 'NO', trigger: 'noMessage' },
                            ],
                        },
                        {
                            id: "orderIDElectricity",
                            component: <OrderIDGeneratorElectricity />,
                            asMessage: true,
                            trigger: "paymentElectricity"
                        },
                        {
                            id: 'paymentElectricity',
                            component: <PaymentComponent />,
                            delay: 3000,
                            waitAction: true,
                            asMessage: true,
                        },
                        // Electricity bill payment ends

                        // RC Extract begins
                        {
                            id: "rcExtractConsumerID",
                            message: "Please enter your vehicle number",
                            trigger: "getRCNo"
                        },
                        {
                            id: 'getRCNo',
                            user: true,
                            validator: ValidateRcExtract,
                            trigger: 'fetchRCData',
                        },
                        {
                            id: 'fetchRCData',
                            message: 'Fetching fine details .....',
                            trigger: 'displayRCData',
                        },
                        {
                            id: 'displayRCData',
                            asMessage: true,
                            component: <RcExtract />,
                            waitAction: true,
                            delay: 2000,
                            trigger: 'displayDetailsRC'
                        },
                        {
                            id: 'displayDetailsRC',
                            asMessage: true,
                            component: <RCDetails />,
                            waitAction: true,
                            delay: 2000,
                            trigger: 'rcMessage',
                        },
                        {
                            id: "rcMessage",
                            message: "Do you want to pay for RC card",
                            trigger: 'yesNoRC'
                        },
                        {
                            id: 'yesNoRC',
                            options: [{ value: 'Yes', label: 'YES', trigger: 'orderIdRC' },
                            { value: 'No', label: 'NO', trigger: 'noMessage' },
                            ],
                        },
                        {
                            id: "orderIdRC",
                            component: <OrderIDGeneratorRC />,
                            asMessage: true,
                            trigger: "paymentRc"
                        },
                        {
                            id: 'paymentRc',
                            component: <PaymentComponent />,
                            delay: 3000,
                            waitAction: true,
                            asMessage: true,
                        },
                        // RC Extract ends
                        // Property Tax begins 
                        {
                            id: "propertyTaxId",
                            message: "Please enter your PID",
                            trigger: "getPID"
                        },
                        {
                            id: 'getPID',
                            user: true,
                            validator: ValidatePropertyTax,
                            trigger: 'fetchPropertyData',
                        },
                        {
                            id: 'fetchPropertyData',
                            message: 'Fetching property tax details .....',
                            trigger: 'displayPropertyData',
                        },
                        {
                            id: "displayPropertyData",
                            component: <PropertyTax />,
                            asMessage: true,
                            delay: 3000,
                            waitAction: true,
                            trigger: 'displayPropertyTax'
                        },
                        {
                            id: 'displayPropertyTax',
                            asMessage: true,
                            component: <PropertyCharges />,
                            waitAction: true,
                            delay: 2000,
                            trigger: 'propertyMessage',
                        },
                        {
                            id: "propertyMessage",
                            message: "Do you want to pay property tax",
                            trigger: 'yesNoPropertyTax'
                        },
                        {
                            id: 'yesNoPropertyTax',
                            options: [{ value: 'Yes', label: 'YES', trigger: 'orderIdProperty' },
                            { value: 'No', label: 'NO', trigger: 'noMessage' },
                            ],
                        },
                        {
                            id: "orderIdProperty",
                            component: <OrderIDGeneratorPropertyTax />,
                            asMessage: true,
                            trigger: "paymentProperty"
                        },
                        {
                            id: 'paymentProperty',
                            component: <PaymentComponent />,
                            delay: 3000,
                            waitAction: true,
                            asMessage: true,
                        },
                        // Property Tax ends
                        {
                            id: 'noMessage',
                            message: 'Thanks for using the chatbot, see you later!',
                        },
                    ]}
                />
            )}
        </div>
    );
}

export default WaterCB;