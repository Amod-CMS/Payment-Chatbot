import React, { useCallback, useEffect, useState } from "react";

function Dashboard({ triggerNextStep }) {
    const [departments, setDepartments] = useState([]);
    const [serviceCity, setServiceCity] = useState([]);

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
                setDepartments(data.Result.ResponseData);

                const selectedDepartment = departments.find(department => department.DeptCode === 2);
                console.log(selectedDepartment);
                if (selectedDepartment && selectedDepartment.Services.length > 0) {
                    // Assuming each service could have multiple cities and we take the first for simplicity
                    const cityData = selectedDepartment.Services[0].ServiceCity[0];
                    const cityDetails = {
                        cityCode: cityData.CityCode,
                        cityID: cityData.CityID,
                        serviceCityId: cityData.ServiceCityId
                    };
                    console.log(cityDetails);
                }
                if (data.Result && data.Result.ResponseData && data.Result.ResponseData[1].Services[0].ServiceCity) {
                    setServiceCity(data.Result.ResponseData[1].Services[0].ServiceCity);
                    triggerNextStep();
                    console.log(data.Result.ResponseData);
                    console.log(data.Result.ResponseData[0].Services[0].ServiceCity[0].CityID);
                    console.log(data.Result.ResponseData[0].Services[0].ServiceCity[0].ServiceCityId);
                } else {
                    console.error('Data structure is not as expected.');
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, []);

    const handleDeptCode = (deptCode) => {
        switch (deptCode) {
            // Electricity
            case 2:
                return 'area';
            case 144:
                return 'welcome'
            default:
                return 'welcome';
        }
    };
}

export default Dashboard;