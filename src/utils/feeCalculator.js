const FEE_CONFIG = {
  booking: 0.05,
  roommateMatch: 199,
  rentPayment: 0.02,
  depositHandling: 0.03,
};

export const calculateBookingFee = (rent) => ({
  rent,
  platformFee: Math.round(rent * FEE_CONFIG.booking),
  total: Math.round(rent + rent * FEE_CONFIG.booking),
  feePercent: "5%",
});

export const calculateRentFee = (share) => ({
  share,
  processingFee: Math.round(share * FEE_CONFIG.rentPayment),
  total: Math.round(share + share * FEE_CONFIG.rentPayment),
  feePercent: "2%",
});

export const calculateDepositFee = (deposit) => ({
  deposit,
  handlingFee: Math.round(deposit * FEE_CONFIG.depositHandling),
  total: Math.round(deposit + deposit * FEE_CONFIG.depositHandling),
  feePercent: "3%",
});

export { FEE_CONFIG };