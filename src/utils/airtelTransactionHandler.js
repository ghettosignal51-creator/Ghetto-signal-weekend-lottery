/**
 * Airtel Uganda Transaction Handler
 * Handles deduction of 50 shillings for Airtel Uganda users
 * on every withdrawal or deposit transaction
 */

class AirtelTransactionHandler {
  constructor() {
    this.AIRTEL_FEE = 50; // 50 shillings
    this.AIRTEL_NUMBER = '0743712691';
    this.COUNTRY = 'Uganda';
    this.NETWORK = 'Airtel';
  }

  /**
   * Check if user is in Uganda using Airtel and has accepted terms
   * @param {Object} user - User object containing country, network, and terms acceptance
   * @returns {boolean} - True if user qualifies for fee deduction
   */
  isAirtelUgandaUser(user) {
    return (
      user &&
      user.country === this.COUNTRY &&
      user.network === this.NETWORK &&
      user.acceptedTermsAndConditions === true
    );
  }

  /**
   * Process a transaction (deposit or withdrawal)
   * Deducts 50 shillings if user is Airtel Uganda and accepted T&Cs
   * @param {Object} transaction - Transaction object
   * @param {number} transaction.amount - Transaction amount
   * @param {string} transaction.type - 'deposit' or 'withdrawal'
   * @param {Object} user - User object
   * @returns {Object} - Transaction result with fee applied if applicable
   */
  processTransaction(transaction, user) {
    const result = {
      originalAmount: transaction.amount,
      transactionType: transaction.type,
      feeApplied: false,
      fee: 0,
      finalAmount: transaction.amount,
      successMessage: '',
      errorMessage: ''
    };

    // Check if user qualifies for fee deduction
    if (!this.isAirtelUgandaUser(user)) {
      result.successMessage = `Transaction processed. Amount: ${transaction.amount} UGX`;
      return result;
    }

    // Apply fee for Airtel Uganda users
    result.feeApplied = true;
    result.fee = this.AIRTEL_FEE;
    result.finalAmount = transaction.amount - this.AIRTEL_FEE;

    // Validate that final amount is not negative
    if (result.finalAmount < 0) {
      result.errorMessage = `Insufficient amount. Minimum amount needed: ${this.AIRTEL_FEE + 1} UGX`;
      result.feeApplied = false;
      result.finalAmount = transaction.amount;
      return result;
    }

    result.successMessage = `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} processed. Amount: ${result.originalAmount} UGX. Airtel fee deducted: ${result.fee} UGX. Final amount: ${result.finalAmount} UGX. Sent to ${this.AIRTEL_NUMBER}`;

    return result;
  }

  /**
   * Process a withdrawal
   * @param {number} amount - Withdrawal amount
   * @param {Object} user - User object
   * @returns {Object} - Transaction result
   */
  processWithdrawal(amount, user) {
    return this.processTransaction({ amount, type: 'withdrawal' }, user);
  }

  /**
   * Process a deposit
   * @param {number} amount - Deposit amount
   * @param {Object} user - User object
   * @returns {Object} - Transaction result
   */
  processDeposit(amount, user) {
    return this.processTransaction({ amount, type: 'deposit' }, user);
  }

  /**
   * Get user information summary for Airtel Uganda users
   * @param {Object} user - User object
   * @returns {Object} - User info with fee details
   */
  getUserFeeSummary(user) {
    const isAirtelUser = this.isAirtelUgandaUser(user);
    return {
      country: user.country || 'Unknown',
      network: user.network || 'Unknown',
      acceptedTerms: user.acceptedTermsAndConditions || false,
      isAirtelUgandaUser,
      applicableFee: isAirtelUser ? this.AIRTEL_FEE : 0,
      feeRecipientNumber: this.AIRTEL_NUMBER,
      feeDescription: isAirtelUser
        ? `Airtel Uganda fee: ${this.AIRTEL_FEE} UGX per transaction`
        : 'No fees applicable'
    };
  }
}

export default new AirtelTransactionHandler();
