// This is a demo service to simulate Khalti payment flow for MVP/Testing
export const initiateKhaltiPayment = async ({ amount, purchase_id, purchase_name, onSussess, onError }) => {
  console.log(`Initiating Khalti payment for: ${amount} NPR`);
  
  // Simulate the SDK popup and delay
  return new Promise((resolve) => {
    // We simulate a successful payment after 1.5 seconds
    setTimeout(() => {
      const mockResult = {
        status: 'Completed',
        transaction_id: `KHALTI_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: amount,
        purchase_id: purchase_id
      };
      
      console.log("Mock Payment Successful:", mockResult);
      if (onSussess) onSussess(mockResult);
      resolve(mockResult);
    }, 1500);
  });
};
