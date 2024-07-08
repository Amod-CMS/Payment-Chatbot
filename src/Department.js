// src/models/Department.js
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

export { Department, Service, ServiceCity };