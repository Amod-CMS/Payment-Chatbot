import React, { useState, useEffect, useRef } from 'react';
import ChatBot from 'react-simple-chatbot';
import ServiceList from './ServiceList'; // Adjust the path according to your file structure
// //////////////////////////////////////////////////////////////////////////////////////////

// IMPORTING THE REQUIRED LIBRARIES
// import PropTypes from 'prop-types';
// IMPORTING ALL THE COMPONENTS
import RcExtract from '../RC/RCExtract';
import RCDetails from '../RC/RCAmount';
// import logo from './CMSlogo.png'
import FetchElectricityBill from '../Electricity/BillDetails';
// import Dashboard from './Dashboard/Dashboard';
import PaymentComponent from '../Payment/PaymentComponent';
import PaymentComponentElectricity from '../Payment/ElectricityPayment';
import { OrderIDGeneratorElectricity } from '../Electricity/ElectricityOrderID';
import ElectricityPaymentDetails from '../Charges/Charges';
import { OrderIDGeneratorRC } from '../OrderID/orderID';
// import ElectricityPaymentDetails from './Charges/Charges';

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

class ServiceCity {
    constructor(cityID, cityCode, serviceCityImage, serviceCityId, serviceCityName, duplicateCheckRequired, fetchAPIName, paymentAPIName) {
        this.cityID = cityID;
        this.cityCode = cityCode;
        this.serviceCityImage = serviceCityImage;
        this.serviceCityId = serviceCityId;
        this.serviceCityName = serviceCityName;
        this.duplicateCheckRequired = duplicateCheckRequired;
        this.fetchAPIName = fetchAPIName;
        this.paymentAPIName = paymentAPIName;
    }
}

class Service {
    constructor(serviceName, serviceImage, serviceCode, serviceCities) {
        this.serviceName = serviceName;
        this.serviceImage = serviceImage;
        this.serviceCode = serviceCode;
        this.serviceCities = serviceCities.map(city => new ServiceCity(
            city.CityID,
            city.CityCode,
            city.ServiceCityImage,
            city.ServiceCityId,
            city.ServiceCityName,
            city.DuplicateCheckRequired,
            city.FetchAPIName,
            city.PaymentAPIName
        ));
    }
}

class Department {
    constructor(deptCode, deptName, deptImage, shortName, displayPop, isNew, services) {
        this.deptCode = deptCode;
        this.deptName = deptName;
        this.deptImage = deptImage;
        this.shortName = shortName;
        this.displayPop = displayPop;
        this.isNew = isNew;
        this.services = services.map(service => new Service(
            service.ServiceName,
            service.ServiceImage,
            service.ServiceCode,
            service.ServiceCity
        ));
    }
}

function MainComponent() {
    const [departments, setDepartments] = useState([]);
    const myref = useRef(null);

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
                console.log(data);
                if (data.Result && Array.isArray(data.Result.ResponseData)) {
                    const mappedDepartments = data.Result.ResponseData.map(dept => new Department(
                        dept.DeptCode,
                        dept.DeptName,
                        dept.DeptImage,
                        dept.ShortName,
                        dept.DisplayPop,
                        dept.isNew,
                        dept.Services
                    ));

                    setDepartments(mappedDepartments);
                } else {
                    console.error('Unexpected data structure:', data);
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, []);

    const handleDeptCode = (deptCode) => {
        switch (deptCode) {
            // case 144:
            //     return 'SSLC';
            case 2:
                return 'Electricity_Area';
            // case 1:
            //     return 'WaterBill';
            // case 20:
            //     return 'TrafficFine';
            // case 140:
            //     return 'VidhanaSoudhaPass';
            // case 143:
            //     return 'PUC';
            default:
                return 'welcome';
        }
    };

    const staticOptions = [
        { value: 'RC Extract', label: 'RC Extract', trigger: 'rcExtractConsumerID' },
    ];

    return (
        <div>
            {departments.length > 0 && (
                <ChatBot
                    ref={myref}
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
                            id: 'welcome',
                            message: 'Welcome to the M1/K1 bill payment bot. Which bill do you want to pay?',
                            trigger: 'options',
                            delay: 500,
                        },
                        {
                            id: 'options',
                            options: [
                                ...departments.map(department => ({
                                    value: department.shortName,
                                    label: department.shortName,
                                    trigger: handleDeptCode(department.deptCode)
                                })),
                                ...staticOptions
                            ],
                        },
                        {
                            id: 'Electricity_Area',
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
                                ...departments.find(dept => dept.deptCode === 2).services[0].serviceCities.map(city => ({
                                    value: city.serviceCityName,
                                    label: city.serviceCityName,
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
                            component: <PaymentComponentElectricity />,
                            delay: 3000,
                            waitAction: true,
                            asMessage: true,
                        },
                        // // // //
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

                        {
                            id: 'noMessage',
                            message: 'Thanks for using the chatbot, see you later!',
                        },
                        {
                            id: 'dashBoard',
                            component: <ServiceList departments={departments} />,
                            waitAction: true,
                            replace: true,
                            asMessage: true,
                            end: true
                        },
                        {
                            id: 'waterBill',
                            message: 'Water bill payment flow...',
                            end: true,
                        },
                        {
                            id: 'gasBill',
                            message: 'Gas bill payment flow...',
                            end: true,
                        },
                    ]}
                />
            )}
        </div>
    );
}

export default MainComponent;