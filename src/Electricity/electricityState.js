// Initialize with null or default values
let electricityBillDetails = null;

// Export functions to update and access the state
export const setElectricityBillDetails = (details) => {
    electricityBillDetails = details;
};

export const getElectricityBillDetails = () => electricityBillDetails;
